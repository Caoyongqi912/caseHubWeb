import { IModule } from '@/api';
import { queryTreeModuleByProject } from '@/api/base';
import { getPlanInfo } from '@/api/case/caseplan';
import { pageTestCase } from '@/api/case/testCase';
import { toValueEnum } from '@/pages/CaseHub/hooks/caseEnumOption';
import { useCaseEnumConfig } from '@/pages/CaseHub/hooks/useCaseEnumConfig';
import { useCaseLevelColorMap } from '@/pages/CaseHub/hooks/useCaseLevelColor';
import { useCaseHubTheme } from '@/pages/CaseHub/styles';
import { ITestCase } from '@/pages/CaseHub/types';
import { ModuleEnum } from '@/utils/config';
import { pageData } from '@/utils/somefunc';
import {
  DownOutlined,
  FilterOutlined,
  FolderOpenOutlined,
  SearchOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
} from '@ant-design/icons';
import {
  ActionType,
  ProCard,
  ProColumns,
  ProTable,
} from '@ant-design/pro-components';
import {
  Button,
  Checkbox,
  Input,
  message,
  Popover,
  Select,
  Space,
  Spin,
  Tag,
  Tree,
} from 'antd';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import type { DataNode } from 'antd/es/tree';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useModuleCaseSelectorStyles } from './styles';

interface ModuleCaseSelectorProps {
  /** 计划 ID（用于内部反查 project_id） */
  planId?: string | number;
  /** 当前项目 ID（用于模块树 + 用例列表查询）；若未传则从 planId 反查 */
  projectId?: number;
  /** 计划模块 ID（仅显示用，不参与筛选） */
  planModuleId?: number | null;
  /** 项目/库名称，用于 header 副标题；默认从 planId 反查 */
  projectName?: string;
  /**
   * 确认按钮回调：把用户选中的"源项目模块 ID"+"用例 ID"一起抛给父组件
   * - moduleIds: 左侧选中的源项目模块（用于后端按目录复制/匹配计划分组）
   * - caseIds: 右侧勾选的用例
   */
  onConfirm: (
    caseIds: number[],
    options: { moduleIds: number[]; mergeSameGroup: boolean },
  ) => Promise<void> | void;
  /** 取消按钮回调 */
  onCancel?: () => void;
}

/**
 * 收集整棵树下所有模块 key（用于"全选"）
 * 同时返回 key -> IModule 的索引，便于后续 O(1) 查找
 */
const collectDescendantKeys = (
  modules: IModule[],
): { keys: number[]; byKey: Map<number, IModule> } => {
  const keys: number[] = [];
  const byKey = new Map<number, IModule>();
  const walk = (list: IModule[]) => {
    list.forEach((m) => {
      keys.push(m.key);
      byKey.set(m.key, m);
      if (m.children && m.children.length) walk(m.children);
    });
  };
  walk(modules);
  return { keys, byKey };
};

/**
 * 收集一个节点的所有后代 key（含自身）
 */
const collectNodeDescendants = (node: IModule): number[] => {
  const keys: number[] = [node.key];
  const walk = (n: IModule) => {
    if (n.children && n.children.length) {
      n.children.forEach((c) => {
        keys.push(c.key);
        walk(c);
      });
    }
  };
  walk(node);
  return keys;
};

/**
 * 将 IModule 列表转 antd Tree 所需的 DataNode
 * 后端返回时已附 count 字段
 */
const buildTreeData = (modules: IModule[]): DataNode[] =>
  modules.map((m) => ({
    key: m.key,
    title: m.title,
    count: (m as any).count,
    children: m.children ? buildTreeData(m.children) : undefined,
  }));

/**
 * 模块树中"标题渲染函数"——把节点名称 + count 徽章一并渲染
 */
type ModuleDataNode = DataNode & { count?: number };
const renderModuleTitle = (node: ModuleDataNode) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      overflow: 'hidden',
    }}
  >
    <span
      style={{
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        maxWidth: 160,
      }}
    >
      {node.title as string}
    </span>
    {typeof node.count === 'number' && node.count > 0 && (
      <span
        style={{
          fontSize: 11,
          color: 'var(--text-tertiary, rgba(0,0,0,0.45))',
          background: 'var(--bg-elevated, #fafafa)',
          padding: '0 6px',
          borderRadius: 999,
          border: '1px solid var(--border-secondary, #f0f0f0)',
          lineHeight: '16px',
          flexShrink: 0,
        }}
      >
        {node.count}
      </span>
    )}
  </div>
);

const ModuleCaseSelector: FC<ModuleCaseSelectorProps> = ({
  planId,
  projectId: projectIdProp,
  projectName: projectNameProp,
  onConfirm,
  onCancel,
}) => {
  // 内部反查：planId -> project_id / projectName
  const [resolvedProjectId, setResolvedProjectId] = useState<
    number | undefined
  >(projectIdProp);
  const [resolvedProjectName, setResolvedProjectName] = useState<string>(
    projectNameProp || '默认用例库',
  );
  const [planInfoLoaded, setPlanInfoLoaded] = useState(false);

  useEffect(() => {
    if (projectIdProp !== undefined) {
      setResolvedProjectId(projectIdProp);
      // 父组件已传 projectId,无需反查 planInfo,直接标记已加载,
      // 否则下方 [planInfoLoaded] 守着的 loadModules() 永远不触发
      setPlanInfoLoaded(true);
    } else if (planId) {
      getPlanInfo(Number(planId)).then(({ code, data }) => {
        if (code === 0 && data) {
          setResolvedProjectId(data.project_id);
          if (!projectNameProp) {
            setResolvedProjectName(data.plan_name || '默认用例库');
          }
        }
        setPlanInfoLoaded(true);
      });
    } else {
      setPlanInfoLoaded(true);
    }
  }, [planId, projectIdProp, projectNameProp]);

  // 兼容：当 caller 显式传入时优先使用，否则用反查值
  const projectId = projectIdProp ?? resolvedProjectId;
  const projectName = projectNameProp ?? resolvedProjectName;
  const styles = useModuleCaseSelectorStyles();
  const { colors, borderRadius } = styles;
  const { token } = useCaseHubTheme();
  const levelColorMap = useCaseLevelColorMap();
  const spacing_sm = 8;

  /* -------------------- 枚举配置 -------------------- */
  const { options: levelOptions } = useCaseEnumConfig('CASE_LEVEL');
  const levelValueEnum = useMemo(
    () => toValueEnum(levelOptions),
    [levelOptions],
  );
  const { options: typeOptions } = useCaseEnumConfig('CASE_TYPE');
  const typeValueEnum = useMemo(() => toValueEnum(typeOptions), [typeOptions]);

  /* -------------------- 模块树状态 -------------------- */
  const [modules, setModules] = useState<IModule[]>([]);
  const [moduleLoading, setModuleLoading] = useState(false);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [checkedModuleKeys, setCheckedModuleKeys] = useState<React.Key[]>([]);
  const [moduleKeyword, setModuleKeyword] = useState('');

  /* -------------------- 用例表格状态 -------------------- */
  const actionRef = useRef<ActionType>();
  const [caseList, setCaseList] = useState<ITestCase[]>([]);
  const [selectedCaseIds, setSelectedCaseIds] = useState<Set<number>>(
    new Set(),
  );
  const [caseKeyword, setCaseKeyword] = useState('');
  /** 排序方向：'ascend' = 最早（创建时间升序）; 'descend' = 最新（创建时间降序，默认） */
  const [sortOrder, setSortOrder] = useState<'ascend' | 'descend'>('descend');

  // 用户点击"最早 / 最新"图标时主动 reload，确保后端按新方向排序
  useEffect(() => {
    actionRef.current?.reloadAndRest?.();
  }, [sortOrder]);
  /** 筛选：等级 / 类型 */
  const [filterLevel, setFilterLevel] = useState<string | undefined>();
  const [filterType, setFilterType] = useState<string | undefined>();
  const [filterOpen, setFilterOpen] = useState(false);
  const [tempFilterLevel, setTempFilterLevel] = useState<string | undefined>();
  const [tempFilterType, setTempFilterType] = useState<string | undefined>();

  /* -------------------- Footer 状态 -------------------- */
  const [mergeSameGroup, setMergeSameGroup] = useState(false);
  const [confirming, setConfirming] = useState(false);

  /* -------------------- 模块树加载 -------------------- */
  const loadModules = useCallback(async () => {
    if (!projectId) {
      setModules([]);
      return;
    }
    setModuleLoading(true);
    try {
      const { code, data } = await queryTreeModuleByProject(
        projectId,
        ModuleEnum.CASE,
      );
      if (code === 0 && data) {
        setModules(data);
        // 默认展开第一层
        setExpandedKeys(data.map((m) => m.key));
      }
    } catch (e) {
      message.error('模块加载失败');
    } finally {
      setModuleLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (!planInfoLoaded) return;
    loadModules();
    // 切换项目时清空之前的选择
    setCheckedModuleKeys([]);
    setSelectedCaseIds(new Set());
  }, [loadModules, planInfoLoaded]);

  /* -------------------- 树渲染数据 -------------------- */
  const treeData = useMemo(() => buildTreeData(modules), [modules]);

  const filteredTreeData = useMemo(() => {
    if (!moduleKeyword.trim()) return treeData;
    const kw = moduleKeyword.trim().toLowerCase();
    const filter = (nodes: DataNode[]): DataNode[] => {
      const result: DataNode[] = [];
      nodes.forEach((node) => {
        const titleMatch =
          typeof node.title === 'string' &&
          node.title.toLowerCase().includes(kw);
        const filteredChildren = node.children
          ? filter(node.children)
          : undefined;
        if (titleMatch || (filteredChildren && filteredChildren.length > 0)) {
          result.push({ ...node, children: filteredChildren });
        }
      });
      return result;
    };
    return filter(treeData);
  }, [treeData, moduleKeyword]);

  // 关键字变化时自动展开命中节点
  useEffect(() => {
    if (!moduleKeyword.trim()) return;
    const kw = moduleKeyword.trim().toLowerCase();
    const keys: React.Key[] = [];
    const walk = (nodes: DataNode[]) => {
      nodes.forEach((n) => {
        if (typeof n.title === 'string' && n.title.toLowerCase().includes(kw)) {
          keys.push(n.key);
        }
        if (n.children) walk(n.children);
      });
    };
    walk(filteredTreeData);
    setExpandedKeys((prev) => Array.from(new Set([...prev, ...keys])));
  }, [moduleKeyword, filteredTreeData]);

  /* -------------------- 树操作 -------------------- */
  // 整棵模块树的扁平 key 列表 + key -> IModule 索引
  const { allModuleKeys, moduleByKey } = useMemo(() => {
    const out = collectDescendantKeys(modules ?? []);
    return { allModuleKeys: out.keys, moduleByKey: out.byKey };
  }, [modules]);
  // 防御性兜底
  const safeAllModuleKeys: React.Key[] = Array.isArray(allModuleKeys)
    ? allModuleKeys
    : [];
  const safeCheckedModuleKeys: React.Key[] = Array.isArray(checkedModuleKeys)
    ? checkedModuleKeys
    : [];

  /**
   * 把"已勾选 key 集合"展开成"被覆盖的叶子 key 集合"
   * - 选中某内部节点 -> 该节点所有后代叶子视为覆盖
   * - 选中叶子 -> 自身视为覆盖
   * 这样右侧 case 列表的 module_ids 永远是叶子 id，符合后端 page_by_module 的语义
   */
  const coveredLeafKeys = useMemo<Set<number>>(() => {
    const out = new Set<number>();
    if (!moduleByKey) return out;
    safeCheckedModuleKeys.forEach((k) => {
      const node = moduleByKey.get(Number(k));
      if (!node) return;
      collectNodeDescendants(node).forEach((ck) => out.add(ck));
    });
    return out;
  }, [safeCheckedModuleKeys, moduleByKey]);

  // 是否"全选"：所有叶子都被覆盖即可
  const allLeafKeys = useMemo<number[]>(() => {
    const out: number[] = [];
    const walk = (list: IModule[]) => {
      list.forEach((m) => {
        const isLeaf = !m.children || m.children.length === 0;
        if (isLeaf) out.push(m.key);
        else walk(m.children);
      });
    };
    walk(modules ?? []);
    return out;
  }, [modules]);

  const isAllModuleSelected =
    allLeafKeys.length > 0 && allLeafKeys.every((k) => coveredLeafKeys.has(k));

  const isModuleIndeterminate =
    coveredLeafKeys.size > 0 && coveredLeafKeys.size < allLeafKeys.length;

  const handleSelectAllModules = (e: CheckboxChangeEvent) => {
    if (e.target.checked) {
      // 全选 = 把所有内部+叶子都勾上（视觉一致）
      setCheckedModuleKeys(safeAllModuleKeys);
    } else {
      setCheckedModuleKeys([]);
    }
  };

  /**
   * 树勾选回调（checkStrictly 模式）。
   * - 自动向下传播：勾选/取消父节点时,所有后代(子、孙子...)也跟随
   *   勾选/取消,避免漏选深层目录
   * - 自动向上传播：当某个父节点的所有直接子节点都被勾选时，自动勾选该父节点
   * - 取消子节点时，之前因"全子节点勾选"而自动勾选的父节点会自动取消
   * - 右侧 case 列表的 module_ids 仍由 coveredLeafKeys 派生
   */
  const handleModuleCheck = (
    info:
      | React.Key[]
      | { checked: React.Key[]; halfChecked: React.Key[] }
      | undefined
      | null,
  ) => {
    if (!info) {
      setCheckedModuleKeys([]);
      return;
    }

    let userChecked: React.Key[];
    if (Array.isArray(info)) {
      userChecked = info;
    } else if (typeof info === 'object' && Array.isArray(info.checked)) {
      userChecked = info.checked;
    } else {
      setCheckedModuleKeys([]);
      return;
    }

    // 向下传播: 对比前后状态,对新增/移除的 key 级联到所有后代
    // (checkStrictly 模式下 Tree 不会自动联动,需要手动补)
    const prevSet = new Set<React.Key>(safeCheckedModuleKeys);
    const nextSet = new Set<React.Key>(userChecked);

    for (const key of nextSet) {
      if (!prevSet.has(key)) {
        const node = moduleByKey.get(Number(key));
        if (node) {
          collectNodeDescendants(node).forEach((d) => nextSet.add(d));
        }
      }
    }
    for (const key of prevSet) {
      if (!nextSet.has(key)) {
        const node = moduleByKey.get(Number(key));
        if (node) {
          collectNodeDescendants(node).forEach((d) => nextSet.delete(d));
        }
      }
    }

    // 向上自动勾选：若父节点的所有直接子节点都在勾选集合中，则自动勾选父节点
    const finalChecked = new Set<React.Key>(nextSet);

    const getDepth = (key: number): number => {
      let depth = 0;
      let node = moduleByKey.get(key);
      while (node?.parent_id) {
        depth++;
        node = moduleByKey.get(node.parent_id);
      }
      return depth;
    };

    // 按深度从大到小排序，先处理叶子节点，再逐层向上传播
    const sortedKeys = Array.from(finalChecked).sort(
      (a, b) => getDepth(Number(b)) - getDepth(Number(a)),
    );

    for (const key of sortedKeys) {
      let currentKey: number | undefined = moduleByKey.get(
        Number(key),
      )?.parent_id;
      while (currentKey !== undefined) {
        const parent = moduleByKey.get(currentKey);
        if (!parent || !parent.children || parent.children.length === 0) break;

        const allChildrenChecked = parent.children.every((child) =>
          finalChecked.has(child.key),
        );

        if (allChildrenChecked) {
          if (!finalChecked.has(parent.key)) {
            finalChecked.add(parent.key);
          }
          currentKey = parent.parent_id;
        } else {
          break;
        }
      }
    }

    setCheckedModuleKeys(Array.from(finalChecked));
  };

  // 选中模块变更时刷新表格
  useEffect(() => {
    setSelectedCaseIds(new Set());
    actionRef.current?.reloadAndRest?.();
  }, [checkedModuleKeys]);

  /* -------------------- 用例表格 -------------------- */

  /**
   * ProTable 的 request 适配：把 antd ProTable 的 params 转成后端 pageTestCase 入参
   * 支持 project_id + module_id / module_ids 过滤
   * - 选中 1 个模块：传 module_id（保留旧接口兼容）
   * - 选中 ≥2 个模块：传 module_ids（后端展开每个模块的子节点后求并集）
   */
  // 使用"被覆盖的叶子 key"作为筛选条件（后端 page_by_module 会再展开子节点，行为兼容）
  const leafIds = useMemo(() => Array.from(coveredLeafKeys), [coveredLeafKeys]);

  const fetchPageData = useCallback(
    async (params: any, sort: any) => {
      const baseParams = {
        ...params,
        case_name: params?.case_name || caseKeyword || undefined,
        is_common: true,
        project_id: projectId,
        module_type: ModuleEnum.CASE,
        sort: sort,
        case_level: filterLevel,
        case_type: filterType,
      };

      // 避免和 module_id 同时传（后端会同时收到导致困惑）
      let values: Record<string, unknown>;
      if (leafIds.length === 0) {
        values = baseParams;
      } else if (leafIds.length === 1) {
        values = { ...baseParams, module_id: leafIds[0] };
      } else {
        values = { ...baseParams, module_ids: leafIds };
      }

      const { code, data } = await pageTestCase(values);
      return pageData(code, data);
    },
    [leafIds, projectId, caseKeyword, filterLevel, filterType],
  );

  // 搜索关键字 / 筛选条件变化时重新拉取（带短防抖）
  // 注意：ProTable 的 request 引用变化不会自动触发 reload，
  // 必须在外部状态变化后显式调用 actionRef.current?.reloadAndRest
  // 不能直接同步 reload，会和"勾选模块时"的 reload 抢跑导致请求参数错位
  useEffect(() => {
    const timer = setTimeout(() => {
      actionRef.current?.reloadAndRest?.();
    }, 80);
    return () => clearTimeout(timer);
  }, [caseKeyword, filterLevel, filterType]);

  const columns: ProColumns<ITestCase>[] = useMemo(
    () => [
      {
        title: 'ID',
        dataIndex: 'uid',
        width: 90,
        render: (_, record) => (
          <Tag
            style={{
              background: colors.primaryBg,
              borderColor: colors.primary,
              color: colors.primary,
              borderRadius: borderRadius.md,
              fontWeight: 500,
              margin: 0,
            }}
          >
            {record.uid}
          </Tag>
        ),
      },
      {
        title: '用例名称',
        dataIndex: 'case_name',
        ellipsis: true,
      },
      {
        title: '等级',
        dataIndex: 'case_level',
        width: 80,
        render: (_, record) => {
          if (!record.case_level) {
            return <span style={{ color: colors.textTertiary }}>-</span>;
          }
          const levelColors = levelColorMap.get(record.case_level) ||
            levelColorMap.get('P3') || {
              bg: token.colorFillAlter,
              border: token.colorBorderSecondary,
              text: token.colorTextSecondary,
            };
          return (
            <Tag
              style={{
                background: levelColors.bg,
                borderColor: levelColors.border,
                color: levelColors.text,
                borderRadius: borderRadius.sm,
                fontWeight: 600,
                margin: 0,
              }}
            >
              {record.case_level}
            </Tag>
          );
        },
      },
      {
        title: '创建人',
        dataIndex: 'creatorName',
        width: 110,
        render: (text) => (
          <span style={{ color: colors.textSecondary }}>{text}</span>
        ),
      },
      {
        title: '创建时间',
        dataIndex: 'create_time',
        valueType: 'dateTime',
        width: 160,
        sorter: true,
        sortOrder,
        defaultSortOrder: 'descend',
      },
    ],
    [colors, levelColorMap, token, borderRadius],
  );

  /**
   * 把 ProTable 行选择映射回 selectedCaseIds Set
   * - selectedRowKeys 用 case id 字符串
   * - 当前页命中的 id 全部勾上，未命中的（来自其他页/旧状态）保留
   */
  const handleRowSelectChange = (
    keys: React.Key[],
    rows: ITestCase[],
    info: { type: 'all' | 'single' },
  ) => {
    // 防御性：rows 可能在边界情况下为 undefined
    const safeRows = rows ?? [];
    setSelectedCaseIds((prev) => {
      const next = new Set<number>(prev);
      if (info?.type === 'all') {
        // 全选/取消全选：把当前列表的 id 全部勾上或全部取消
        if (keys.length > 0) {
          safeRows.forEach((r) => {
            if (r.id !== undefined) next.add(r.id);
          });
        } else {
          safeRows.forEach((r) => {
            if (r.id !== undefined) next.delete(r.id);
          });
        }
      } else {
        // 单行切换：以 safeRows 中存在与否判断
        safeRows.forEach((r) => {
          if (r.id !== undefined) {
            if (keys.includes(r.id)) next.add(r.id);
            else next.delete(r.id);
          }
        });
      }
      return next;
    });
  };

  // 防御性：onLoad 在 ProTable 重载边界可能传 undefined
  const safeCaseList = caseList ?? [];
  const isAllCaseSelected =
    safeCaseList.length > 0 &&
    safeCaseList.every(
      (tc) => tc.id !== undefined && selectedCaseIds.has(tc.id),
    );

  const isCaseIndeterminate = selectedCaseIds.size > 0 && !isAllCaseSelected;

  const handleSelectAllCases = (e: CheckboxChangeEvent) => {
    const list = caseList ?? [];
    if (e.target.checked) {
      const next = new Set<number>(selectedCaseIds);
      list.forEach((tc) => {
        if (tc.id !== undefined) next.add(tc.id);
      });
      setSelectedCaseIds(next);
    } else {
      // 取消全选 = 取消当前页所有
      const next = new Set<number>(selectedCaseIds);
      list.forEach((tc) => {
        if (tc.id !== undefined) next.delete(tc.id);
      });
      setSelectedCaseIds(next);
    }
  };

  /* -------------------- 提交 -------------------- */
  const handleConfirm = async () => {
    if (selectedCaseIds.size === 0) {
      message.warning('请至少选择一个用例');
      return;
    }
    setConfirming(true);
    try {
      // 只传用户实际勾选的模块 ID，不自动展开后代
      const moduleIds = safeCheckedModuleKeys.map((k) => Number(k));
      await onConfirm(Array.from(selectedCaseIds), {
        moduleIds,
        mergeSameGroup,
      });
    } finally {
      setConfirming(false);
    }
  };

  /* -------------------- 渲染 -------------------- */
  return (
    <div style={styles.container()}>
      {/* Header */}
      <div style={styles.headerBar()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={styles.titleText()}>规划用例</span>
          <span style={styles.libraryChip()}>
            <FolderOpenOutlined style={{ fontSize: 12 }} />
            {projectName}
            <DownOutlined style={{ fontSize: 10 }} />
          </span>
        </div>
        <span
          style={{ color: colors.textTertiary, fontSize: 12, fontWeight: 400 }}
        >
          从用例库中挑选用例添加到当前计划
        </span>
      </div>

      {/* Toolbar */}
      <div style={styles.toolbarRow()}>
        <div style={styles.searchWrap()}>
          <Input
            allowClear
            prefix={<SearchOutlined style={{ color: colors.textTertiary }} />}
            placeholder="搜索分组"
            value={moduleKeyword}
            onChange={(e) => setModuleKeyword(e.target.value)}
            style={{ borderRadius: borderRadius.md }}
          />
        </div>
        <div style={styles.searchWrap()}>
          <Input
            allowClear
            prefix={<SearchOutlined style={{ color: colors.textTertiary }} />}
            placeholder="搜索用例"
            value={caseKeyword}
            onChange={(e) => setCaseKeyword(e.target.value)}
            style={{ borderRadius: borderRadius.md }}
          />
        </div>
        <Space size={4}>
          {/* 排序：点击切换"最早 / 最新" */}
          <span
            style={{
              ...styles.toolbarRight(),
              color: colors.primary,
            }}
            onClick={() =>
              setSortOrder((prev) => (prev === 'ascend' ? 'descend' : 'ascend'))
            }
            title="点击切换排序方向"
          >
            {sortOrder === 'ascend' ? (
              <SortAscendingOutlined style={{ fontSize: 13 }} />
            ) : (
              <SortDescendingOutlined style={{ fontSize: 13 }} />
            )}
            {sortOrder === 'ascend' ? '最早' : '最新'}
          </span>

          {/* 筛选：点击打开 Popover */}
          <Popover
            trigger="click"
            open={filterOpen}
            onOpenChange={(open) => {
              setFilterOpen(open);
              if (open) {
                setTempFilterLevel(filterLevel);
                setTempFilterType(filterType);
              }
            }}
            placement="bottomRight"
            content={
              <div
                style={{
                  width: 260,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 12,
                      color: colors.textSecondary,
                      marginBottom: 4,
                    }}
                  >
                    等级
                  </div>
                  <Select
                    allowClear
                    placeholder="选择等级"
                    value={tempFilterLevel}
                    onChange={setTempFilterLevel}
                    style={{ width: '100%' }}
                    options={levelOptions.map((o) => ({
                      value: o.value,
                      label: o.label,
                    }))}
                  />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 12,
                      color: colors.textSecondary,
                      marginBottom: 4,
                    }}
                  >
                    类型
                  </div>
                  <Select
                    allowClear
                    placeholder="选择类型"
                    value={tempFilterType}
                    onChange={setTempFilterType}
                    style={{ width: '100%' }}
                    options={typeOptions.map((o) => ({
                      value: o.value,
                      label: o.label,
                    }))}
                  />
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: 8,
                    paddingTop: 8,
                    borderTop: `1px solid ${colors.border}`,
                  }}
                >
                  <Button
                    size="small"
                    onClick={() => {
                      setTempFilterLevel(undefined);
                      setTempFilterType(undefined);
                    }}
                  >
                    重置
                  </Button>
                  <Button
                    size="small"
                    type="primary"
                    onClick={() => {
                      setFilterLevel(tempFilterLevel);
                      setFilterType(tempFilterType);
                      setFilterOpen(false);
                    }}
                  >
                    确定
                  </Button>
                </div>
              </div>
            }
          >
            <span
              style={{
                ...styles.toolbarRight(),
                color:
                  filterLevel || filterType
                    ? colors.primary
                    : colors.textSecondary,
              }}
            >
              <FilterOutlined style={{ fontSize: 13 }} />
              筛选
              {filterLevel || filterType ? ' •' : ''}
            </span>
          </Popover>
        </Space>
      </div>

      {/* Body: 左树 + 右表 */}
      <div style={styles.body()}>
        {/* 左：模块树 */}
        <div style={styles.leftPane()}>
          <div style={styles.paneHeader()}>
            <div style={styles.paneTitle()}>
              <Checkbox
                checked={isAllModuleSelected}
                indeterminate={isModuleIndeterminate}
                onChange={handleSelectAllModules}
              >
                <span style={{ fontWeight: 600 }}>全选</span>
              </Checkbox>
            </div>
            <span style={styles.paneCount()}>
              {coveredLeafKeys.size}/{allLeafKeys.length}
            </span>
          </div>
          <div style={styles.paneBody()}>
            {moduleLoading ? (
              <div style={styles.emptyHint()}>
                <Spin size="small" />
              </div>
            ) : filteredTreeData.length === 0 ? (
              <div style={styles.emptyHint()}>
                {moduleKeyword ? '没有匹配的分组' : '暂无分组'}
              </div>
            ) : (
              <div style={styles.treeWrap()}>
                <Tree
                  checkable
                  checkStrictly
                  blockNode
                  showLine={{ showLeafIcon: false }}
                  expandedKeys={expandedKeys}
                  checkedKeys={safeCheckedModuleKeys}
                  onExpand={(keys) => setExpandedKeys(keys)}
                  onCheck={handleModuleCheck as any}
                  treeData={filteredTreeData}
                  titleRender={(node) => renderModuleTitle(node as any)}
                />
              </div>
            )}
          </div>
        </div>

        {/* 右：用例表格 */}
        <div style={styles.rightPane()}>
          <div style={styles.paneHeader()}>
            <div style={styles.paneTitle()}>
              <Checkbox
                checked={isAllCaseSelected}
                indeterminate={isCaseIndeterminate}
                onChange={handleSelectAllCases}
              >
                <span style={{ fontWeight: 600 }}>全选</span>
              </Checkbox>
              <span style={{ color: colors.textTertiary, fontSize: 12 }}>
                {coveredLeafKeys.size > 0
                  ? '已选模块内的用例'
                  : '请在左侧选择分组'}
              </span>
            </div>
            <span style={styles.paneCount()}>
              {selectedCaseIds.size}
              {selectedCaseIds.size > 0 ? ' 已选' : ''}
            </span>
          </div>
          <ProCard
            size="small"
            variant="outlined"
            style={{
              flex: 1,
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column',
              margin: spacing_sm,
              borderRadius: borderRadius.lg,
            }}
            styles={{
              body: {
                padding: 0,
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0,
              },
            }}
          >
            <ProTable<ITestCase>
              actionRef={actionRef}
              columns={columns}
              request={fetchPageData}
              rowKey="id"
              search={false}
              options={false}
              onChange={(_, _filter, sorter: any) => {
                // 仅处理单列排序
                const order = sorter?.order as 'ascend' | 'descend' | undefined;
                if (order) setSortOrder(order);
              }}
              pagination={{
                defaultPageSize: 100,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50', '100'],
                showTotal: (total) => `共 ${total} 条`,
              }}
              tableAlertRender={false}
              rowSelection={{
                selectedRowKeys: Array.from(selectedCaseIds),
                preserveSelectedRowKeys: true,
                onChange: handleRowSelectChange as any,
                columnWidth: 48,
              }}
              onLoad={setCaseList}
              scroll={{ y: 'calc(100vh - 480px)' }}
            />
          </ProCard>
        </div>
      </div>

      {/* Footer */}
      <div style={styles.footer()}>
        <label style={styles.footerLeft()}>
          <Checkbox
            checked={mergeSameGroup}
            onChange={(e) => setMergeSameGroup(e.target.checked)}
          />
          合并相同用例分组
        </label>
        <div style={styles.footerRight()}>
          <Button onClick={onCancel}>取消</Button>
          <Button
            type="primary"
            loading={confirming}
            disabled={selectedCaseIds.size === 0}
            onClick={handleConfirm}
          >
            确定
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ModuleCaseSelector;

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
  const [activeModuleId, setActiveModuleId] = useState<number | null>(null);
  /**
   * 按目录记忆用户已勾选的用例 ID 列表
   * - key: 源项目 module_id(用户点击激活的目录)
   * - value: 该目录下用户勾选的 case_id 列表(顺序为用户勾选顺序)
   * 用于支持"勾完 A 切到 B 再切回 A,A 的勾选还在"的连续操作体验
   */
  const [picksByModule, setPicksByModule] = useState<Record<number, number[]>>(
    {},
  );
  const [moduleKeyword, setModuleKeyword] = useState('');

  /* -------------------- 用例表格状态 -------------------- */
  const actionRef = useRef<ActionType>();
  const [caseList, setCaseList] = useState<ITestCase[]>([]);
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
    // 切换项目时清空之前的选择(激活目录 + 每目录的勾选记忆)
    setActiveModuleId(null);
    setPicksByModule({});
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
  // 整棵模块树的 key -> IModule 索引(用于按 id 查目录信息)
  const { moduleByKey } = useMemo(() => {
    const out = collectDescendantKeys(modules ?? []);
    return { moduleByKey: out.byKey };
  }, [modules]);
  /**
   * 当前激活目录已勾选的 case_id Set(派生值,供表格 rowSelection 使用)
   * - activeModuleId == null  -> 空集
   * - 否则                    -> picksByModule[activeModuleId] 的 Set 视图
   */
  const activeCaseIds = useMemo<Set<number>>(
    () =>
      new Set(
        activeModuleId != null ? picksByModule[activeModuleId] ?? [] : [],
      ),
    [activeModuleId, picksByModule],
  );

  /**
   * 跨所有目录的总勾选数 / 有勾选的目录数
   * 用于头部"已选 N 个用例 / M 个分组"展示
   */
  const { totalPickedCount, pickedModuleCount } = useMemo(() => {
    let total = 0;
    let modules = 0;
    Object.values(picksByModule).forEach((arr) => {
      if (arr.length > 0) {
        total += arr.length;
        modules += 1;
      }
    });
    return { totalPickedCount: total, pickedModuleCount: modules };
  }, [picksByModule]);

  /** 当前激活的目录节点(用于右侧 header 展示目录名) */
  const activeModule = useMemo<IModule | null>(
    () =>
      activeModuleId != null ? moduleByKey.get(activeModuleId) ?? null : null,
    [activeModuleId, moduleByKey],
  );

  /**
   * 更新当前激活目录的勾选集合
   * - 空数组会被清理(让 pickedModuleCount 准确反映"有勾选的目录数")
   */
  const updateActivePicks = (updater: (prev: number[]) => number[]) => {
    if (activeModuleId == null) return;
    const id = activeModuleId;
    setPicksByModule((prev) => {
      const cur = prev[id] ?? [];
      const next = updater(cur);
      const out = { ...prev };
      if (next.length === 0) {
        delete out[id];
      } else {
        out[id] = next;
      }
      return out;
    });
  };

  /**
   * 树点击回调(非 checkable 模式)
   * - 点击节点 -> 设为当前激活目录,右侧表格展示该目录(含子节点)的用例
   * - 点击已激活节点 -> 保持激活(避免误触清空右侧数据)
   * - 切换激活目录会触发 fetchPageData 重新拉取(activeModuleId 变化)
   */
  const handleModuleSelect = (keys: React.Key[]) => {
    const next = keys[0];
    setActiveModuleId(next != null ? Number(next) : null);
  };

  // 切换激活目录时刷新表格(不要清空 picksByModule,保留跨目录的勾选记忆)
  useEffect(() => {
    actionRef.current?.reloadAndRest?.();
  }, [activeModuleId]);

  /* -------------------- 用例表格 -------------------- */

  /**
   * ProTable 的 request 适配：把 antd ProTable 的 params 转成后端 pageTestCase 入参
   * 支持 project_id + module_id / module_ids 过滤
   * - 选中 1 个模块：传 module_id（保留旧接口兼容）
   * - 选中 ≥2 个模块：传 module_ids（后端展开每个模块的子节点后求并集）
   */
  /**
   * ProTable request: 选中目录时 module_id 传该目录 id
   * (后端 page_cases 对单 module_id 自动展开子节点,行为兼容)
   * 未选中目录时不传 module_id,后端返回未分类用例
   */
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
      const values =
        activeModuleId != null
          ? { ...baseParams, module_id: activeModuleId }
          : baseParams;
      const { code, data } = await pageTestCase(values);
      return pageData(code, data);
    },
    [activeModuleId, projectId, caseKeyword, filterLevel, filterType],
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
   * 把 ProTable 行选择映射回当前激活目录的 picksByModule
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
    if (activeModuleId == null) return;
    updateActivePicks((prev) => {
      const next = new Set(prev);
      if (info?.type === 'all') {
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
        safeRows.forEach((r) => {
          if (r.id !== undefined) {
            if (keys.includes(r.id)) next.add(r.id);
            else next.delete(r.id);
          }
        });
      }
      return Array.from(next);
    });
  };

  // 防御性：onLoad 在 ProTable 重载边界可能传 undefined
  const safeCaseList = caseList ?? [];
  const isAllCaseSelected =
    safeCaseList.length > 0 &&
    safeCaseList.every((tc) => tc.id !== undefined && activeCaseIds.has(tc.id));

  const isCaseIndeterminate = activeCaseIds.size > 0 && !isAllCaseSelected;

  const handleSelectAllCases = (e: CheckboxChangeEvent) => {
    if (activeModuleId == null) return;
    const list = caseList ?? [];
    if (e.target.checked) {
      updateActivePicks((prev) => {
        const next = new Set(prev);
        list.forEach((tc) => {
          if (tc.id !== undefined) next.add(tc.id);
        });
        return Array.from(next);
      });
    } else {
      // 取消全选 = 取消当前页所有(保留其他页/其他目录的勾选)
      updateActivePicks((prev) => {
        const next = new Set(prev);
        list.forEach((tc) => {
          if (tc.id !== undefined) next.delete(tc.id);
        });
        return Array.from(next);
      });
    }
  };

  /* -------------------- 提交 -------------------- */
  const handleConfirm = async () => {
    if (totalPickedCount === 0) {
      message.warning('请至少选择一个用例');
      return;
    }
    setConfirming(true);
    try {
      // 跨所有被激活目录的勾选用例
      const allCaseIds = Object.values(picksByModule).flat();
      // 把每个被激活的目录展开成完整子树(自身 + 所有后代),
      // 后端 _resolve_source_to_plan_module_map 会按 case.module_id 路由到对应 plan_module
      // 若不展开,被点击目录的子目录里的 case 就会落到兜底 plan_module_id
      const moduleIds = new Set<number>();
      Object.keys(picksByModule).forEach((k) => {
        const id = Number(k);
        const node = moduleByKey.get(id);
        if (node) {
          collectNodeDescendants(node).forEach((d) => moduleIds.add(d));
        }
      });
      await onConfirm(allCaseIds, {
        moduleIds: Array.from(moduleIds),
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
              <span style={{ fontWeight: 600 }}>模块</span>
            </div>
            <span style={styles.paneCount()}>
              {pickedModuleCount > 0
                ? `已选 ${pickedModuleCount} 个分组`
                : '点击分组选择'}
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
                  blockNode
                  showLine={{ showLeafIcon: false }}
                  expandedKeys={expandedKeys}
                  selectedKeys={activeModuleId != null ? [activeModuleId] : []}
                  onExpand={(keys) => setExpandedKeys(keys as React.Key[])}
                  onSelect={handleModuleSelect}
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
                disabled={activeModuleId == null}
              >
                <span style={{ fontWeight: 600 }}>全选</span>
              </Checkbox>
              <span style={{ color: colors.textTertiary, fontSize: 12 }}>
                {activeModule
                  ? `${activeModule.title} 的用例`
                  : '请在左侧选择分组'}
              </span>
            </div>
            <span style={styles.paneCount()}>
              {totalPickedCount > 0
                ? `已选 ${totalPickedCount} 个用例 / ${pickedModuleCount} 个分组`
                : ''}
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
                selectedRowKeys: Array.from(activeCaseIds),
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
            disabled={totalPickedCount === 0}
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

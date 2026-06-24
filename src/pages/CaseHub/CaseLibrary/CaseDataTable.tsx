import type { IModule } from '@/api.d';
import { queryTreeModuleByProject } from '@/api/base';
import {
  copyTestCase,
  exportCases,
  pageTestCase,
  removeTestCase,
  reorderTestCase,
} from '@/api/case/testCase';
import MyDrawer from '@/components/MyDrawer';
import UserSelect from '@/components/Table/UserSelect';
import TestCaseDetail from '@/pages/CaseHub/CaseLibrary/TestCaseDetail';
import DynamicInfo from '@/pages/CaseHub/components/DynamicInfo';
import { toValueEnum } from '@/pages/CaseHub/hooks/caseEnumOption';
import { useCaseEnumConfig } from '@/pages/CaseHub/hooks/useCaseEnumConfig';
import { useCaseLevelColorMap } from '@/pages/CaseHub/hooks/useCaseLevelColor';

import { useCaseHubTheme } from '@/pages/CaseHub/styles';
import { ITestCase } from '@/pages/CaseHub/types';
import { ModuleEnum } from '@/utils/config';
import { pageData } from '@/utils/somefunc';
import {
  CopyOutlined,
  DeleteOutlined,
  DeliveredProcedureOutlined,
  DownloadOutlined,
  FolderOpenOutlined,
  PlusOutlined,
  SmallDashOutlined,
} from '@ant-design/icons';
import {
  ActionType,
  DragSortTable,
  ProCard,
  ProColumns,
} from '@ant-design/pro-components';
import type { MenuProps } from 'antd';
import {
  Button,
  Dropdown,
  message,
  Popconfirm,
  Space,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import BatchActionBar from './components/BatchActionBar';
import CaseForm from './components/CaseForm';
import MoveCaseModal from './components/MoveCaseModal';
import { useSoftButtonStyle } from './components/toolbarStyles';
import UploadCaseModal from './components/UploadCaseModal';

const { Text, Link } = Typography;

interface Props {
  currentProjectId?: number;
  currentModuleId?: number;
  perKey: string;
  /**
   * 上传/导入成功后联动刷新左侧模块目录树的回调
   * 由父级提供（通常递增 moduleReloadKey），用于通知 ModuleTree 重新拉取目录
   * 表格自身的刷新由 onSuccess（UploadCaseModal）内部触发，不依赖此回调
   */
  onModuleRefresh?: () => void;
  /**
   * 模块目录树 (来自父级透传自 ModuleTree).
   * - 用于渲染"所属分组"列: 根据 record.module_id 反查并拼接 AAA|aaa|... 路径
   * - 不传时该列退化为"-"占位, 不影响其它功能
   */
  modules?: IModule[];
}

const CaseDataTable: FC<Props> = (props) => {
  // 用例类型从后端枚举配置拉取（管理员在配置中心增删后自动生效）
  const { options: typeOptions } = useCaseEnumConfig('CASE_TYPE');
  const typeValueEnum = useMemo(() => toValueEnum(typeOptions), [typeOptions]);

  // 适用端从后端枚举配置拉取（用例配置中心 PLATFORM 分类）
  const { options: platformOptions } = useCaseEnumConfig('PLATFORM');
  const platformValueEnum = useMemo(
    () => toValueEnum(platformOptions),
    [platformOptions],
  );

  const {
    perKey,
    currentProjectId,
    currentModuleId,
    onModuleRefresh,
    modules = [],
  } = props;

  // 用例等级从后端枚举配置拉取（管理员在配置中心增删后自动生效）
  const { options: levelOptions } = useCaseEnumConfig('CASE_LEVEL');
  const levelValueEnum = useMemo(
    () => toValueEnum(levelOptions),
    [levelOptions],
  );

  const { token, colors, borderRadius } = useCaseHubTheme();
  const levelColorMap = useCaseLevelColorMap();

  const actionRef = useRef<ActionType>();
  const [currentCaseId, setCurrentCaseId] = useState<number>();
  const [currentCase, setCurrentCase] = useState<ITestCase>();
  const [showDynamic, setShowDynamic] = useState<boolean>(false);
  const [showCaseDetail, setShowCaseDetail] = useState<boolean>(false);
  const [openNewCaseDrawer, setOpenNewCaseDrawer] = useState<boolean>(false);
  const [openModal, setOpenModal] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  // 当前选中目录的名称 (用于导出按钮的 Popconfirm 文案: 确认将 {name} 目录下用例全部导出?)
  // 通过 queryTreeModuleByProject 反查, 避免改 LeftComponents 的 onModuleChange 签名波及
  // 9 个其他页面 (Requirement / Scheduler / Httpx / Play 系列). 每次 module 切换多 1 次
  // tree 查询, tree 数据量小可接受.
  const [currentModuleName, setCurrentModuleName] = useState<
    string | undefined
  >();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<ITestCase[]>([]);

  const selectedCaseIds = selectedRows.map((row) => row.id!).filter(Boolean);

  useEffect(() => {
    actionRef.current?.reload();
  }, [currentModuleId]);

  useEffect(() => {
    if (!currentModuleId) {
      setSelectedRowKeys([]);
      setSelectedRows([]);
    }
  }, [currentModuleId]);

  // 当前用例总数: 直接复用表格 pageInfo.total,
  // 这样 count 一定与表格数据一致 (表格有数据 → count > 0),
  // 上传/删除/移动/筛选后表格 reload 时自动同步, 不需要额外的 trigger 机制.
  // 副作用: count 会随筛选条件变化, 等同表格底部分页显示的总数.
  const [moduleCaseCount, setModuleCaseCount] = useState<number | null>(null);

  // 反查当前 module 名称
  useEffect(() => {
    if (!currentProjectId || !currentModuleId) {
      setCurrentModuleName(undefined);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const { code, data } = await queryTreeModuleByProject(
          currentProjectId,
          ModuleEnum.CASE,
        );
        if (cancelled || code !== 0 || !Array.isArray(data)) return;
        const findName = (nodes: IModule[]): string | undefined => {
          for (const n of nodes) {
            if (n.key === currentModuleId) return n.title;
            if (n.children) {
              const r = findName(n.children);
              if (r) return r;
            }
          }
          return undefined;
        };
        setCurrentModuleName(findName(data));
      } catch {
        // 反查失败不影响列表, 静默回退
        if (!cancelled) setCurrentModuleName(undefined);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [currentProjectId, currentModuleId]);

  /** 分页查询用例数据 */
  const fetchPageData = useCallback(
    async (params: any, sort: any, filter?: any) => {
      // 默认按 order 升序 (拖拽列维护的字段) 主排, id 升序次排.
      // DragSortTable 拖拽后会触发 reload, 此时 sort 由父组件传, 不强制覆盖.
      // 用户点列表头切单字段排序时, sort 会被 antd 传过来, 后端响应按 sort 处理.
      const finalSort =
        sort && Object.keys(sort).length > 0
          ? sort
          : { order: 'ascend', id: 'ascend' };
      const values = {
        ...params,
        is_common: true,
        module_id: currentModuleId,
        module_type: ModuleEnum.CASE,
        sort: finalSort,
      };
      const { code, data } = await pageTestCase(values);
      // 同步更新 headerTitle 的 count (表格的真实总数)
      if (code === 0 && data?.pageInfo) {
        setModuleCaseCount(data.pageInfo.total);
      }
      return pageData(code, data);
    },
    [currentModuleId],
  );

  /**
   * DragSortTable 拖拽结束回调: 把 newDataSource 的最终顺序通过
   * POST /hub/cases/reorder 同步到后端.
   *
   * 锚点解析 (基于 movedRow 在 newDataSource 中的新位置 = to)
   * --------
   * DragSortTable 的 to 是被移动 case 在新数组中的索引, 此时
   * newDataSource[to] 就是 movedRow 本身, 不能拿它当锚点.
   * 真正作参照的"邻居"在 movedRow 旁边:
   *
   * - to < from (往前拖): 意图是 "movedRow 放在某条之前", 那条就是
   *   newDataSource[to + 1] (movedRow 之后的邻居), 传 before_id
   * - to > from (往后拖): 意图是 "movedRow 放在某条之后", 那条就是
   *   newDataSource[to - 1] (movedRow 之前的邻居), 传 after_id
   * - to === 0 且 newDataSource 长度 1: 整个 page 只有 movedRow,
   *   没邻居可参考, 不传锚点, 后端放到 module 最前
   * - to === from: 没真正移动, 不发请求
   *
   * 验证
   * --------
   * 原始 [A, B, C, D], 拖 D (from=3) 到 A 之前:
   *   newDataSource = [D, A, B, C], to=0, 邻居 = newDataSource[1] = A
   *   → before_id = A  ✓
   * 原始 [A, B, C, D], 拖 A (from=0) 到 D 之后:
   *   newDataSource = [B, C, D, A], to=3, 邻居 = newDataSource[2] = D
   *   → after_id = D  ✓
   *
   * 成功后必须 reload
   * --------
   * - DragSortTable 的 onDragSortEnd 给的 newDataSource 只是 "推算的" 目标顺序,
   *   它不会写回 request 拉到的内部 data. 一旦父组件任意 prop 变化
   *   (比如 pagination / 筛选 / 切 module), data 就会被 request 的结果覆盖,
   *   用户感知为 "拖完看似成功, 刷新又回去了".
   * - 解决: 成功后立刻 actionRef.reload(), 让 request 重新拉后端真实顺序
   *   并替换 dataSource. reload 期间表格 loading 闪烁几百毫秒,
   *   但能确保 UI 跟后端一致, 避免 "刷新一次才对" 的诡异现象.
   *
   * 失败回滚
   * --------
   * - 调接口失败 / 业务报错时, actionRef.reload() 重新拉取后端真实顺序,
   *   避免 UI 与 DB 错位 (DragSortTable 已经把 DOM 顺序更新了)
   */
  const handleDragSortEnd = useCallback(
    async (from: number, to: number, newDataSource: ITestCase[]) => {
      if (!currentProjectId) return;
      if (to === from) return;
      // 从 newDataSource[to] 取 movedRow (DragSortTable 已把它放到 to 位置)
      const movedRow = newDataSource[to];
      if (!movedRow || movedRow.id === undefined) {
        actionRef.current?.reload();
        return;
      }

      let before_id: number | undefined;
      let after_id: number | undefined;
      if (to < from) {
        // 往前拖: 锚点 = movedRow 之后的邻居 (newDataSource[to + 1])
        const anchor = newDataSource[to + 1];
        if (anchor && anchor.id !== undefined) {
          before_id = anchor.id;
        }
        // newDataSource 只有 movedRow 一条时 anchor 不存在,
        // 不传锚点, 后端会按 module 现有顺序追加
      } else {
        // 往后拖: 锚点 = movedRow 之前的邻居 (newDataSource[to - 1])
        const anchor = newDataSource[to - 1];
        if (anchor && anchor.id !== undefined) {
          after_id = anchor.id;
        }
      }

      try {
        const { code, msg } = await reorderTestCase({
          project_id: currentProjectId,
          case_id: movedRow.id,
          ...(before_id !== undefined ? { before_id } : {}),
          ...(after_id !== undefined ? { after_id } : {}),
        });
        if (code !== 0) {
          message.error(msg || '排序失败');
        }
      } catch (err) {
        message.error('排序失败,请重试');
      } finally {
        // 无论成功失败都 reload: 让 request 重新拉后端真实顺序,
        // 覆盖 DragSortTable 内部临时推算的 newDataSource
        actionRef.current?.reload();
      }
    },
    [currentProjectId],
  );
  /**
   * 模块索引: 把树扁平为 Map<id, IModule>, O(1) 查任意 module_id
   * 父链查找: IModule.parent_id + key, 循环直到 parent_id = 0 / 找不到父
   * - 未传 modules 时索引为空, getModulePath 全部返回 undefined
   * - 计算结果用 useMemo 缓存, 模块树变更时才重算
   */
  const modulePathCache = useMemo(() => {
    const map = new Map<number, IModule>();
    const walk = (list: IModule[]) => {
      for (const m of list) {
        map.set(m.key, m);
        if (m.children?.length) walk(m.children);
      }
    };
    walk(modules);
    const cache = new Map<number, string>();
    const build = (id: number): string | undefined => {
      if (cache.has(id)) return cache.get(id);
      const chain: string[] = [];
      let cur: IModule | undefined = map.get(id);
      const seen = new Set<number>();
      while (cur && !seen.has(cur.key)) {
        seen.add(cur.key);
        chain.unshift(cur.title);
        if (!cur.parent_id) break;
        cur = map.get(cur.parent_id);
      }
      if (chain.length === 0) return undefined;
      const path = chain.join('|');
      cache.set(id, path);
      return path;
    };
    return { map, build };
  }, [modules]);

  /**
   * 给定 module_id, 返回 "根 → 当前" 的路径, 用 "|" 拼接
   * - 没找到对应 module (比如跨项目残留 id) 返回 undefined, 渲染层走"未分组"占位
   */
  const getModulePath = useCallback(
    (id?: number | null): string | undefined => {
      if (id == null) return undefined;
      return modulePathCache.build(id);
    },
    [modulePathCache],
  );

  const column: ProColumns<ITestCase>[] = useMemo(
    () => [
      {
        // 拖拽手柄列: valueType: 'drag' 让 DragSortTable 渲染拖拽图标
        // 并响应 onDragSortEnd; dataIndex 与 DragSortTable.dragSortKey 对齐
        // 后端字段是 test_case.order, 默认按 order ASC 排序展示
        title: '排序',
        dataIndex: 'order',
        width: '3%',
        fixed: 'left',
        search: false,
      },
      {
        title: '用例名称',
        dataIndex: 'case_name',
        copyable: true,
        ellipsis: true,
        fixed: 'left',
        width: '20%',
        render: (text) => <Text>{text}</Text>,
      },
      {
        // 所属分组: 反查模块树, 拼接 "AAA|aaa|..." 形式的祖先链
        // 例: 用例直接落在 AAA → 展示 "AAA"
        //     用例落在 AAA/aaa → 展示 "AAA|aaa"
        //     用例未分配模块 (module_id 缺失) → 展示 "未分组"
        title: '所属分组',
        dataIndex: 'module_id',
        width: '15%',
        search: false,
        ellipsis: true,
        render: (_, record: ITestCase) => {
          const path = getModulePath(record.module_id);
          if (!path) {
            return <Text type="secondary">未分组</Text>;
          }
          return (
            <Tooltip title={path} placement="topLeft">
              <Tag
                style={{
                  background: token.colorFillAlter,
                  borderColor: token.colorBorderSecondary,
                  color: token.colorTextSecondary,
                  fontWeight: 500,
                  maxWidth: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {path}
              </Tag>
            </Tooltip>
          );
        },
      },
      // {
      //   title: '标签',
      //   dataIndex: 'case_tag',
      //   ellipsis: true,
      //   width: '15%',
      //   render: (text) => (
      //     <Text strong ellipsis={{ tooltip: text }}>
      //       {text}
      //     </Text>
      //   ),
      // },
      {
        title: '用例等级',
        dataIndex: 'case_level',
        valueType: 'select',
        valueEnum: levelValueEnum,
        width: '10%',
        render: (_, record: ITestCase) => {
          if (!record.case_level) {
            return <Text type="secondary">-</Text>;
          }
          const levelText =
            levelValueEnum[record.case_level]?.text || record.case_level;
          const levelColors = levelColorMap.get(record.case_level) ||
            levelColorMap.get('P3') || {
              bg: token.colorFillAlter,
              border: token.colorBorderSecondary,
              color: token.colorTextSecondary,
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
              }}
            >
              {levelText}
            </Tag>
          );
        },
      },
      {
        title: '用例类型',
        dataIndex: 'case_type',
        valueType: 'select',
        valueEnum: typeValueEnum,
        width: '10%',
        render: (_, record: ITestCase) => (
          <Text
            type="secondary"
            ellipsis={{
              tooltip: record.case_type
                ? typeValueEnum[record.case_type]?.text || record.case_type
                : '-',
            }}
            style={{ fontWeight: 500 }}
          >
            {record.case_type
              ? typeValueEnum[record.case_type]?.text || record.case_type
              : '-'}
          </Text>
        ),
      },
      {
        title: '多选适用端',
        dataIndex: 'case_platform',
        valueType: 'select',
        valueEnum: platformValueEnum,
        width: '10%',
        render: (_, record: ITestCase) => {
          // 后端存的是 CSV 字符串 (如 "PC,H5"), 拆开逐个取 valueEnum 的中文名再拼回来
          // Array.from(new Set(...)) 同时去重避免 "PC,PC" 这种脏数据展示成两个 Tag
          const raw = record.case_platform;
          if (!raw) {
            return <Text type="secondary">-</Text>;
          }
          const labels = Array.from(
            new Set(raw.split(',').filter(Boolean)),
          ).map((p) => platformValueEnum[p]?.text || p);
          const display = labels.join('、');
          return (
            <Text
              type="secondary"
              ellipsis={{ tooltip: display }}
              style={{ fontWeight: 500 }}
            >
              {display}
            </Text>
          );
        },
      },
      {
        title: '创建人',
        dataIndex: 'creator',
        valueType: 'select',
        width: '10%',
        formItemRender: () => {
          return <UserSelect multiple={true} />;
        },

        render: (_, record: ITestCase) => (
          <Text type="secondary">{record.creatorName}</Text>
        ),
      },
      {
        title: '创建时间',
        dataIndex: 'create_time',
        valueType: 'dateTime',
        search: true,
        width: '10%',
      },

      {
        valueType: 'option',
        fixed: 'right',
        width: '10%',
        render: (_, record: ITestCase) => {
          return (
            <Space size="small">
              <Link
                onClick={() => {
                  setCurrentCase(record);
                  setShowCaseDetail(true);
                }}
              >
                详情
              </Link>
              <Link
                style={{
                  color: colors.primary,
                  cursor: 'pointer',
                }}
                onClick={() => {
                  setCurrentCaseId(record.id);
                  setShowDynamic(true);
                }}
              >
                动态
              </Link>
              {TableOptions(record)}
            </Space>
          );
        },
      },
    ],
    [levelValueEnum, levelColorMap, colors, borderRadius, token],
  );

  const TableOptions = (record: ITestCase) => {
    const items: MenuProps['items'] = [
      {
        label: (
          <Link
            style={{
              color: colors.primary,
              cursor: 'pointer',
            }}
            onClick={async () => await copyCase(record.id)}
          >
            复制
          </Link>
        ),
        icon: <CopyOutlined />,
        key: '0',
      },

      {
        key: '3',
        label: '移动至',
        icon: <DeliveredProcedureOutlined />,
        onClick: () => {
          setCurrentCaseId(record.id);
          setOpenModal(true);
        },
      },
      {
        type: 'divider',
        key: 'divider',
      },
      {
        label: (
          <Popconfirm title={'确认删除'}>
            <Link
              style={{
                color: colors.error,
                cursor: 'pointer',
              }}
              onClick={async () => {
                await removeCase(record.id);
              }}
            >
              删除
            </Link>
          </Popconfirm>
        ),
        icon: <DeleteOutlined />,
        key: '2',
      },
    ];

    return (
      <Dropdown menu={{ items }} trigger={['click', 'hover']}>
        <SmallDashOutlined />
      </Dropdown>
    );
  };

  /** 复制用例 */
  const copyCase = async (caseId?: number) => {
    if (!caseId) {
      return;
    }
    const { code } = await copyTestCase({
      caseId: caseId,
    });
    if (code === 0) {
      actionRef.current?.reload();
      message.success('复制成功');
    }
  };

  /** 删除用例 */
  const removeCase = async (caseId?: number) => {
    if (!caseId) {
      return;
    }
    const { code } = await removeTestCase({
      caseId: caseId,
    });
    if (code === 0) {
      actionRef.current?.reload();
      message.success('删除成功');
    }
  };

  const rowSelection = {
    selectedRowKeys,
    columnWidth: '3%',
    fixed: 'left' as const,
    onChange: (keys: React.Key[], rows: ITestCase[]) => {
      setSelectedRowKeys(keys);
      setSelectedRows(rows);
    },
  };

  /**
   * 按当前 module 导出目录全量. 要求 currentModuleId 必填 (没有 module 时按钮 disabled + tooltip).
   * 多选场景下的"导出所选"在 BatchActionBar 里, 这里只管"导出该目录".
   */
  const handleExportByModule = useCallback(async () => {
    if (!currentModuleId || !currentProjectId) {
      message.warning('请先选择项目和目录');
      return;
    }
    setExportLoading(true);
    try {
      await exportCases({
        scope_type: 'library',
        scope_id: currentModuleId,
        project_id: currentProjectId,
      });
      message.success('导出已开始, 留意浏览器下载');
    } catch (err) {
      // 全局拦截器已 message.error, 这里吞掉避免 unhandled rejection
      console.error('exportCases failed:', err);
    } finally {
      setExportLoading(false);
    }
  }, [currentModuleId, currentProjectId]);

  const handleBatchSuccess = useCallback(() => {
    setSelectedRowKeys([]);
    setSelectedRows([]);
    actionRef.current?.reload();
  }, []);

  const handleExitBatch = useCallback(() => {
    setSelectedRowKeys([]);
    setSelectedRows([]);
  }, []);

  // 没选 module 时禁用导出: 后端需要 scope_id 定位范围, 没值要么报错要么全量, 都不合理.
  const exportDisabled = !currentModuleId;
  const exportTooltip = exportDisabled
    ? '请先在左侧选择一个目录'
    : '导出当前目录下全部用例';

  // soft 样式: 主色 8% 透明背景 + 主色 30% 透明边框 + 主色文字, 与 primary 主按钮形成层次
  const softButtonStyle = useSoftButtonStyle();

  const toolBarRender = [
    // 没拿到 currentProjectId 时不渲染上传按钮:
    // 后端 /hub/cases/upload 预览阶段 project_id 必填, 没值直接 422, 提前挡住.
    currentProjectId ? (
      <UploadCaseModal
        key="upload-case"
        onSuccess={() => actionRef.current?.reload()}
        onModuleRefresh={onModuleRefresh}
        currentProjectId={currentProjectId}
      />
    ) : null,

    <Tooltip key="export-tip" title={exportTooltip}>
      <Popconfirm
        key="export-confirm"
        title={
          currentModuleName
            ? `确认将 ${currentModuleName} 目录下用例全部导出?`
            : '确认将当前目录下用例全部导出?'
        }
        okText="确认导出"
        cancelText="取消"
        disabled={exportDisabled}
        onConfirm={handleExportByModule}
      >
        <Button
          key="export-module"
          icon={<DownloadOutlined />}
          loading={exportLoading}
          disabled={exportDisabled}
          style={softButtonStyle}
        >
          导出
        </Button>
      </Popconfirm>
    </Tooltip>,

    <Button
      key="add"
      type="primary"
      icon={<PlusOutlined />}
      onClick={() => setOpenNewCaseDrawer(true)}
    >
      添加用例
    </Button>,
  ];
  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <MoveCaseModal
        open={openModal}
        onCancel={() => setOpenModal(false)}
        onSuccess={() => {
          setOpenModal(false);
          actionRef.current?.reload();
        }}
        currentCaseId={currentCaseId}
      />
      <MyDrawer
        name={'动态'}
        width={'40%'}
        open={showDynamic}
        setOpen={setShowDynamic}
      >
        <DynamicInfo caseId={currentCaseId} />
      </MyDrawer>
      <MyDrawer
        name={'添加用例'}
        open={openNewCaseDrawer}
        setOpen={setOpenNewCaseDrawer}
        width={'60%'}
      >
        <CaseForm
          callback={() => {
            setOpenNewCaseDrawer(false);
            actionRef.current?.reload();
          }}
          project_id={currentProjectId!}
          module_id={currentModuleId!}
        />
      </MyDrawer>

      <MyDrawer
        name={'用例详情'}
        open={showCaseDetail}
        setOpen={setShowCaseDetail}
      >
        <TestCaseDetail
          testcase={currentCase}
          callback={() => {
            actionRef.current?.reload();
          }}
        />
      </MyDrawer>
      <ProCard
        headerBordered
        variant="outlined"
        style={{
          flex: 1,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
        styles={{
          body: {
            padding: '5px',
            flex: 1,
            height: '100%',
            overflow: 'hidden',
          },
        }}
      >
        <DragSortTable
          footer={() => false}
          cardBordered
          dragSortKey="order"
          headerTitle={
            currentModuleId ? (
              <Space size={6} align="center">
                <FolderOpenOutlined
                  style={{ color: colors.textSecondary, fontSize: 14 }}
                />
                <Text type="secondary" style={{ fontSize: 13 }}>
                  用例
                </Text>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: 28,
                    height: 20,
                    padding: '0 8px',
                    borderRadius: borderRadius.sm,
                    background: `${colors.primary}10`,
                    color: colors.primary,
                    fontSize: 12,
                    fontWeight: 600,
                    lineHeight: '20px',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {(moduleCaseCount ?? 0).toLocaleString()}
                </span>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  条
                </Text>
              </Space>
            ) : null
          }
          columnsState={{
            persistenceKey: perKey ?? 'pro-table',
            persistenceType: 'localStorage',
          }}
          scroll={{
            x: 1500,
            y: 'calc(100vh - 400px)',
            // y:"100%"
          }}
          pagination={{
            showQuickJumper: true,
            defaultPageSize: 20,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
          toolBarRender={() => toolBarRender}
          actionRef={actionRef}
          request={fetchPageData}
          columns={column}
          rowKey={'uid'}
          onDragSortEnd={handleDragSortEnd}
          rowSelection={rowSelection}
        />
      </ProCard>

      {selectedRowKeys.length > 0 && (
        <BatchActionBar
          selectedCount={selectedRowKeys.length}
          selectedCaseIds={selectedCaseIds}
          exportScope={
            currentProjectId && currentModuleId
              ? { project_id: currentProjectId, module_id: currentModuleId }
              : undefined
          }
          onBatchSuccess={handleBatchSuccess}
          onExit={handleExitBatch}
        />
      )}
    </div>
  );
};

export default CaseDataTable;

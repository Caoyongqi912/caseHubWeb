import type { IModule } from '@/api.d';
import { queryTreeModuleByProject } from '@/api/base';
import {
  copyTestCase,
  exportCases,
  pageTestCase,
  removeTestCase,
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
  ProCard,
  ProColumns,
  ProTable,
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
import {
  FC,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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
}

const CaseDataTable: FC<Props> = (props) => {
  // 用例类型从后端枚举配置拉取（管理员在配置中心增删后自动生效）
  const { options: typeOptions } = useCaseEnumConfig('CASE_TYPE');
  const typeValueEnum = useMemo(() => toValueEnum(typeOptions), [typeOptions]);

  const { perKey, currentProjectId, currentModuleId, onModuleRefresh } = props;

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

  /**
   * 动态测 ProTable chrome 高度，驱动 scroll.y 避开 "page 整页滚 50px" 问题。
   *
   * 之前是硬编码 `calc(100vh - 350px)`：350 是估算的 chrome（搜索表单+工具栏+表头+分页+padding），
   * 实际 chrome 跟搜索表单展开/折叠强相关，差几十像素就会让 ProTable 整体高度超过内容区，
   * 触发 .ant-pro-layout-content 的内部滚动条（用户看到"页面能稍微上下滚"）。
   *
   * 现在改成"真正量 chrome"：用 ResizeObserver 监听容器尺寸变化，再分别量
   *   1) 搜索表单 .ant-pro-table-search / .ant-pro-query-filter
   *   2) 工具栏 .ant-pro-table-toolbar
   *   3) 表头 .ant-table-thead
   *   4) 分页 .ant-pagination
   * 把它们加起来作为 chrome，scroll.y = containerH - chrome。
   *
   * MutationObserver 兜住"搜索表单展开/折叠""列数变化"等不触发 ResizeObserver 的 DOM 变化。
   *
   * 为什么不走 "量 .ant-table-body 位置反算 chrome" 路线？
   *   body 高度 = min(content, scroll.y)，bottomChrome 反算公式会跟 scroll.y 循环依赖，
   *   第一次测量时 body 还没 max-height，算出来的 bottomChrome 是错的。要靠 setTimeout /
   *   多帧循环才能收敛，复杂度高。直接量独立 chrome 元素就没有这个循环。
   */
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [tableScrollY, setTableScrollY] = useState<number | undefined>(
    undefined,
  );
  useLayoutEffect(() => {
    const el = tableContainerRef.current;
    if (!el) return;

    let rafId: number | null = null;
    const measure = () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const containerH = el.clientHeight;
        if (containerH === 0) return;

        // 直接量各 chrome 元素高度（0 表示元素不存在 / 隐藏）
        const searchForm = el.querySelector(
          '.ant-pro-table-search, .ant-pro-query-filter',
        ) as HTMLElement | null;
        const toolbar = el.querySelector(
          '.ant-pro-table-toolbar',
        ) as HTMLElement | null;
        const thead = el.querySelector(
          '.ant-table-thead',
        ) as HTMLElement | null;
        const pagination = el.querySelector(
          '.ant-pagination',
        ) as HTMLElement | null;

        const searchH = searchForm?.offsetHeight ?? 0;
        const toolbarH = toolbar?.offsetHeight ?? 0;
        const theadH = thead?.offsetHeight ?? 0;
        const paginationH = pagination?.offsetHeight ?? 0;
        // ProTable 自身的 border / card body padding 留 8px buffer
        const overhead = 8;

        const chrome = searchH + toolbarH + theadH + paginationH + overhead;
        const newScrollY = Math.max(0, containerH - chrome);

        // 浅比较避免无意义 re-render（ProTable 拿到同样 scrollY 也会重建虚拟滚动区）
        setTableScrollY((prev) => (prev === newScrollY ? prev : newScrollY));
      });
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    // 搜索表单展开/折叠 / 表格列数变化不会触发 ResizeObserver，MutationObserver 兜底
    const mo = new MutationObserver(measure);
    mo.observe(el, { childList: true, subtree: true });

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      ro.disconnect();
      mo.disconnect();
    };
  }, []);

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
    async (params: any, sort: any) => {
      const values = {
        ...params,
        is_common: true,
        module_id: currentModuleId,
        module_type: ModuleEnum.CASE,
        sort: sort,
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
  const column: ProColumns<ITestCase>[] = useMemo(
    () => [
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
        title: '标签',
        dataIndex: 'case_tag',
        ellipsis: true,
        width: '15%',
        render: (text) => (
          <Text strong ellipsis={{ tooltip: text }}>
            {text}
          </Text>
        ),
      },
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
          height: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
        styles={{
          body: {
            padding: '12px',
            height: '100%',
            // body 改成 flex column 容器，让里面的 tableContainerRef div
            // 能 flex: 1 撑开高度，否则 div 退化成 auto-height，量 chrome 拿到 0
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
          },
        }}
      >
        <div
          ref={tableContainerRef}
          style={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <ProTable
            footer={() => false}
            cardBordered
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
              // scroll.y 由上面 useLayoutEffect 动态量 chrome 后算出，
              // 替代原硬编码的 calc(100vh - 350px)（350 估算偏小会让 ProTable 撑出内容区）
              y: tableScrollY,
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
            rowSelection={rowSelection}
          />
        </div>
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

import {
  copyTestCase,
  downloadCaseExcel,
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
  SmallDashOutlined,
  SoundOutlined,
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
  Typography,
} from 'antd';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import BatchActionBar from './components/BatchActionBar';
import CaseForm from './components/CaseForm';
import MoveCaseModal from './components/MoveCaseModal';
import UploadCaseModal from './components/UploadCaseModal';

const { Text, Link } = Typography;

interface Props {
  currentProjectId?: number;
  currentModuleId?: number;
  perKey: string;
}

const CaseDataTable: FC<Props> = (props) => {
  // 用例类型从后端枚举配置拉取（管理员在配置中心增删后自动生效）
  const { options: typeOptions } = useCaseEnumConfig('CASE_TYPE');
  const typeValueEnum = useMemo(() => toValueEnum(typeOptions), [typeOptions]);

  const { perKey, currentProjectId, currentModuleId } = props;

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

  const download = async () => {
    try {
      const { blob, filename } = await downloadCaseExcel({
        responseType: 'blob',
      });
      const objectURL = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectURL;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectURL);
    } catch (error) {
      message.error('下载失败');
    }
  };

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
      return pageData(code, data);
    },
    [currentModuleId],
  );
  const column: ProColumns<ITestCase>[] = useMemo(
    () => [
      {
        title: 'ID',
        dataIndex: 'uid',
        fixed: 'left',
        copyable: true,
        width: '6%',
        render: (_, record) => (
          <Tag
            style={{
              background: colors.primaryBg,
              borderColor: colors.primary,
              color: colors.primary,
              borderRadius: borderRadius.md,
              fontWeight: 500,
            }}
          >
            {record.uid}
          </Tag>
        ),
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
        label: (
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
        ),
        icon: <SoundOutlined />,
        key: '1',
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
    onChange: (keys: React.Key[], rows: ITestCase[]) => {
      setSelectedRowKeys(keys);
      setSelectedRows(rows);
    },
  };

  const handleBatchSuccess = useCallback(() => {
    setSelectedRowKeys([]);
    setSelectedRows([]);
    actionRef.current?.reload();
  }, []);

  const handleExitBatch = useCallback(() => {
    setSelectedRowKeys([]);
    setSelectedRows([]);
  }, []);

  const toolBarRender = [
    <Button
      key="download"
      onClick={download}
      type="text"
      icon={<DownloadOutlined style={{ color: colors.primary }} />}
    >
      用例模版
    </Button>,

    <UploadCaseModal onSuccess={() => actionRef.current?.reload()} />,

    <Button key="add" type="primary" onClick={() => setOpenNewCaseDrawer(true)}>
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
          },
        }}
      >
        <ProTable
          footer={() => false}
          cardBordered
          columnsState={{
            persistenceKey: perKey ?? 'pro-table',
            persistenceType: 'localStorage',
          }}
          scroll={{
            x: 1500,
            y: 'calc(100vh - 350px)',
          }}
          pagination={{
            showQuickJumper: true,
            defaultPageSize: 10,
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
      </ProCard>

      {selectedRowKeys.length > 0 && (
        <BatchActionBar
          selectedCount={selectedRowKeys.length}
          selectedCaseIds={selectedCaseIds}
          onBatchSuccess={handleBatchSuccess}
          onExit={handleExitBatch}
        />
      )}
    </div>
  );
};

export default CaseDataTable;

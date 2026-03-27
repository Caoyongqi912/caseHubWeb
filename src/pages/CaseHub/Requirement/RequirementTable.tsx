import { pageRequirement, updateRequirement } from '@/api/case/requirement';
import { downloadCaseExcel } from '@/api/case/testCase';
import MyDrawer from '@/components/MyDrawer';
import MyProTable from '@/components/Table/MyProTable';
import {
  RequirementProcessEnum,
  RequirementProcessOption,
} from '@/pages/CaseHub/CaseConfig';
import RequirementDetail from '@/pages/CaseHub/Requirement/RequirementDetail';
import Requirement from '@/pages/CaseHub/Requirement/RequirementForm';
import {
  caseLevelColors,
  requirementProcessColors,
  useCaseHubTheme,
} from '@/pages/CaseHub/styles';
import { IRequirement } from '@/pages/CaseHub/type';
import { CONFIG, ModuleEnum } from '@/utils/config';
import { pageData } from '@/utils/somefunc';
import { DownloadOutlined, EditOutlined } from '@ant-design/icons';
import { ActionType, ProCard } from '@ant-design/pro-components';
import { ProColumns } from '@ant-design/pro-table/lib/typing';
import { Button, Popconfirm, Select, Space, Tag, Typography } from 'antd';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';

const { Text, Link } = Typography;

interface SelfProps {
  currentProjectId?: number;
  currentModuleId?: number;
  perKey: string;
}

const RequirementTable: FC<SelfProps> = ({
  currentProjectId,
  perKey,
  currentModuleId,
}) => {
  const actionRef = useRef<ActionType>();
  const [detailVisible, setDetailVisible] = useState<boolean>(false);
  const [currentReqId, setCurrentReqId] = useState<number>();
  const { token, colors, spacing, borderRadius, shadows } = useCaseHubTheme();

  const drawerStyles = useMemo(
    () => ({
      header: {
        background: `linear-gradient(135deg, ${colors.primaryBg} 0%, ${colors.bgContainer} 100%)`,
        borderBottom: `1px solid ${colors.border}`,
        padding: `${token.paddingLG}px ${token.paddingXL}px`,
        fontWeight: 600,
      },
      body: {
        padding: spacing.lg,
        background: colors.bgContainer,
      },
    }),
    [colors, spacing, token],
  );

  const columns: ProColumns<IRequirement>[] = useMemo(
    () => [
      {
        title: 'ID',
        key: 'uid',
        dataIndex: 'uid',
        fixed: 'left',
        copyable: true,
        width: 100,
        editable: false,
        render: (text) => (
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
            {text}
          </Tag>
        ),
      },
      {
        title: '需求名',
        key: 'requirement_name',
        dataIndex: 'requirement_name',
        copyable: true,
        editable: false,
        width: 200,
        render: (text) => (
          <Text strong ellipsis={{ tooltip: text }}>
            {text}
          </Text>
        ),
      },
      {
        title: '需求等级',
        key: 'requirement_level',
        dataIndex: 'requirement_level',
        editable: false,
        width: 100,
        render: (_, record) => {
          const levelColor =
            caseLevelColors[record.requirement_level] || caseLevelColors.P2;
          return (
            <Tag
              style={{
                background: levelColor.bg,
                borderColor: levelColor.border,
                color: levelColor.text,
                borderRadius: borderRadius.md,
                fontWeight: 500,
                margin: 0,
              }}
            >
              {CONFIG.RENDER_CASE_LEVEL[record.requirement_level]?.text ||
                record.requirement_level}
            </Tag>
          );
        },
      },
      {
        title: '进度',
        key: 'process',
        dataIndex: 'process',
        valueType: 'select',
        width: 120,
        valueEnum: RequirementProcessEnum,
        render: (_, record) => {
          const processColor =
            requirementProcessColors[record.process] ||
            requirementProcessColors[3];
          return (
            <Space size={'small'}>
              <Tag
                style={{
                  background: processColor.bg,
                  borderColor: processColor.border,
                  color: processColor.text,
                  borderRadius: borderRadius.md,
                  margin: 0,
                }}
              >
                {RequirementProcessEnum[record.process]?.text}
              </Tag>
              <EditOutlined
                style={{ color: colors.primary, cursor: 'pointer' }}
                onClick={() => {
                  actionRef?.current?.startEditable(record.id);
                }}
              />
            </Space>
          );
        },
        renderFormItem: (text) => (
          <Select
            options={RequirementProcessOption}
            value={text}
            style={{ width: '100%' }}
          />
        ),
      },
      {
        title: '用例数',
        key: 'case_number',
        dataIndex: 'case_number',
        hideInSearch: true,
        editable: false,
        width: 80,
        render: (num) => (
          <Tag
            style={{
              background: colors.infoBg,
              borderColor: colors.info,
              color: colors.info,
              borderRadius: borderRadius.md,
              fontWeight: 500,
              margin: 0,
            }}
          >
            {num}
          </Tag>
        ),
      },
      {
        title: '创建人',
        key: 'creatorName',
        dataIndex: 'creatorName',
        hideInSearch: true,
        editable: false,
        width: 100,
        render: (text) => <Text type="secondary">{text}</Text>,
      },
      {
        valueType: 'option',
        fixed: 'right',
        width: 180,
        render: (_, record: IRequirement) => {
          return (
            <Space size="small">
              <Link
                style={{ color: colors.primary }}
                onClick={() => {
                  setCurrentReqId(record.id);
                  setDetailVisible(true);
                }}
              >
                详情
              </Link>
              <Link
                style={{ color: colors.primary }}
                onClick={() => {
                  window.open(
                    `/cases/caseHub/requirementCases/reqId=${record.id}&projectId=${currentProjectId}&moduleId=${currentModuleId}`,
                  );
                }}
              >
                用例
              </Link>
              <Link
                style={{ color: colors.primary }}
                onClick={() => {
                  window.open(
                    `/cases/caseHub/requirementMindMap/reqId=${record.id}&projectId=${currentProjectId}&moduleId=${currentModuleId}`,
                  );
                }}
              >
                Mind
              </Link>

              <Popconfirm
                title="确定要删除吗？"
                onConfirm={async () => {}}
                okText="是"
                cancelText="否"
              >
                <Link style={{ color: colors.error }}>删除</Link>
              </Popconfirm>
            </Space>
          );
        },
      },
    ],
    [colors, borderRadius, currentProjectId, currentModuleId],
  );

  useEffect(() => {
    actionRef.current?.reload();
  }, [currentModuleId, currentProjectId]);

  const fetchPageData = useCallback(
    async (params: IRequirement, sort: any) => {
      const values = {
        ...params,
        module_id: currentModuleId,
        module_type: ModuleEnum.REQUIREMENT,
        sort: sort,
      };
      const { code, data } = await pageRequirement(values);
      return pageData(code, data);
    },
    [currentModuleId],
  );

  const download = async () => {
    const blob = await downloadCaseExcel({ responseType: 'blob' });
    const objectURL = URL.createObjectURL(blob);
    let btn: any = document.createElement('a');
    btn.download = `模版.xlsx`;
    btn.href = objectURL;
    btn.click();
    URL.revokeObjectURL(objectURL);
    btn = null;
  };

  const onSave = async (_: any, record: IRequirement) => {
    const values = {
      id: record.id,
      process: record.process,
    };
    const { code } = await updateRequirement(values as IRequirement);
    if (code === 0) {
      actionRef.current?.reload();
    }
  };

  return (
    <ProCard bodyStyle={{ padding: 0 }}>
      <MyDrawer
        name={'需求详情'}
        open={detailVisible}
        setOpen={setDetailVisible}
        drawerStyles={drawerStyles}
      >
        <RequirementDetail
          requirementId={currentReqId}
          callback={() => {
            setDetailVisible(false);
            actionRef.current?.reload();
          }}
        />
      </MyDrawer>
      <MyProTable
        onSave={onSave}
        persistenceKey={perKey}
        rowKey={'id'}
        actionRef={actionRef}
        columns={columns}
        request={fetchPageData}
        toolBarRender={() => [
          <Button
            key="download"
            onClick={download}
            type="text"
            icon={<DownloadOutlined style={{ color: colors.primary }} />}
            style={{ fontWeight: 500 }}
          >
            用例模版
          </Button>,
          <Requirement
            key="add"
            callback={() => actionRef.current?.reload()}
            currentModuleId={currentModuleId}
            currentProjectId={currentProjectId}
          />,
        ]}
      />
    </ProCard>
  );
};

export default RequirementTable;

import { pageTestCase } from '@/api/case/testCase';
import MyDrawer from '@/components/MyDrawer';
import MyProTable from '@/components/Table/MyProTable';
import { CaseHubConfig } from '@/pages/CaseHub/CaseConfig';
import { caseLevelColors, useCaseHubTheme } from '@/pages/CaseHub/styles';
import DynamicInfo from '@/pages/CaseHub/TestCase/DynamicInfo';
import TestCaseDetail from '@/pages/CaseHub/TestCase/TestCaseDetail';
import { ITestCase } from '@/pages/CaseHub/type';
import { ModuleEnum } from '@/utils/config';
import { pageData } from '@/utils/somefunc';
import { ActionType, ProColumns } from '@ant-design/pro-components';
import { Popconfirm, Space, Tag, Typography } from 'antd';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';

const { Text, Link } = Typography;

interface Props {
  currentProjectId?: number;
  currentModuleId?: number;
  perKey: string;
}

const CaseDataTable: FC<Props> = (props) => {
  const { perKey, currentProjectId, currentModuleId } = props;
  const { CASE_LEVEL_ENUM } = CaseHubConfig;
  const { token, colors, spacing, borderRadius, shadows } = useCaseHubTheme();
  const actionRef = useRef<ActionType>();
  const [currentCaseId, setCurrentCaseId] = useState<number>();
  const [currentCase, setCurrentCase] = useState<ITestCase>();
  const [showDynamic, setShowDynamic] = useState<boolean>(false);
  const [showCaseDetail, setShowCaseDetail] = useState<boolean>(false);

  useEffect(() => {
    actionRef.current?.reload();
  }, [currentModuleId, currentProjectId]);

  const drawerStyles = useMemo(
    () => ({
      header: {
        background: `linear-gradient(135deg, ${colors.primaryBg} 0%, ${colors.bgContainer} 100%)`,
        borderBottom: `1px solid ${colors.border}`,
      },
      body: {
        padding: spacing.lg,
        background: colors.bgContainer,
      },
    }),
    [colors, spacing],
  );

  const column: ProColumns<ITestCase>[] = useMemo(
    () => [
      {
        title: 'ID',
        dataIndex: 'uid',
        fixed: 'left',
        copyable: true,
        width: 100,
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
        width: 250,
        render: (text) => (
          <Text strong ellipsis={{ tooltip: text }}>
            {text}
          </Text>
        ),
      },
      {
        title: '等级',
        dataIndex: 'case_level',
        sorter: true,
        valueEnum: CASE_LEVEL_ENUM,
        width: 80,
        render: (_, record) => {
          const levelColor =
            caseLevelColors[record.case_level] || caseLevelColors.P2;
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
              {record.case_level}
            </Tag>
          );
        },
      },
      {
        title: '创建人',
        dataIndex: 'creatorName',
        width: 100,
        render: (text) => <Text type="secondary">{text}</Text>,
      },
      {
        title: '创建时间',
        dataIndex: 'create_time',
        valueType: 'dateTime',
        hideInSearch: true,
        width: 180,
      },
      {
        title: '更新时间',
        dataIndex: 'update_time',
        valueType: 'dateTime',
        hideInSearch: true,
        width: 180,
      },
      {
        valueType: 'option',
        fixed: 'right',
        width: 140,
        render: (_, record: ITestCase) => {
          return (
            <Space size="small">
              <Link
                style={{
                  color: colors.primary,
                  cursor: 'pointer',
                  transition: `color ${token.motionDurationFast}`,
                }}
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
              <Popconfirm title={'确认删除'}>
                <Link
                  style={{
                    color: colors.error,
                    cursor: 'pointer',
                  }}
                >
                  删除
                </Link>
              </Popconfirm>
            </Space>
          );
        },
      },
    ],
    [CASE_LEVEL_ENUM, colors, borderRadius, token],
  );

  const fetchPageData = useCallback(
    async (params: ITestCase, sort: any) => {
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

  return (
    <>
      <MyDrawer
        name={'动态'}
        width={'40%'}
        open={showDynamic}
        setOpen={setShowDynamic}
        drawerStyles={drawerStyles}
      >
        <DynamicInfo caseId={currentCaseId} />
      </MyDrawer>
      <MyDrawer
        name={'用例详情'}
        open={showCaseDetail}
        setOpen={setShowCaseDetail}
        drawerStyles={drawerStyles}
      >
        <TestCaseDetail
          testcase={currentCase}
          callback={() => {
            actionRef.current?.reload();
          }}
        />
      </MyDrawer>
      <MyProTable
        actionRef={actionRef}
        persistenceKey={perKey}
        request={fetchPageData}
        columns={column}
        rowKey={'uid'}
      />
    </>
  );
};

export default CaseDataTable;

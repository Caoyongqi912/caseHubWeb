import { updateTestCase } from '@/api/case/testCase';
import { CaseHubConfig } from '@/pages/CaseHub/CaseConfig';
import {
  caseLevelColors,
  caseStatusColors,
  useCaseHubTheme,
} from '@/pages/CaseHub/styles';
import CaseSubSteps from '@/pages/CaseHub/TestCase/CaseSubSteps';
import { ITestCase } from '@/pages/CaseHub/type';
import { CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';
import {
  ProCard,
  ProForm,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { Divider, Form, Space, Tag, Typography } from 'antd';
import { FC, useEffect, useMemo, useRef, useState } from 'react';

const { Text, Title } = Typography;

interface Props {
  testcase?: ITestCase;
  callback: () => void;
}

const TestCaseDetail: FC<Props> = ({ testcase, callback }) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [caseForm] = Form.useForm<ITestCase>();
  const [editStatus, setEditStatus] = useState<number>(0);
  const { CASE_LEVEL_OPTION, CASE_TYPE_OPTION, CASE_TYPE_ENUM } = CaseHubConfig;
  const { token, colors, spacing, borderRadius, shadows } = useCaseHubTheme();

  useEffect(() => {
    if (!testcase) return;
    caseForm.setFieldsValue(testcase);
  }, [testcase, caseForm]);

  const reload = () => {
    setEditStatus((prev) => prev + 1);
  };

  const statusConfig =
    caseStatusColors[testcase?.case_status || 0] || caseStatusColors[0];
  const levelConfig =
    caseLevelColors[testcase?.case_level as keyof typeof caseLevelColors] ||
    caseLevelColors.P2;

  const onValuesChange = async (_values: any, allValues: ITestCase) => {
    if (!testcase) return;
    const data = { id: testcase.id, ...allValues };
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      const { code } = await updateTestCase(data);
      if (code === 0) {
        setEditStatus(2);
        setTimeout(() => setEditStatus(0), 2000);
        callback();
      }
    }, 1500);
  };

  const StatusIndicator = () => {
    const status = testcase?.case_status;
    if (status === undefined) return null;
    const isSuccess = status === 1;
    const isPending = status === 0 || status === undefined;
    return (
      <Tag
        icon={isSuccess ? <CheckCircleFilled /> : <CloseCircleFilled />}
        style={{
          padding: '6px 14px',
          borderRadius: borderRadius.round,
          background: statusConfig.bg,
          border: `1px solid ${statusConfig.border}`,
          color: statusConfig.text,
          fontWeight: 600,
          fontSize: 13,
        }}
      >
        {isSuccess ? '通过' : isPending ? '待执行' : '失败'}
      </Tag>
    );
  };

  const containerStyle = useMemo(
    () => ({
      minHeight: '100%',
      background: `
        radial-gradient(ellipse at 0% 0%, ${colors.primaryBg}30 0%, transparent 50%),
        linear-gradient(180deg, ${colors.bgContainer} 0%, ${colors.bgLayout} 100%)
      `,
      padding: spacing.lg,
    }),
    [colors, spacing],
  );

  const mainCardStyle = useMemo(
    () => ({
      borderRadius: borderRadius.xxl,
      border: `1px solid ${colors.border}`,
      overflow: 'hidden' as const,
      boxShadow: shadows.lg,
    }),
    [borderRadius, colors, shadows],
  );

  const headerStyle = useMemo(
    () => ({
      padding: `${spacing.xl}px ${spacing.xxl}px`,
      background: `linear-gradient(135deg, ${colors.primaryBg} 0%, ${colors.bgContainer} 100%)`,
      borderBottom: `1px solid ${colors.borderSecondary}`,
    }),
    [colors, spacing],
  );

  const uidBadgeStyle = useMemo(
    () => ({
      display: 'inline-flex',
      alignItems: 'center',
      gap: spacing.sm,
      padding: `${spacing.xs}px ${spacing.md}px`,
      borderRadius: borderRadius.lg,
      background: `${colors.primary}10`,
      border: `1px solid ${colors.primary}30`,
    }),
    [colors, spacing, borderRadius],
  );

  const bodyStyle = useMemo(
    () => ({
      padding: spacing.xxl,
    }),
    [spacing],
  );

  const metaRowStyle = useMemo(
    () => ({
      display: 'flex',
      alignItems: 'center',
      gap: spacing.lg,
      padding: `${spacing.md}px ${spacing.xxl}px`,
      background: colors.bgLayout,
      borderBottom: `1px solid ${colors.borderSecondary}`,
    }),
    [colors, spacing],
  );

  const metaItemStyle = useMemo(
    () => ({
      display: 'flex',
      alignItems: 'center',
      gap: spacing.xs,
    }),
    [spacing],
  );

  const fieldLabelStyle = useMemo(
    () => ({
      color: colors.textSecondary,
      fontWeight: 500,
      fontSize: 13,
    }),
    [colors],
  );

  return (
    <div style={containerStyle}>
      <ProCard style={mainCardStyle} bodyStyle={{ padding: 0 }}>
        <div style={headerStyle}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Space size="middle">
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: borderRadius.lg,
                  background: `linear-gradient(135deg, ${colors.primary} 0%, ${
                    colors.primaryHover || colors.primary
                  } 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 4px 12px ${colors.primary}30`,
                }}
              >
                <Text style={{ color: '#fff', fontSize: 18, fontWeight: 700 }}>
                  {testcase?.uid?.slice(-2) || 'TC'}
                </Text>
              </div>
              <div>
                <div style={uidBadgeStyle}>
                  <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                    编号
                  </Text>
                  <Text strong style={{ fontSize: 13, color: colors.primary }}>
                    {testcase?.uid || '-'}
                  </Text>
                </div>
              </div>
            </Space>

            <Space size="middle">
              <StatusIndicator />
              <Tag
                style={{
                  padding: '4px 12px',
                  borderRadius: borderRadius.md,
                  background: levelConfig.bg,
                  border: `1px solid ${levelConfig.border}`,
                  color: levelConfig.text,
                  fontWeight: 600,
                  fontSize: 12,
                }}
              >
                {testcase?.case_level || 'P2'}
              </Tag>
              <Tag
                style={{
                  padding: '4px 12px',
                  borderRadius: borderRadius.md,
                  background: colors.infoBg,
                  border: `1px solid ${colors.info}`,
                  color: colors.info,
                  fontWeight: 600,
                  fontSize: 12,
                }}
              >
                {CASE_TYPE_ENUM[testcase?.case_type as number] || '普通'}
              </Tag>
            </Space>
          </div>

          <Title
            level={4}
            style={{
              margin: `${spacing.md}px 0 0`,
              fontWeight: 600,
              color: colors.text,
              fontSize: 18,
            }}
          >
            {testcase?.case_name || '用例详情'}
          </Title>
        </div>

        <div style={metaRowStyle}>
          <div style={metaItemStyle}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              创建者
            </Text>
            <Text style={{ fontSize: 12, fontWeight: 500 }}>
              {testcase?.creatorName || '-'}
            </Text>
          </div>

          {testcase?.is_common && (
            <>
              <Divider type="vertical" style={{ margin: 0, height: 16 }} />
              <Tag style={{ borderRadius: borderRadius.sm, fontSize: 11 }}>
                公共用例
              </Tag>
            </>
          )}
          {testcase?.is_review && (
            <>
              <Divider type="vertical" style={{ margin: 0, height: 16 }} />
              <Tag
                color="green"
                style={{ borderRadius: borderRadius.sm, fontSize: 11 }}
              >
                已评审
              </Tag>
            </>
          )}
        </div>

        <div style={bodyStyle}>
          <ProForm
            form={caseForm}
            onValuesChange={onValuesChange}
            submitter={false}
            layout="horizontal"
            style={{ marginBottom: spacing.xl }}
          >
            <ProFormText
              name="case_name"
              label={'用例标题'}
              placeholder="请输入用例标题"
              required
              width="lg"
              tooltip="最长20位"
              rules={[{ required: true, message: '标题不能为空' }]}
              fieldProps={{
                variant: 'filled',
              }}
            />
            <ProForm.Group style={{ margin: 2 }}>
              <ProFormSelect
                label={'用例等级'}
                required
                width="md"
                name="case_level"
                options={CASE_LEVEL_OPTION}
                fieldProps={{
                  variant: 'filled',
                  style: { borderRadius: borderRadius.lg },
                }}
              />
              <ProFormSelect
                label={'用例类型'}
                required
                width="md"
                name="case_type"
                options={CASE_TYPE_OPTION}
                fieldProps={{
                  variant: 'filled',
                  style: { borderRadius: borderRadius.lg },
                }}
              />
            </ProForm.Group>
          </ProForm>

          <Divider
            style={{
              margin: `${spacing.lg}px 0`,
              borderColor: colors.borderSecondary,
            }}
          />

          <div>
            <Text
              strong
              style={{
                fontSize: 15,
                color: colors.text,
                marginBottom: spacing.md,
                display: 'block',
              }}
            >
              测试步骤
            </Text>
            <CaseSubSteps
              caseId={testcase?.id}
              hiddenStatusBut={true}
              callback={reload}
              case_status={testcase?.case_status}
              case_setup={testcase?.case_setup}
              case_mark={testcase?.case_mark}
            />
          </div>
        </div>
      </ProCard>
    </div>
  );
};

export default TestCaseDetail;

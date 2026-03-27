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
import { Form, Space, Typography } from 'antd';
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
  }, [testcase]);

  const reload = () => {
    setEditStatus(editStatus + 1);
  };

  const statusConfig =
    caseStatusColors[testcase?.case_status || 0] || caseStatusColors[0];
  const levelConfig =
    caseLevelColors[testcase?.case_level as keyof typeof caseLevelColors] ||
    caseLevelColors.P2;

  const containerStyle = useMemo(
    () => ({
      minHeight: '100%',
      background: `
        radial-gradient(ellipse at 20% 0%, ${colors.primaryBg}40 0%, transparent 50%),
        radial-gradient(ellipse at 80% 100%, ${statusConfig.bg}30 0%, transparent 50%),
        linear-gradient(180deg, ${colors.bgContainer} 0%, ${colors.bgLayout} 100%)
      `,
      padding: spacing.lg,
    }),
    [colors, spacing, statusConfig],
  );

  const mainCardStyle = useMemo(
    () => ({
      borderRadius: borderRadius.xxl,
      border: `1px solid ${colors.border}`,
      overflow: 'hidden' as const,
      boxShadow: shadows.xl,
      background: colors.bgContainer,
    }),
    [borderRadius, colors, shadows],
  );

  const heroStyle = useMemo(
    () => ({
      position: 'relative' as const,
      padding: `${spacing.xxl}px ${spacing.xxl}px ${spacing.xl}px`,
      background: `
        linear-gradient(135deg, ${colors.primary}08 0%, ${statusConfig.bg}20 50%, ${colors.infoBg}10 100%)
      `,
      borderBottom: `1px solid ${colors.borderSecondary}`,
    }),
    [colors, spacing, statusConfig],
  );

  const statusBadgeStyle = useMemo(
    () => ({
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      padding: '8px 16px',
      borderRadius: borderRadius.round,
      background: statusConfig.bg,
      border: `1px solid ${statusConfig.border}`,
      color: statusConfig.text,
      fontWeight: 700,
      fontSize: 14,
      boxShadow: `0 4px 16px ${statusConfig.bg}40`,
    }),
    [statusConfig, borderRadius],
  );

  const levelBadgeStyle = useMemo(
    () => ({
      display: 'inline-flex',
      alignItems: 'center',
      padding: '6px 14px',
      borderRadius: borderRadius.lg,
      background: levelConfig.bg,
      border: `1px solid ${levelConfig.border}`,
      color: levelConfig.text,
      fontWeight: 600,
      fontSize: 13,
      boxShadow: `0 2px 8px ${levelConfig.bg}40`,
    }),
    [levelConfig, borderRadius],
  );

  const typeBadgeStyle = useMemo(
    () => ({
      display: 'inline-flex',
      alignItems: 'center',
      padding: '6px 14px',
      borderRadius: borderRadius.lg,
      background: colors.infoBg,
      border: `1px solid ${colors.info}`,
      color: colors.info,
      fontWeight: 600,
      fontSize: 13,
    }),
    [colors, borderRadius],
  );

  const formSectionStyle = useMemo(
    () => ({
      padding: spacing.xl,
      background: colors.bgContainer,
    }),
    [colors, spacing],
  );

  const fieldLabelStyle = useMemo(
    () => ({
      color: colors.textSecondary,
      fontWeight: 500,
      fontSize: 13,
    }),
    [colors],
  );

  const onValuesChange = async (values: any, allValues: ITestCase) => {
    if (!testcase) return;
    const data = {
      id: testcase.id,
      ...allValues,
    };
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
    if (!testcase?.case_status) return null;
    const isSuccess = testcase.case_status === 1;
    return (
      <div style={statusBadgeStyle}>
        {isSuccess ? (
          <CheckCircleFilled style={{ fontSize: 16 }} />
        ) : (
          <CloseCircleFilled style={{ fontSize: 16 }} />
        )}
        {isSuccess ? '通过' : testcase.case_status === 2 ? '失败' : '待开始'}
      </div>
    );
  };

  const statusTextMap = ['', '通过', '失败', '待开始'];
  const statusText = statusTextMap[testcase?.case_status || 0] || '待开始';

  return (
    <div style={containerStyle}>
      <ProCard style={mainCardStyle} bodyStyle={{ padding: 0 }}>
        <div style={heroStyle}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: spacing.lg,
            }}
          >
            <Space direction="vertical" size="middle">
              <Space align="center" size="middle">
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: borderRadius.lg,
                    background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryHover} 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 4px 16px ${colors.primary}40`,
                  }}
                >
                  <Text
                    style={{ color: '#fff', fontSize: 20, fontWeight: 700 }}
                  >
                    {testcase?.uid?.slice(-2) || 'TC'}
                  </Text>
                </div>
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    用例编号
                  </Text>
                  <div
                    style={{
                      color: colors.primary,
                      fontWeight: 600,
                      fontSize: 14,
                    }}
                  >
                    {testcase?.uid}
                  </div>
                </div>
              </Space>
              <Title
                level={4}
                style={{ margin: 0, fontWeight: 600, color: colors.text }}
              >
                {testcase?.case_name || '用例详情'}
              </Title>
            </Space>
            <Space direction="vertical" align="end" size="middle">
              <StatusIndicator />
              <Space size="middle">
                <span style={levelBadgeStyle}>
                  {testcase?.case_level || 'P2'}
                </span>
                <span style={typeBadgeStyle}>
                  {CASE_TYPE_ENUM[testcase?.case_type as number] || '普通'}
                </span>
              </Space>
            </Space>
          </div>
        </div>

        <div style={formSectionStyle}>
          <ProForm
            form={caseForm}
            onValuesChange={onValuesChange}
            submitter={false}
            layout="horizontal"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 18 }}
            style={{ marginBottom: spacing.lg }}
          >
            <ProFormText
              name={'case_name'}
              label={<span style={fieldLabelStyle}>用例标题</span>}
              placeholder={'请输入用例标题'}
              required={true}
              tooltip={'最长20位'}
              rules={[{ required: true, message: '标题不能为空' }]}
              fieldProps={{
                variant: 'filled',
                style: { fontWeight: 500, borderRadius: borderRadius.lg },
              }}
            />
            <ProForm.Group>
              <ProFormSelect
                label={<span style={fieldLabelStyle}>用例等级</span>}
                required={true}
                width={'md'}
                name={'case_level'}
                options={CASE_LEVEL_OPTION}
                fieldProps={{
                  variant: 'filled',
                  style: { borderRadius: borderRadius.lg },
                }}
                //@ts-ignore
                renderFormItem={(_, formProps) => {
                  const value = formProps.value;
                  const lc =
                    caseLevelColors[value as keyof typeof caseLevelColors] ||
                    caseLevelColors.P2;
                  return (
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '6px 16px',
                        borderRadius: borderRadius.lg,
                        background: lc.bg,
                        border: `1px solid ${lc.border}`,
                        color: lc.text,
                        fontWeight: 600,
                      }}
                    >
                      {value || 'P2'}
                    </div>
                  );
                }}
              />
              <ProFormSelect
                label={<span style={fieldLabelStyle}>用例类型</span>}
                required={true}
                width={'md'}
                name={'case_type'}
                options={CASE_TYPE_OPTION}
                fieldProps={{
                  variant: 'filled',
                  style: { borderRadius: borderRadius.lg },
                }}
                //@ts-ignore
                renderFormItem={(_, formProps) => {
                  const value = formProps.value;
                  return (
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '6px 16px',
                        borderRadius: borderRadius.lg,
                        background: colors.infoBg,
                        border: `1px solid ${colors.info}`,
                        color: colors.info,
                        fontWeight: 600,
                      }}
                    >
                      {CASE_TYPE_ENUM[value as number] || '普通'}
                    </div>
                  );
                }}
              />
            </ProForm.Group>
          </ProForm>

          <CaseSubSteps
            caseId={testcase?.id}
            hiddenStatusBut={true}
            callback={reload}
            case_status={testcase?.case_status}
            case_setup={testcase?.case_setup}
            case_mark={testcase?.case_mark}
          />
        </div>
      </ProCard>
    </div>
  );
};

export default TestCaseDetail;

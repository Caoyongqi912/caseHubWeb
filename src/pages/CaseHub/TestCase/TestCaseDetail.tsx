import { updateTestCase } from '@/api/case/testCase';
import { CaseHubConfig } from '@/pages/CaseHub/CaseConfig';
import { useCaseHubTheme } from '@/pages/CaseHub/styles';
import CaseSubSteps from '@/pages/CaseHub/TestCase/CaseSubSteps';
import { ITestCase } from '@/pages/CaseHub/type';
import {
  ProCard,
  ProForm,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { Form, Space, Tag, Typography } from 'antd';
import { FC, useEffect, useMemo, useRef } from 'react';

const { Text } = Typography;

interface Props {
  testcase?: ITestCase;
  callback: () => void;
}

const TestCaseDetail: FC<Props> = ({ testcase, callback }) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [caseForm] = Form.useForm<ITestCase>();
  const { CASE_LEVEL_OPTION, CASE_TYPE_OPTION } = CaseHubConfig;
  const { colors, spacing, borderRadius, shadows } = useCaseHubTheme();

  useEffect(() => {
    if (!testcase) return;
    caseForm.setFieldsValue(testcase);
  }, [testcase, caseForm]);

  const onValuesChange = async (_values: any, allValues: ITestCase) => {
    if (!testcase) return;
    const data = { id: testcase.id, ...allValues };
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      const { code } = await updateTestCase(data);
      if (code === 0) {
        callback();
      }
    }, 1500);
  };

  const sectionHeaderStyle = useMemo(
    () => ({
      display: 'flex',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.lg,
    }),
    [spacing],
  );

  const sectionTitleStyle = useMemo(
    () => ({
      fontSize: 15,
      fontWeight: 600,
      color: colors.text,
      letterSpacing: 0.5,
    }),
    [colors],
  );

  const sectionDividerStyle = useMemo(
    () => ({
      flex: 1,
      height: 1,
      background: `linear-gradient(90deg, ${colors.borderSecondary} 0%, transparent 100%)`,
    }),
    [colors],
  );

  const infoItemStyle = useMemo(
    () => ({
      display: 'flex',
      alignItems: 'center',
      gap: spacing.md,
      padding: `${spacing.md}px ${spacing.lg}px`,
      background: colors.bgLayout,
      borderRadius: borderRadius.md,
      border: `1px solid ${colors.borderSecondary}`,
    }),
    [colors, spacing, borderRadius],
  );

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
      padding: `${spacing.lg}px ${spacing.xl}px`,
      background: `linear-gradient(135deg, ${colors.primaryBg} 0%, ${colors.bgContainer} 100%)`,
      borderBottom: `1px solid ${colors.borderSecondary}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }),
    [colors, spacing],
  );

  const bodyStyle = useMemo(
    () => ({
      padding: spacing.xl,
    }),
    [spacing],
  );

  return (
    <div style={containerStyle}>
      <ProCard style={mainCardStyle} bodyStyle={{ padding: 0 }}>
        <div style={headerStyle}>
          <Space size="middle">
            <div style={infoItemStyle}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                创建者
              </Text>
              <Text style={{ fontSize: 13, fontWeight: 500 }}>
                {testcase?.creatorName || '-'}
              </Text>
            </div>
          </Space>
          <Space size="middle">
            {testcase?.is_common && (
              <Tag
                style={{
                  borderRadius: borderRadius.sm,
                  fontSize: 11,
                  margin: 0,
                  background: `${colors.success}15`,
                  borderColor: `${colors.success}30`,
                  color: colors.success,
                }}
              >
                公共用例
              </Tag>
            )}
            {testcase?.is_review && (
              <Tag
                color="green"
                style={{
                  borderRadius: borderRadius.sm,
                  fontSize: 11,
                  margin: 0,
                }}
              >
                已评审
              </Tag>
            )}
          </Space>
        </div>

        <div style={bodyStyle}>
          <div style={sectionHeaderStyle}>
            <Text style={sectionTitleStyle}>基本信息</Text>
            <div style={sectionDividerStyle} />
          </div>

          <ProForm
            form={caseForm}
            onValuesChange={onValuesChange}
            submitter={false}
            layout="horizontal"
            style={{ marginBottom: spacing.xl }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: spacing.lg,
              }}
            >
              <div>
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
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: spacing.md,
                }}
              >
                <ProFormSelect
                  label={'用例等级'}
                  required
                  name="case_level"
                  options={CASE_LEVEL_OPTION}
                  fieldProps={{
                    variant: 'filled',
                  }}
                />
                {/* <ProFormSelect
                  label={'用例类型'}
                  required
                  name="case_type"
                  options={CASE_TYPE_OPTION}
                  fieldProps={{
                    variant: 'filled',
                  }}
                /> */}
              </div>
            </div>
          </ProForm>

          <div style={sectionHeaderStyle}>
            <Text style={sectionTitleStyle}>测试步骤</Text>
            <div style={sectionDividerStyle} />
          </div>

          <CaseSubSteps
            caseId={testcase?.id}
            hiddenStatusBut={true}
            callback={() => {}}
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

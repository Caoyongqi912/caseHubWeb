import { updateTestCase } from '@/api/case/testCase';
import { CaseHubConfig } from '@/pages/CaseHub/CaseConfig';
import {
  caseLevelColors,
  caseStatusColors,
  useTestCaseDetailStyles,
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
import { FC, useEffect, useRef, useState } from 'react';

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
  const styles = useTestCaseDetailStyles();

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
    if (!testcase?.case_status) return null;
    const isSuccess = testcase.case_status === 1;
    return (
      <div style={styles.statusBadgeStyle(statusConfig)}>
        {isSuccess ? (
          <CheckCircleFilled style={{ fontSize: 16 }} />
        ) : (
          <CloseCircleFilled style={{ fontSize: 16 }} />
        )}
        {isSuccess ? '通过' : testcase.case_status === 2 ? '失败' : '待开始'}
      </div>
    );
  };

  return (
    <div style={styles.containerStyle(statusConfig)}>
      <ProCard style={styles.mainCardStyle()} bodyStyle={{ padding: 0 }}>
        <div style={styles.heroStyle(statusConfig)}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: 16,
            }}
          >
            <Space direction="vertical" size="middle">
              <Space align="center" size="middle">
                <div style={styles.avatarBoxStyle()}>
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
                  <div style={styles.uidTextStyle()}>{testcase?.uid}</div>
                </div>
              </Space>
              <Title level={4} style={{ margin: 0, fontWeight: 600 }}>
                {testcase?.case_name || '用例详情'}
              </Title>
            </Space>
            <Space direction="vertical" align="end" size="middle">
              <StatusIndicator />
              <Space size="middle">
                <span style={styles.levelBadgeStyle(levelConfig)}>
                  {testcase?.case_level || 'P2'}
                </span>
                <span style={styles.typeBadgeStyle()}>
                  {CASE_TYPE_ENUM[testcase?.case_type as number] || '普通'}
                </span>
              </Space>
            </Space>
          </div>
        </div>

        <div style={styles.formSectionStyle()}>
          <ProForm
            form={caseForm}
            onValuesChange={onValuesChange}
            submitter={false}
            layout="horizontal"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 18 }}
            style={{ marginBottom: 16 }}
          >
            <ProFormText
              name={'case_name'}
              label={<span style={styles.fieldLabelStyle()}>用例标题</span>}
              placeholder={'请输入用例标题'}
              required={true}
              tooltip={'最长20位'}
              rules={[{ required: true, message: '标题不能为空' }]}
              fieldProps={{
                variant: 'filled',
                style: { fontWeight: 500, borderRadius: 8 },
              }}
            />
            <ProForm.Group>
              <ProFormSelect
                label={<span style={styles.fieldLabelStyle()}>用例等级</span>}
                required={true}
                width={'md'}
                name={'case_level'}
                options={CASE_LEVEL_OPTION}
                fieldProps={{
                  variant: 'filled',
                  style: { borderRadius: 8 },
                }}
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
                        borderRadius: 8,
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
                label={<span style={styles.fieldLabelStyle()}>用例类型</span>}
                required={true}
                width={'md'}
                name={'case_type'}
                options={CASE_TYPE_OPTION}
                fieldProps={{
                  variant: 'filled',
                  style: { borderRadius: 8 },
                }}
                renderFormItem={(_, formProps) => {
                  const value = formProps.value;
                  return (
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '6px 16px',
                        borderRadius: 8,
                        background: '#e6f7ff',
                        border: '1px solid #91d5ff',
                        color: '#1890ff',
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

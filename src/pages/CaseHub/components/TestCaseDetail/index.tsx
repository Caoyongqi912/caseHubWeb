import { updateTestCase } from '@/api/case/testCase';
import CaseSubSteps from '@/pages/CaseHub/components/CaseSubSteps';
import { CaseHubConfig } from '@/pages/CaseHub/config/constants';
import { useCaseHubTheme } from '@/pages/CaseHub/styles';
import { ITestCase } from '@/pages/CaseHub/types';
import { ProCard, ProForm, ProFormText } from '@ant-design/pro-components';
import { Form, Space, Tag, Typography } from 'antd';
import { FC, useEffect, useRef } from 'react';
import { useTestCaseDetailStyles } from './styles';

const { Text } = Typography;

interface Props {
  testcase?: ITestCase;
  callback: () => void;
}

const TestCaseDetail: FC<Props> = ({ testcase, callback }) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [caseForm] = Form.useForm<ITestCase>();
  const { CASE_LEVEL_OPTION } = CaseHubConfig;
  const { colors, spacing, borderRadius } = useCaseHubTheme();
  const styles = useTestCaseDetailStyles();

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

  return (
    <div style={styles.container()}>
      <ProCard style={styles.mainCard()} bodyStyle={{ padding: 0 }}>
        <div style={styles.header()}>
          <Space size="middle">
            <div style={styles.infoItem()}>
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
              <Tag style={styles.commonTag()}>公共用例</Tag>
            )}
            {testcase?.is_review && (
              <Tag color="green" style={styles.reviewTag()}>
                已评审
              </Tag>
            )}
          </Space>
        </div>

        <div style={styles.body()}>
          <div style={styles.sectionHeader()}>
            <Text style={styles.sectionTitle()}>基本信息</Text>
            <div style={styles.sectionDivider()} />
          </div>

          <ProForm
            form={caseForm}
            onValuesChange={onValuesChange}
            submitter={false}
            layout="horizontal"
            style={{ marginBottom: spacing.xl }}
          >
            <div style={styles.formGrid()}>
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
              {/* <div style={styles.formSubGrid()}>
                <ProFormSelect
                  label={'用例等级'}
                  required
                  name="case_level"
                  options={CASE_LEVEL_OPTION}
                  fieldProps={{
                    variant: 'filled',
                  }}
                />
              </div> */}
            </div>
          </ProForm>

          <div style={styles.sectionHeader()}>
            <Text style={styles.sectionTitle()}>测试步骤</Text>
            <div style={styles.sectionDivider()} />
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

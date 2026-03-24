import Handler from '@/components/DnDDraggable/handler';
import { IPlayStepContent } from '@/pages/Play/componets/uiTypes';
import { BranchesOutlined } from '@ant-design/icons';
import { ProCard, useToken } from '@ant-design/pro-components';
import { Space, Tag, Typography } from 'antd';
import { FC, useEffect, useState } from 'react';
import ContentExtra from '../../contentExtra';
import ConditionContentInfo from './ConditionContentInfo';
const { Text } = Typography;
interface Props {
  id: number;
  step: number;
  caseId: number;
  stepContent: IPlayStepContent;
  callback: () => void;
}

const Index: FC<Props> = ({ id, step, caseId, stepContent, callback }) => {
  const { token } = useToken();
  const [showOption, setShowOption] = useState(false);
  const [conditionKey, setConditionKey] = useState<string>();
  const [conditionValue, setConditionValue] = useState<string>();
  const [conditionOperator, setConditionOperator] = useState<string>();

  useEffect(() => {
    if (conditionKey) setConditionKey(conditionKey);
    if (conditionOperator) setConditionOperator(conditionOperator);
    if (conditionValue) setConditionValue(conditionValue);
  }, [conditionKey, conditionValue, conditionOperator]);

  const conditionTitle = (
    <>
      <Space size={8} align="center">
        <Handler id={id} step={step} />
        <Tag
          icon={<BranchesOutlined />}
          style={{
            background: '#fef3c7',
            color: '#d97706',
            border: '1px solid #d9770620',
            fontWeight: 600,
            fontSize: '12px',
            padding: '2px 8px',
            borderRadius: token.borderRadiusSM,
          }}
        >
          IF
        </Tag>
        {conditionKey && (
          <Text type={'warning'} strong style={{ fontSize: '14px' }}>
            {conditionKey}
          </Text>
        )}
        {conditionOperator && (
          <>
            <Text
              strong
              style={{
                fontSize: '14px',
                color: token.colorText,
              }}
            >
              {conditionOperator}
            </Text>
            {conditionValue && (
              <Text type={'warning'} strong style={{ fontSize: '14px' }}>
                {conditionValue}
              </Text>
            )}
          </>
        )}
      </Space>
    </>
  );

  return (
    <>
      <ProCard
        bordered
        collapsible
        hoverable
        bodyStyle={{ padding: 0 }}
        defaultCollapsed
        style={{
          borderRadius: token.borderRadiusLG,
          boxShadow: showOption
            ? `0 4px 12px ${token.colorPrimaryBg}`
            : `0 1px 3px ${token.colorBgLayout}`,
          transition: 'all 0.3s ease',
          borderColor: showOption
            ? token.colorPrimaryBorder
            : token.colorBorder,
        }}
        onMouseEnter={() => {
          setShowOption(true);
        }}
        onMouseLeave={() => {
          setShowOption(false);
        }}
        collapsibleIconRender={({}) => {
          return conditionTitle;
        }}
        extra={
          <ContentExtra
            stepContent={stepContent}
            caseId={caseId}
            callback={callback}
            show={showOption}
          />
        }
      >
        <ConditionContentInfo
          case_id={caseId}
          stepContent={stepContent}
          setKey={setConditionKey}
          setValue={setConditionValue}
          setOperator={setConditionOperator}
        />
      </ProCard>
    </>
  );
};

export default Index;

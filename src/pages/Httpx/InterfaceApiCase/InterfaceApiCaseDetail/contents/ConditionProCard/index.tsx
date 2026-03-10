import Handler from '@/components/DnDDraggable/handler';
import CardExtraOption from '@/pages/Httpx/InterfaceApiCase/InterfaceApiCaseDetail/contents/CardExtraOption';
import ApiCondition from '@/pages/Httpx/InterfaceApiCase/InterfaceApiCaseDetail/contents/ConditionProCard/ApiCondition';
import { IInterfaceCaseContent } from '@/pages/Httpx/types';
import { BranchesOutlined } from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import { Space, Tag, theme, Typography } from 'antd';
import { FC, useEffect, useMemo, useState } from 'react';

const { Text } = Typography;
const { useToken } = theme;

interface Props {
  id: number;
  step: number;
  caseId: number;
  caseContent: IInterfaceCaseContent;
  projectId?: number;
  callback?: () => void;
}

const Index: FC<Props> = (props) => {
  const { token } = useToken();
  const { step, id, projectId, caseId, caseContent, callback } = props;
  const [showOption, setShowOption] = useState(false);
  const [conditionKey, setConditionKey] = useState<string>();
  const [conditionValue, setConditionValue] = useState<string>();
  const [conditionOperator, setConditionOperator] = useState<string>();

  useEffect(() => {
    if (conditionKey) setConditionKey(conditionKey);
    if (conditionOperator) setConditionOperator(conditionOperator);
    if (conditionValue) setConditionValue(conditionValue);
  }, [conditionKey, conditionValue, conditionOperator]);

  const conditionTitle = useMemo(
    () => (
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
          <Text
            strong
            style={{
              fontSize: '14px',
              color: token.colorText,
            }}
          >
            {conditionOperator}
          </Text>
        )}
        {conditionValue && (
          <Text type={'warning'} strong style={{ fontSize: '14px' }}>
            {conditionValue}
          </Text>
        )}
      </Space>
    ),
    [id, step, conditionKey, conditionOperator, conditionValue, token],
  );

  return (
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
        borderColor: showOption ? token.colorPrimaryBorder : token.colorBorder,
      }}
      onMouseEnter={() => {
        setShowOption(true);
      }}
      onMouseLeave={() => {
        setShowOption(false);
      }}
      extra={
        <CardExtraOption
          show={showOption}
          callback={callback}
          caseContent={caseContent}
          caseId={caseId}
        />
      }
      collapsibleIconRender={({}) => {
        return conditionTitle;
      }}
    >
      <ApiCondition
        case_id={caseId}
        projectId={projectId}
        caseContent={caseContent}
        setKey={setConditionKey}
        setValue={setConditionValue}
        setOperator={setConditionOperator}
      />
    </ProCard>
  );
};

export default Index;

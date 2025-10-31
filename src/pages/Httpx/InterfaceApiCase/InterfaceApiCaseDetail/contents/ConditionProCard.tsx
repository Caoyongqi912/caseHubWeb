import ApiCondition from '@/pages/Httpx/InterfaceApiCase/InterfaceApiCaseDetail/contents/ApiCondition';
import CardExtraOption from '@/pages/Httpx/InterfaceApiCase/InterfaceApiCaseDetail/contents/CardExtraOption';
import { IInterfaceCaseContent } from '@/pages/Httpx/types';
import { CONFIG } from '@/utils/config';
import {
  DownOutlined,
  RightOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import { Space, Tag, Typography } from 'antd';
import { FC, useEffect, useState } from 'react';

const { Text } = Typography;

interface Props {
  step: number;
  caseId: number;
  caseContent: IInterfaceCaseContent;
  projectId?: number;
  callback?: () => void;
}

const ConditionProCard: FC<Props> = (props) => {
  const { step, projectId, caseId, caseContent, callback } = props;
  const [showOption, setShowOption] = useState(false);
  const [conditionKey, setConditionKey] = useState<string>();
  const [conditionValue, setConditionValue] = useState<string>();
  const [conditionOperator, setConditionOperator] = useState<string>();

  const { InterfaceCaseContentType } = CONFIG;
  useEffect(() => {
    if (conditionKey) setConditionKey(conditionKey);
    if (conditionOperator) setConditionOperator(conditionOperator);
    if (conditionValue) setConditionValue(conditionValue);
  }, [conditionKey, conditionValue, conditionOperator]);

  return (
    <ProCard
      bordered
      collapsible
      hoverable
      defaultCollapsed
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
      collapsibleIconRender={({ collapsed }) => {
        return (
          <Space>
            <UnorderedListOutlined
              style={{ color: '#c3cad4', marginRight: 20 }}
            />
            <Tag color={'green-inverse'}>STEP_{step}</Tag>
            <Tag color={'purple-inverse'}>IF</Tag>
            <>{collapsed ? <RightOutlined /> : <DownOutlined />}</>

            <Text type={'warning'}> {conditionKey}</Text>
            <Text strong> {conditionOperator}</Text>
            <Text type={'warning'}> {conditionValue}</Text>
          </Space>
        );
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

export default ConditionProCard;

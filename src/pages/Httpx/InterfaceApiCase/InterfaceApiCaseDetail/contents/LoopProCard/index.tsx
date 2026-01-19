import Handler from '@/components/DnDDraggable/handler';
import CardExtraOption from '@/pages/Httpx/InterfaceApiCase/InterfaceApiCaseDetail/contents/CardExtraOption';
import LoopSteps from '@/pages/Httpx/InterfaceApiCase/InterfaceApiCaseDetail/contents/LoopProCard/LoopSteps';
import { IInterfaceCaseContent } from '@/pages/Httpx/types';
import { RetweetOutlined } from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import { Space, Tag, Typography } from 'antd';
import { FC, useState } from 'react';

const { Text } = Typography;

interface Props {
  id: number;
  step: number;
  caseId: number;
  caseContent: IInterfaceCaseContent;
  projectId?: number;
  callback?: () => void;
}

const Index: FC<Props> = (props) => {
  const { id, step, caseId, caseContent, projectId, callback } = props;
  const [showOption, setShowOption] = useState(false);
  return (
    <ProCard
      bordered
      collapsible
      hoverable
      bodyStyle={{ padding: 0 }}
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
      collapsibleIconRender={() => {
        return (
          <Space>
            <Handler id={id} step={step} />
            <Tag color={'yellow-inverse'} icon={<RetweetOutlined />} />
            <Text strong>{'Loop 循环'}</Text>
          </Space>
        );
      }}
    >
      <LoopSteps
        case_id={caseId}
        caseContent={caseContent}
        callback={callback}
        projectId={projectId}
      />
    </ProCard>
  );
};

export default Index;

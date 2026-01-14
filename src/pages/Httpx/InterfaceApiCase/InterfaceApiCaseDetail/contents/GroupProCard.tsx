import Handler from '@/components/DnDDraggable/handler';
import GroupInterfaceTable from '@/pages/Httpx/Interface/interfaceApiGroup/GroupInterfaceTable';
import CardExtraOption from '@/pages/Httpx/InterfaceApiCase/InterfaceApiCaseDetail/contents/CardExtraOption';
import { IInterfaceCaseContent } from '@/pages/Httpx/types';
import { GroupOutlined } from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import { Space, Tag, Typography } from 'antd';
import { FC, useState } from 'react';

const { Text } = Typography;

interface Props {
  id: number;
  step: number;
  caseId: number;
  caseContent: IInterfaceCaseContent;
  callback?: () => void;
}

const GroupProCard: FC<Props> = (props) => {
  const { step, id, caseId, caseContent, callback } = props;
  const [showOption, setShowOption] = useState(false);

  return (
    <ProCard
      bordered
      collapsible
      hoverable
      defaultCollapsed
      bodyStyle={{ padding: 0 }}
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
        return (
          <Space>
            <Handler id={id} step={step} />
            <Tag color={'blue-inverse'} icon={<GroupOutlined />} />
            <Text strong>{caseContent.content_name}</Text>
            <Text type={'secondary'}>{caseContent.content_desc}</Text>
          </Space>
        );
      }}
    >
      <GroupInterfaceTable groupId={caseContent.target_id} />
    </ProCard>
  );
};

export default GroupProCard;

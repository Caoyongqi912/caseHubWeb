import GroupInterfaceTable from '@/pages/Httpx/Interface/interfaceApiGroup/GroupInterfaceTable';
import CardExtraOption from '@/pages/Httpx/InterfaceApiCase/InterfaceApiCaseDetail/contents/CardExtraOption';
import { IInterfaceCaseContent } from '@/pages/Httpx/types';
import { GroupOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import { Space, Tag, Typography } from 'antd';
import { FC, useState } from 'react';

const { Text } = Typography;

interface Props {
  step: number;
  caseId: number;
  caseContent: IInterfaceCaseContent;
  callback?: () => void;
}

const GroupProCard: FC<Props> = (props) => {
  const { step, caseId, caseContent, callback } = props;
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
            <UnorderedListOutlined
              style={{ color: '#c3cad4', marginRight: 20 }}
            />
            <Tag color={'green-inverse'}>STEP_{step}</Tag>
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

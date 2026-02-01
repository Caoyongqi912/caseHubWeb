import Handler from '@/components/DnDDraggable/handler';
import { IPlayStepContent } from '@/pages/Play/componets/uiTypes';
import ContentExtra from '@/pages/Play/PlayCase/PlayCaseDetail/PlayCaseStepContents/contentExtra';
import GroupTable from '@/pages/Play/PlayCase/PlayCaseDetail/PlayCaseStepContents/contents/PlayGroupContent/GroupTable';
import { GroupOutlined } from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import { Space, Tag, Typography } from 'antd';
import { FC, useState } from 'react';

const { Text } = Typography;

interface Props {
  id: number;
  step: number;
  caseId: number;
  stepContent: IPlayStepContent;
  callback: () => void;
}

const Index: FC<Props> = (props) => {
  const { id, step, caseId, stepContent, callback } = props;
  const [showOption, setShowOption] = useState(false);

  return (
    <div>
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
          <ContentExtra
            stepContent={stepContent}
            caseId={caseId}
            callback={callback}
            show={showOption}
          />
        }
        collapsibleIconRender={({}) => {
          return (
            <Space>
              <Handler id={id} step={step} />
              <Tag color={'blue-inverse'} icon={<GroupOutlined />} />
              <Text strong>{stepContent.content_name}</Text>
              <Text type={'secondary'}>{stepContent.content_desc}</Text>
            </Space>
          );
        }}
      >
        <GroupTable groupId={stepContent.target_id} callback={callback} />
      </ProCard>
    </div>
  );
};

export default Index;

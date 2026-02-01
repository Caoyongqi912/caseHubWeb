import Handler from '@/components/DnDDraggable/handler';
import MyDrawer from '@/components/MyDrawer';
import { IPlayStepContent } from '@/pages/Play/componets/uiTypes';
import ContentExtra from '@/pages/Play/PlayCase/PlayCaseDetail/PlayCaseStepContents/contentExtra';
import PlayStepDetail from '@/pages/Play/PlayStep/PlayStepDetail';
import { PlayCircleOutlined } from '@ant-design/icons';
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

const PlayStepContent: FC<Props> = (props) => {
  const { id, step, stepContent, caseId, callback } = props;
  const [showOption, setShowOption] = useState(false);
  const [showPlayDetail, setShowPlayDetail] = useState(false);

  const selfCallback = () => {
    setShowPlayDetail(false);
    callback();
  };

  return (
    <div>
      <MyDrawer
        name={'步骤详情'}
        width={'auto'}
        open={showPlayDetail}
        setOpen={setShowPlayDetail}
      >
        <PlayStepDetail
          callback={selfCallback}
          play_step_id={stepContent.target_id}
        />
      </MyDrawer>
      <ProCard
        bordered
        collapsible={false}
        hoverable
        defaultCollapsed
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
            callback={selfCallback}
            show={showOption}
          />
        }
        title={
          <Space>
            <Handler id={id} step={step} />
            <Tag color={'gold-inverse'} icon={<PlayCircleOutlined />} />
            {stepContent.is_common ? (
              <Tag color={'#059669'}>共</Tag>
            ) : (
              <Tag color={'#DC2626'}>私</Tag>
            )}
            <Text strong>{stepContent.content_name}</Text>

            {stepContent.content_desc && (
              <Text type={'secondary'}>{stepContent.content_desc}</Text>
            )}
          </Space>
        }
        collapsibleIconRender={() => {
          return null;
        }}
        onClick={(event) => {
          event.stopPropagation();
          setShowPlayDetail(true);
        }}
      />
    </div>
  );
};

export default PlayStepContent;

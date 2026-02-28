import Handler from '@/components/DnDDraggable/handler';
import MyDrawer from '@/components/MyDrawer';
import InterfaceApiDetail from '@/pages/Httpx/Interface/InterfaceApiDetail';
import { IPlayStepContent } from '@/pages/Play/componets/uiTypes';
import ContentExtra from '@/pages/Play/PlayCase/PlayCaseDetail/PlayCaseStepContents/contentExtra';
import { ApiOutlined } from '@ant-design/icons';
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

const PlayStepInterfaceContent: FC<Props> = ({
  id,
  step,
  caseId,
  stepContent,
  callback,
}) => {
  const [showOption, setShowOption] = useState(false);
  const [showPlayInterfaceDetail, setShowPlayInterfaceDetail] = useState(false);
  const selfCallback = () => {
    setShowPlayInterfaceDetail(false);
    callback();
  };

  return (
    <div>
      <MyDrawer
        name={'接口详情'}
        width={'auto'}
        open={showPlayInterfaceDetail}
        setOpen={setShowPlayInterfaceDetail}
      >
        <InterfaceApiDetail
          interfaceId={stepContent.target_id}
          callback={selfCallback}
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
            <Tag color={'gold-inverse'} icon={<ApiOutlined />} />
            <Tag color={'#059669'}>API</Tag>
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
          setShowPlayInterfaceDetail(true);
        }}
      />
    </div>
  );
};

export default PlayStepInterfaceContent;

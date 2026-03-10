import Handler from '@/components/DnDDraggable/handler';
import MyDrawer from '@/components/MyDrawer';
import InterfaceApiDetail from '@/pages/Httpx/Interface/InterfaceApiDetail';
import { IPlayStepContent } from '@/pages/Play/componets/uiTypes';
import ContentExtra from '@/pages/Play/PlayCase/PlayCaseDetail/PlayCaseStepContents/contentExtra';
import { ApiOutlined } from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import { Space, Tag, theme, Typography } from 'antd';
import { FC, useMemo, useState } from 'react';

const { Text } = Typography;
const { useToken } = theme;

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
  const { token } = useToken();
  const [showOption, setShowOption] = useState(false);
  const [showPlayInterfaceDetail, setShowPlayInterfaceDetail] = useState(false);

  const selfCallback = () => {
    setShowPlayInterfaceDetail(false);
    callback();
  };

  const cardTitle = useMemo(
    () => (
      <Space size={8} align="center">
        <Handler id={id} step={step} />
        <Tag
          icon={<ApiOutlined />}
          style={{
            background: '#dbeafe',
            color: '#2563eb',
            border: '1px solid #2563eb20',
            fontWeight: 600,
            fontSize: '12px',
            padding: '2px 8px',
            borderRadius: token.borderRadiusSM,
          }}
        >
          API
        </Tag>
        <Text
          strong
          style={{
            fontSize: '14px',
            color: token.colorText,
            maxWidth: '400px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {stepContent.content_name}
        </Text>
        {stepContent.content_desc && (
          <Text type={'secondary'} style={{ fontSize: '12px' }}>
            {stepContent.content_desc}
          </Text>
        )}
      </Space>
    ),
    [id, step, stepContent, token],
  );

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
        style={{
          borderRadius: token.borderRadiusLG,
          boxShadow: showOption
            ? `0 4px 12px ${token.colorPrimaryBg}`
            : `0 1px 3px ${token.colorBgLayout}`,
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          borderColor: showOption
            ? token.colorPrimaryBorder
            : token.colorBorder,
        }}
        bodyStyle={{
          padding: 0,
        }}
        onMouseEnter={() => {
          setShowOption(true);
        }}
        onMouseLeave={() => {
          setShowOption(false);
        }}
        title={cardTitle}
        collapsibleIconRender={() => {
          return null;
        }}
        extra={
          <ContentExtra
            stepContent={stepContent}
            caseId={caseId}
            callback={selfCallback}
            show={showOption}
          />
        }
        onClick={(event) => {
          event.stopPropagation();
          setShowPlayInterfaceDetail(true);
        }}
      />
    </div>
  );
};

export default PlayStepInterfaceContent;

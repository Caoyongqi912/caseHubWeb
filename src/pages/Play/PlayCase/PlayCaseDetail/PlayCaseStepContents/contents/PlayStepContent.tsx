import Handler from '@/components/DnDDraggable/handler';
import MyDrawer from '@/components/MyDrawer';
import { IPlayStepContent } from '@/pages/Play/componets/uiTypes';
import ContentExtra from '@/pages/Play/PlayCase/PlayCaseDetail/PlayCaseStepContents/contentExtra';
import PlayStepDetail from '@/pages/Play/PlayStep/PlayStepDetail';
import {
  GlobalOutlined,
  LockOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons';
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

const PlayStepContent: FC<Props> = (props) => {
  const { token } = useToken();
  const { id, step, stepContent, caseId, callback } = props;
  const [showOption, setShowOption] = useState(false);
  const [showPlayDetail, setShowPlayDetail] = useState(false);

  const selfCallback = () => {
    setShowPlayDetail(false);
    callback();
  };

  const visibilityConfig = useMemo(() => {
    return stepContent.is_common
      ? {
          label: '公共',
          color: '#059669',
          bgColor: '#d1fae5',
          borderColor: '#05966920',
          icon: GlobalOutlined,
        }
      : {
          label: '私有',
          color: '#dc2626',
          bgColor: '#fee2e2',
          borderColor: '#dc262620',
          icon: LockOutlined,
        };
  }, [stepContent.is_common]);

  const VisibilityIcon = useMemo(() => {
    return visibilityConfig.icon;
  }, [visibilityConfig]);

  const cardTitle = useMemo(
    () => (
      <Space size={8} align="center">
        <Handler id={id} step={step} />
        <Tag
          icon={<PlayCircleOutlined />}
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
          步骤
        </Tag>
        <Tag
          icon={<VisibilityIcon />}
          style={{
            background: visibilityConfig.bgColor,
            color: visibilityConfig.color,
            border: `1px solid ${visibilityConfig.borderColor}`,
            fontWeight: 500,
            fontSize: '12px',
            padding: '2px 8px',
            borderRadius: token.borderRadiusSM,
          }}
        >
          {visibilityConfig.label}
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
    [id, step, stepContent, visibilityConfig, VisibilityIcon, token],
  );

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
          setShowPlayDetail(true);
        }}
      />
    </div>
  );
};

export default PlayStepContent;

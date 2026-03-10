import { updateCaseContent } from '@/api/inter/interCase';
import Handler from '@/components/DnDDraggable/handler';
import CardExtraOption from '@/pages/Httpx/InterfaceApiCase/InterfaceApiCaseDetail/contents/CardExtraOption';
import { TagConfig } from '@/pages/Httpx/InterfaceApiCase/InterfaceApiCaseDetail/contents/tagConfig';
import { IInterfaceCaseContent } from '@/pages/Httpx/types';
import { ClockCircleOutlined, EditOutlined } from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import { InputNumber, Space, Tag, theme, Typography } from 'antd';
import { FC, useEffect, useMemo, useState } from 'react';

const { Text } = Typography;
const { useToken } = theme;

interface Props {
  id: number;
  step: number;
  caseId: number;
  caseContent: IInterfaceCaseContent;
  callback?: () => void;
}

const WaitProCard: FC<Props> = (props) => {
  const { token } = useToken();
  const { step, id, caseId, caseContent, callback } = props;
  const [showOption, setShowOption] = useState(false);
  const [showWaitInput, setShowWaitInput] = useState(true);
  const [waitTime, setWaitTime] = useState<number>();
  const [showEditIcon, setShowEditIcon] = useState(false);

  useEffect(() => {
    if (caseContent.api_wait_time) {
      setWaitTime(caseContent.api_wait_time);
      setShowWaitInput(false);
    }
  }, [caseContent]);

  const updateWaitTime = async (value: number | undefined) => {
    if (value) {
      const { code, data } = await updateCaseContent({
        id: caseContent.id,
        api_wait_time: value,
      });
      if (code === 0) {
        if (data.api_wait_time) setWaitTime(data.api_wait_time);
        setShowEditIcon(false);
        setShowWaitInput(false);
      }
    } else {
      setShowWaitInput(true);
    }
  };

  const WAIT = useMemo(() => {
    if (waitTime && !showWaitInput) {
      return (
        <Space size={8}>
          <Text
            strong
            style={{
              fontSize: '14px',
              color: token.colorText,
            }}
          >
            {waitTime}
            <Text type={'warning'} style={{ fontSize: '12px' }}>
              s
            </Text>
          </Text>
          {showEditIcon && (
            <EditOutlined
              style={{
                color: token.colorPrimary,
                cursor: 'pointer',
              }}
              onClick={() => setShowWaitInput(true)}
            />
          )}
        </Space>
      );
    } else {
      return (
        <InputNumber
          style={{ width: '100%', maxWidth: '150px' }}
          value={waitTime}
          min={0}
          max={10}
          onChange={(value) => {
            if (value) setWaitTime(value);
          }}
          onBlur={async () => await updateWaitTime(waitTime)}
          onPressEnter={async () => await updateWaitTime(waitTime)}
          suffix={'s'}
        />
      );
    }
  }, [waitTime, showWaitInput, showEditIcon, token]);

  const cardTitle = useMemo(
    () => (
      <Space size={8} align="center">
        <Handler id={id} step={step} />
        <Tag
          icon={<ClockCircleOutlined />}
          style={{
            background: TagConfig.WAIT.bgColor,
            color: TagConfig.WAIT.color,
            border: `1px solid ${TagConfig.WAIT.borderColor}`,
            fontWeight: 600,
            fontSize: '12px',
            padding: '2px 8px',
            borderRadius: token.borderRadiusSM,
          }}
        >
          {TagConfig.WAIT.label}
        </Tag>
        {WAIT}
      </Space>
    ),
    [id, step, WAIT, token],
  );
  return (
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
        borderColor: showOption ? token.colorPrimaryBorder : token.colorBorder,
      }}
      onMouseEnter={() => {
        setShowOption(true);
        setShowEditIcon(true);
      }}
      onMouseLeave={() => {
        setShowOption(false);
        setShowEditIcon(false);
      }}
      extra={
        <CardExtraOption
          show={showOption}
          callback={callback}
          caseContent={caseContent}
          caseId={caseId}
        />
      }
      title={cardTitle}
    />
  );
};

export default WaitProCard;

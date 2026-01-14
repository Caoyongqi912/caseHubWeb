import { updateCaseContent } from '@/api/inter/interCase';
import Handler from '@/components/DnDDraggable/handler';
import CardExtraOption from '@/pages/Httpx/InterfaceApiCase/InterfaceApiCaseDetail/contents/CardExtraOption';
import { IInterfaceCaseContent } from '@/pages/Httpx/types';
import { EditOutlined, FieldTimeOutlined } from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import { InputNumber, Space, Tag, Typography } from 'antd';
import { FC, useEffect, useState } from 'react';

const { Text } = Typography;

interface Props {
  id: number;
  step: number;
  caseId: number;
  caseContent: IInterfaceCaseContent;
  callback?: () => void;
}

const WaitProCard: FC<Props> = (props) => {
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

  const WAIT = () => {
    if (waitTime && !showWaitInput) {
      return (
        <>
          <Text style={{ marginRight: 10 }}>
            {waitTime} <Text type={'warning'}>s</Text>
          </Text>
          {showEditIcon && (
            <EditOutlined onClick={() => setShowWaitInput(true)} />
          )}
        </>
      );
    } else {
      return (
        <InputNumber
          style={{ width: '100%' }}
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
  };
  return (
    <ProCard
      bordered
      collapsible={false}
      hoverable
      defaultCollapsed
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
      title={
        <Space>
          <Handler id={id} />

          <Tag color={'green-inverse'}>STEP_{step}</Tag>
          <Tag color={'orange-inverse'} icon={<FieldTimeOutlined />} />
          {WAIT()}
        </Space>
      }
    ></ProCard>
  );
};

export default WaitProCard;

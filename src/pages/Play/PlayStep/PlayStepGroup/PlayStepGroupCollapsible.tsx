import { copySubSteps, removeSubSteps } from '@/api/play/playCase';
import Handler from '@/components/DnDDraggable/handler';
import MyDrawer from '@/components/MyDrawer';
import { IPlayStepDetail } from '@/pages/Play/componets/uiTypes';
import PlayStepDetail from '@/pages/Play/PlayStep/PlayStepDetail';
import {
  CopyTwoTone,
  DeleteTwoTone,
  PlayCircleOutlined,
} from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import { Button, message, Space, Tag, Tooltip, Typography } from 'antd';
import { FC, useState } from 'react';

const { Text } = Typography;

interface ISelfProps {
  id: number;
  groupId: number;
  currentProjectId?: number;
  stepInfo: IPlayStepDetail;
  callback: () => void;
  step: number;
}

const PlayStepGroupCollapsible: FC<ISelfProps> = (props) => {
  const { step, callback, id, groupId, currentProjectId, stepInfo } = props;
  const [openStepDetailDrawer, setOpenStepDetailDrawer] = useState(false);
  const [showOption, setShowOption] = useState(false);

  const selfCallBack = () => {
    setOpenStepDetailDrawer(false);
    callback();
  };

  const copyUIStep = async () => {
    copySubSteps({
      step_id: stepInfo.id,
      group_id: groupId,
    }).then(async ({ code }) => {
      if (code === 0) {
        selfCallBack();
      }
    });
  };
  const removeUIStep = async () => {
    const { code, msg } = await removeSubSteps({
      step_id: stepInfo.id,
      group_id: groupId,
    });
    if (code === 0) {
      message.success(msg);
      selfCallBack();
    }
  };

  const ContentExtra = (
    <>
      <Space>
        <Space hidden={!showOption}>
          <Tooltip title="复制步骤">
            <Button
              type={'primary'}
              icon={<CopyTwoTone onClick={copyUIStep} />}
            >
              复制
            </Button>
          </Tooltip>
          <Tooltip title="非公共步骤彻底删除">
            <Button
              color={'danger'}
              icon={<DeleteTwoTone onClick={removeUIStep} />}
            >
              删除
            </Button>
          </Tooltip>
        </Space>
      </Space>
    </>
  );
  return (
    <>
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
        collapsibleIconRender={() => {
          return null;
        }}
        extra={ContentExtra}
        onClick={(event) => {
          event.stopPropagation();
          setOpenStepDetailDrawer(true);
        }}
        title={
          <Space>
            <Handler id={id} step={step} />
            <Tag color={'gold-inverse'} icon={<PlayCircleOutlined />} />
            {stepInfo.is_common ? (
              <Tag color={'#059669'}>共</Tag>
            ) : (
              <Tag color={'#DC2626'}>私</Tag>
            )}
            <Text strong>{stepInfo.name}</Text>

            {stepInfo.description && (
              <Text type={'secondary'}>{stepInfo.description}</Text>
            )}
          </Space>
        }
      />
      <MyDrawer
        name={'Step Detail'}
        width={'auto'}
        open={openStepDetailDrawer}
        setOpen={setOpenStepDetailDrawer}
      >
        {groupId && (
          <PlayStepDetail callback={callback} step_detail={stepInfo} />
        )}
      </MyDrawer>
    </>
  );
};

export default PlayStepGroupCollapsible;

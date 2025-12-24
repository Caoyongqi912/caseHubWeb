import { copySubSteps, removeSubSteps } from '@/api/play/playCase';
import MyDrawer from '@/components/MyDrawer';
import StepFunc from '@/pages/Play/componets/StepFunc';
import { IUICaseSteps } from '@/pages/Play/componets/uiTypes';
import PlayStepInfo from '@/pages/Play/PlayStep/PlayStepInfo';
import { useModel } from '@@/exports';
import {
  ApiFilled,
  ConsoleSqlOutlined,
  CopyFilled,
  DeleteOutlined,
  EditOutlined,
  QuestionOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import {
  Button,
  message,
  Popconfirm,
  Space,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import { FC, useEffect, useState } from 'react';

const { Text } = Typography;

interface ISelfProps {
  groupId: number;
  currentProjectId?: number;
  subStepInfo?: IUICaseSteps;
  callBackFunc: () => void;
  step: number;
}

const PlayStepGroupCollapsible: FC<ISelfProps> = (props) => {
  const { step, callBackFunc, groupId, currentProjectId, subStepInfo } = props;
  const [openStepDetailDrawer, setOpenStepDetailDrawer] = useState(false);
  const [showOption, setShowOption] = useState(false);
  const { initialState } = useModel('@@initialState');

  useEffect(() => {
    console.log(!initialState?.currentUser?.isAdmin);
    console.log(initialState?.currentUser?.id !== subStepInfo?.creator);
  }, []);
  const copyUIStep = async () => {
    copySubSteps({ stepId: subStepInfo?.id! }).then(async ({ code }) => {
      if (code === 0) {
        callBackFunc();
      }
    });
  };
  const removeUIStep = async () => {
    const { code, msg } = await removeSubSteps({
      stepId: subStepInfo?.id!,
    });
    if (code === 0) {
      message.success(msg);
      callBackFunc();
    }
  };

  const ExtraArea = (
    <Space>
      <>
        {subStepInfo?.condition && (
          <Tag color={'green'} icon={<QuestionOutlined />}>
            IF
          </Tag>
        )}
        {subStepInfo?.interface_id && (
          <Tag color={'green'}>
            <Space>
              <ApiFilled />
              {subStepInfo.interface_a_or_b === 1 ? '前' : '后'}
            </Space>
          </Tag>
        )}
        {subStepInfo?.db_id && (
          <Tag color={'green'}>
            <Space>
              <ConsoleSqlOutlined />
              {subStepInfo.db_a_or_b === 1 ? '前' : '后'}
            </Space>
          </Tag>
        )}
      </>

      {showOption && (
        <>
          <Tooltip title={'复制步骤到底步、如果是公共复制、将复制成私有'}>
            <Button
              icon={<CopyFilled />}
              color={'primary'}
              variant="filled"
              hidden={subStepInfo?.is_group}
              onClick={copyUIStep}
            >
              复制
            </Button>
          </Tooltip>
          <Button
            icon={<EditOutlined />}
            color={'primary'}
            variant="filled"
            hidden={subStepInfo?.is_group}
            onClick={() => {
              setOpenStepDetailDrawer(true);
            }}
          >
            详情
          </Button>
          <Popconfirm
            title={'确认删除？'}
            description={'非公共步骤会彻底删除'}
            okText={'确认'}
            cancelText={'点错了'}
            onConfirm={removeUIStep}
          >
            <Button
              icon={<DeleteOutlined />}
              color={'danger'}
              variant={'filled'}
              style={{ marginRight: 10 }}
            >
              移除
            </Button>
          </Popconfirm>
        </>
      )}
    </Space>
  );
  return (
    <>
      <ProCard
        bordered
        defaultCollapsed
        extra={ExtraArea}
        onMouseEnter={() => {
          setShowOption(true);
        }}
        onMouseLeave={() => {
          setShowOption(false);
        }}
        collapsibleIconRender={() => (
          <Space>
            <UnorderedListOutlined
              style={{ color: '#c3cad4', marginLeft: 20 }}
            />
            <Tag color={'green-inverse'}>STEP_{step}</Tag>
          </Space>
        )}
        hoverable
        collapsible={true}
        ghost={true}
        style={{ borderRadius: '5px', marginTop: 10 }}
        subTitle={
          <Space>
            <Text type={'secondary'}>{subStepInfo?.description}</Text>
          </Space>
        }
        title={
          <>
            <Tag color={'#108ee9'} style={{ marginLeft: 4 }}>
              {subStepInfo?.name}
            </Tag>
          </>
        }
      >
        {' '}
        <StepFunc
          currentProjectId={currentProjectId!}
          subStepInfo={subStepInfo!}
          callback={callBackFunc}
        />
      </ProCard>
      <MyDrawer
        name={'Step Detail'}
        width={'auto'}
        open={openStepDetailDrawer}
        setOpen={setOpenStepDetailDrawer}
      >
        {groupId && (
          <PlayStepInfo
            readonly={false}
            is_common_step={false}
            stepInfo={subStepInfo}
            callback={() => {
              setOpenStepDetailDrawer(false);
              callBackFunc();
            }}
            play_group_id={groupId}
          />
        )}
      </MyDrawer>
    </>
  );
};

export default PlayStepGroupCollapsible;

import { copyCaseStep, removePlayStep } from '@/api/play/playCase';
import MyDrawer from '@/components/MyDrawer';
import StepFunc from '@/pages/Play/componets/StepFunc';
import { IUICaseSteps } from '@/pages/Play/componets/uiTypes';
import PlayStepDetail from '@/pages/Play/PlayStep/PlayStepDetail';
import PlayGroupStepsTable from '@/pages/Play/PlayStep/PlayStepGroup/PlayGroupStepsTable';
import {
  ApiFilled,
  ConsoleSqlOutlined,
  CopyFilled,
  DeleteOutlined,
  EditOutlined,
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
import { FC, useState } from 'react';

const { Text } = Typography;

interface ISelfProps {
  caseId: string;
  currentProjectId?: string;
  uiStepInfo?: IUICaseSteps;
  collapsible?: boolean;
  callBackFunc: () => void;
  envs?: any[];
  step: number;
}

const Index: FC<ISelfProps> = (props) => {
  const { caseId, uiStepInfo, callBackFunc, currentProjectId, envs, step } =
    props;
  const [openStepDetailDrawer, setOpenStepDetailDrawer] = useState(false);
  const [showOption, setShowOption] = useState(false);

  const copyUIStep = async () => {
    copyCaseStep({
      caseId: parseInt(caseId),
      stepId: uiStepInfo?.id!,
    }).then(async ({ code }) => {
      if (code === 0) {
        callBackFunc();
      }
    });
  };
  const removeUIStep = async () => {
    const { code, msg } = await removePlayStep({
      caseId: parseInt(caseId),
      stepId: uiStepInfo?.id!,
    });
    if (code === 0) {
      message.success(msg);
      callBackFunc();
    }
  };

  const ExtraArea = (
    <>
      {showOption && (
        <>
          <Space>
            {uiStepInfo?.condition ? <Tag color={'green'}>IF</Tag> : null}
            {uiStepInfo?.interface_id ? (
              <Tag color={'green'}>
                <Space>
                  <ApiFilled />
                  {uiStepInfo.interface_a_or_b === 1 ? '前' : '后'}
                </Space>
              </Tag>
            ) : null}
            {uiStepInfo?.db_id ? (
              <Tag color={'green'}>
                <Space>
                  <ConsoleSqlOutlined />
                  {uiStepInfo.db_a_or_b === 1 ? '前' : '后'}
                </Space>
              </Tag>
            ) : null}

            <Tooltip title={'复制步骤到底步、如果是公共复制、将复制成私有'}>
              <Button
                color={'primary'}
                variant="filled"
                disabled={uiStepInfo?.is_group}
                onClick={copyUIStep}
              >
                <CopyFilled />
                COPY
              </Button>
            </Tooltip>

            <Button
              icon={<EditOutlined />}
              color={'primary'}
              variant="filled"
              disabled={uiStepInfo?.is_group}
              onClick={() => {
                setOpenStepDetailDrawer(true);
              }}
            >
              DETAIL
            </Button>
            <Popconfirm
              title={'确认删除？'}
              description={'非公共步骤会彻底删除'}
              okText={'确认'}
              cancelText={'点错了'}
              onConfirm={removeUIStep}
            >
              <Button
                color={'danger'}
                variant={'filled'}
                style={{ marginRight: 10 }}
              >
                <DeleteOutlined />
                DEL
              </Button>
            </Popconfirm>
          </Space>
        </>
      )}
    </>
  );

  return (
    <>
      <ProCard
        bordered
        collapsible
        hoverable
        defaultCollapsed
        onMouseEnter={() => {
          setShowOption(true);
        }}
        onMouseLeave={() => {
          setShowOption(false);
        }}
        collapsibleIconRender={() => {
          return (
            <Space>
              <UnorderedListOutlined
                style={{ color: '#c3cad4', marginRight: 20 }}
              />
              <Tag color={'green-inverse'}>STEP_{step}</Tag>
              {uiStepInfo?.is_group ? (
                <Tag color={'blue-inverse'}>组</Tag>
              ) : (
                <>
                  {uiStepInfo?.is_common_step ? (
                    <Tag color={'yellow-inverse'}>公</Tag>
                  ) : (
                    <Tag color={'blue-inverse'}>私</Tag>
                  )}
                </>
              )}

              <Text strong>{uiStepInfo?.name}</Text>
              <Text type={'secondary'}>{uiStepInfo?.description}</Text>
            </Space>
          );
        }}
        extra={ExtraArea}
      >
        <ProCard headerBordered>
          {uiStepInfo?.is_group ? (
            <PlayGroupStepsTable
              groupName={uiStepInfo.name!}
              groupId={uiStepInfo.id!}
            />
          ) : (
            <StepFunc
              currentProjectId={currentProjectId!}
              subStepInfo={uiStepInfo!}
              envs={envs}
              callback={callBackFunc}
            />
          )}
        </ProCard>
      </ProCard>
      <MyDrawer
        name={'Step Detail'}
        width={'auto'}
        open={openStepDetailDrawer}
        setOpen={setOpenStepDetailDrawer}
      >
        <PlayStepDetail
          caseId={parseInt(caseId)}
          stepInfo={uiStepInfo}
          callBack={() => {
            setOpenStepDetailDrawer(false);
            callBackFunc();
          }}
          readOnly={uiStepInfo?.is_common_step}
        />
      </MyDrawer>
    </>
  );
};
export default Index;

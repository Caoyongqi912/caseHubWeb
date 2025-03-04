import { copyStep, removeStep } from '@/api/play/step';
import MyDrawer from '@/components/MyDrawer';
import { IUICaseSteps } from '@/pages/Play/componets/uiTypes';
import StepAPI from '@/pages/Play/PlayCase/PlayCaseDetail/CollapsibleUIStepCard/StepFunc/StepAPI';
import StepIF from '@/pages/Play/PlayCase/PlayCaseDetail/CollapsibleUIStepCard/StepFunc/StepIF';
import StepSQL from '@/pages/Play/PlayCase/PlayCaseDetail/CollapsibleUIStepCard/StepFunc/StepSQL';
import PlayStepDetail from '@/pages/Play/PlayCase/PlayStepDetail';
import {
  ApiFilled,
  ApiOutlined,
  ConsoleSqlOutlined,
  CopyFilled,
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  QuestionOutlined,
  RightOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import { Button, message, Popconfirm, Space, Tabs, Tag } from 'antd';
import { FC, useState } from 'react';

interface ISelfProps {
  caseId: string;
  currentProjectId?: number;
  uiStepInfo?: IUICaseSteps;
  collapsible?: boolean;
  callBackFunc: () => void;
}

const Index: FC<ISelfProps> = ({
  caseId,
  uiStepInfo,
  callBackFunc,
  collapsible,
  currentProjectId,
}) => {
  const [openStepDrawer, setOpenStepDrawer] = useState(false);
  const copyUIStep = async () => {
    const { code } = await copyStep({
      caseId: caseId,
      stepId: uiStepInfo?.id!,
    });
    if (code === 0) {
      callBackFunc();
    }
  };
  const removeUIStep = async () => {
    const { code, msg } = await removeStep({
      caseId: caseId,
      stepId: uiStepInfo?.id!,
    });
    if (code === 0) {
      message.success(msg);
      callBackFunc();
    }
  };
  const CardExtra = (
    <>
      <Space>
        {uiStepInfo?.has_api ? (
          <Tag color={'green'}>
            <ApiFilled />
          </Tag>
        ) : null}
        {uiStepInfo?.has_condition ? <Tag color={'green'}>IF</Tag> : null}
        {uiStepInfo?.has_sql ? (
          <Tag color={'green'}>
            <ConsoleSqlOutlined />
          </Tag>
        ) : null}
        {uiStepInfo?.is_common_step ? (
          <Tag color={'green-inverse'}>公</Tag>
        ) : (
          <Tag color={'blue-inverse'}>私</Tag>
        )}
        <Button color={'primary'} variant="filled" onClick={copyUIStep}>
          <CopyFilled />
          COPY
        </Button>
        <Button
          icon={<EditOutlined />}
          color={'primary'}
          variant="filled"
          onClick={() => {
            setOpenStepDrawer(true);
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
          <Button color={'primary'} variant={'filled'}>
            <DeleteOutlined />
            DEL
          </Button>
        </Popconfirm>
      </Space>
    </>
  );

  return (
    <>
      <MyDrawer
        name={'Add Step'}
        width={'auto'}
        open={openStepDrawer}
        setOpen={setOpenStepDrawer}
      >
        <PlayStepDetail
          stepId={uiStepInfo?.id!}
          func={() => {
            setOpenStepDrawer(false);
            callBackFunc();
          }}
        />
      </MyDrawer>
      <ProCard
        extra={CardExtra}
        collapsibleIconRender={({ collapsed }) => (
          <>
            <UnorderedListOutlined
              style={{ color: '#c3cad4', marginLeft: 10 }}
            />{' '}
            {collapsed ? <RightOutlined /> : <DownOutlined />}
          </>
        )}
        hoverable
        collapsible={true}
        ghost={true}
        style={{ borderRadius: '5px', marginTop: 10 }}
        defaultCollapsed={collapsible}
        subTitle={<span>{uiStepInfo?.description}</span>}
        title={
          <>
            <Tag color={'#108ee9'} style={{ marginLeft: 4 }}>
              {uiStepInfo?.name}
            </Tag>
          </>
        }
      >
        <ProCard headerBordered>
          <Tabs tabPosition={'left'} size={'small'}>
            <Tabs.TabPane key={'1'} icon={<ApiOutlined />} tab={'接口请求'}>
              <StepAPI
                stepId={uiStepInfo?.id}
                currentProjectId={currentProjectId}
                callBackFunc={callBackFunc}
              />
            </Tabs.TabPane>
            <Tabs.TabPane
              key={'2'}
              icon={<ConsoleSqlOutlined />}
              tab={'执行SQL'}
            >
              <StepSQL stepId={uiStepInfo?.id} callBackFunc={callBackFunc} />
            </Tabs.TabPane>
            <Tabs.TabPane key={'3'} icon={<QuestionOutlined />} tab={'IF条件'}>
              <StepIF uiStepInfo={uiStepInfo} callBackFunc={callBackFunc} />
            </Tabs.TabPane>
          </Tabs>
        </ProCard>
      </ProCard>
    </>
  );
};
export default Index;

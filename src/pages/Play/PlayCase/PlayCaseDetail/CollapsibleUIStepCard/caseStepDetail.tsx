import MyTabs from '@/components/MyTabs';
import PlayStepAPI from '@/pages/Play/componets/StepFunc/PlayStepAPI';
import StepFuncIF from '@/pages/Play/componets/StepFunc/StepFuncIF';
import StepFuncSQL from '@/pages/Play/componets/StepFunc/StepFuncSQL';
import { IUICaseSteps } from '@/pages/Play/componets/uiTypes';
import PlayStepInfo from '@/pages/Play/PlayStep/PlayStepInfo';
import { useModel } from '@@/exports';
import {
  ApiOutlined,
  ConsoleSqlOutlined,
  PlayCircleOutlined,
  QuestionOutlined,
} from '@ant-design/icons';
import { FC } from 'react';

const CaseStepDetail: FC<{
  currentProjectId: number;
  uiStepInfo?: IUICaseSteps;
  callBackFunc: () => void;
}> = (props) => {
  const { uiStepInfo, currentProjectId, callBackFunc } = props;

  const { initialState } = useModel('@@initialState');

  const items = [
    {
      key: '0',
      label: '步骤详情',
      icon: <PlayCircleOutlined />,
      children: (
        <div>
          <PlayStepInfo
            readonly={
              !initialState?.currentUser?.isAdmin ||
              initialState.currentUser?.id !== uiStepInfo?.creator
            }
            is_common_step={uiStepInfo?.is_common_step}
            stepInfo={uiStepInfo}
            callback={() => {
              callBackFunc();
            }}
          />
        </div>
      ),
    },
    {
      key: '1',
      label: '执行API',
      icon: (
        <ApiOutlined
          style={{
            color: uiStepInfo?.interface_id ? '#ff6600' : undefined,
          }}
        />
      ),
      children: uiStepInfo && (
        <PlayStepAPI
          projectId={currentProjectId}
          callback={callBackFunc}
          playStepInfo={uiStepInfo}
        />
      ),
    },
    {
      key: '2',
      label: '执行SQL',
      icon: (
        <ConsoleSqlOutlined
          style={{ color: uiStepInfo?.db_id ? '#ff6600' : undefined }}
        />
      ),
      children: uiStepInfo && (
        <StepFuncSQL
          subStepInfo={uiStepInfo}
          callback={callBackFunc}
          currentProjectId={currentProjectId}
        />
      ),
    },
    {
      key: '3',
      label: 'IF条件',
      icon: (
        <QuestionOutlined
          style={{ color: uiStepInfo?.condition ? '#ff6600' : undefined }}
        />
      ),
      children: uiStepInfo && (
        <StepFuncIF
          subStepInfo={uiStepInfo}
          callback={callBackFunc}
          currentProjectId={currentProjectId}
        />
      ),
    },
  ];
  return (
    <>
      <MyTabs defaultActiveKey={'0'} items={items} tabPosition={'left'} />
    </>
  );
};

export default CaseStepDetail;

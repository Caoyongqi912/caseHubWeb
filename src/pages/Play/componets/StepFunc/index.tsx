import MyTabs from '@/components/MyTabs';
import PlayStepAPI from '@/pages/Play/componets/StepFunc/PlayStepAPI';
import StepFuncIF from '@/pages/Play/componets/StepFunc/StepFuncIF';
import StepFuncSQL from '@/pages/Play/componets/StepFunc/StepFuncSQL';
import { IUICaseSteps } from '@/pages/Play/componets/uiTypes';
import {
  ApiOutlined,
  ConsoleSqlOutlined,
  QuestionOutlined,
} from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import { FC } from 'react';

interface Self {
  currentProjectId: number;
  subStepInfo: IUICaseSteps;
  envs?: { label: string; value: number | null }[];
  callback: () => void;
}

/**
 *
 */
const Index: FC<Self> = (props) => {
  const items = [
    {
      key: '1',
      label: '执行API',
      icon: (
        <ApiOutlined
          style={{
            color: props.subStepInfo.interface_id ? '#ff6600' : undefined,
          }}
        />
      ),
      children: (
        <PlayStepAPI
          projectId={props.currentProjectId}
          callback={props.callback}
          playStepInfo={props.subStepInfo}
        />
      ),
    },
    {
      key: '2',
      label: '执行SQL',
      icon: (
        <ConsoleSqlOutlined
          style={{ color: props.subStepInfo.db_id ? '#ff6600' : undefined }}
        />
      ),
      children: <StepFuncSQL {...props} />,
    },
    {
      key: '3',
      label: 'IF条件',
      icon: (
        <QuestionOutlined
          style={{ color: props.subStepInfo.condition ? '#ff6600' : undefined }}
        />
      ),
      children: <StepFuncIF {...props} />,
    },
  ];
  return (
    <ProCard>
      <MyTabs
        defaultActiveKey={'1'}
        size={'large'}
        items={items}
        tabPosition={'left'}
      />
    </ProCard>
  );
};

export default Index;

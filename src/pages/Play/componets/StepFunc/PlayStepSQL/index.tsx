import { IUICaseSteps } from '@/pages/Play/componets/uiTypes';
import { ProCard } from '@ant-design/pro-components';
import { FC } from 'react';

const Index: FC<{
  projectId: number;
  callback: () => void;
  playStepInfo: IUICaseSteps;
}> = ({ projectId, callback, playStepInfo }) => {
  return (
    <>
      <ProCard></ProCard>
    </>
  );
};

export default Index;

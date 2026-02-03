import LeftComponents from '@/components/LeftComponents';
import PlayCommonStep from '@/pages/Play/PlayStep/PlayCommonStep';
import PlayStepGroupTable from '@/pages/Play/PlayStep/PlayStepGroup/PlayStepGroupTable';
import { ModuleEnum } from '@/utils/config';
import { getSplitter, setSplitter } from '@/utils/token';
import { ProCard } from '@ant-design/pro-components';
import { Splitter } from 'antd';
import { useEffect, useState } from 'react';

const Index = () => {
  const [currentModuleId, setCurrentModuleId] = useState<number>();
  const [currentProjectId, setCurrentProjectId] = useState<number>();
  const PlayStep = 'PlayStep';
  const PlayStepGroup = 'PlayStepGroup';
  const PerKeySplitter = 'PlayStep:Splitter';

  const [sizes, setSizes] = useState<(number | string)[]>(['50%', '50%']);
  useEffect(() => {
    const data = getSplitter(PerKeySplitter);
    if (data) {
      setSizes([data.left, data.right]);
    }
  }, []);
  const onProjectChange = (projectId: number | undefined) => {
    setCurrentProjectId(projectId);
  };

  const onModuleChange = (moduleId: number) => {
    setCurrentModuleId(moduleId);
  };
  const item = [
    {
      key: 'common',
      label: '步骤',
      children: (
        <PlayCommonStep
          currentModuleId={currentModuleId}
          currentProjectId={currentProjectId}
          perKey={PlayStep}
        />
      ),
    },
    {
      key: 'Group',
      label: '步骤组',
      children: (
        <PlayStepGroupTable
          currentModuleId={currentModuleId}
          currentProjectId={currentProjectId}
          perKey={PlayStepGroup}
        />
      ),
    },
  ];
  return (
    <ProCard
      style={{ height: 'auto' }}
      bodyStyle={{
        height: '100%',
        minHeight: '90vh',
        padding: 0,
        overflow: 'hidden',
      }}
    >
      <Splitter
        onResize={(sizes: number[]) => {
          setSizes(sizes);
          setSplitter(PerKeySplitter, sizes[0], sizes[1]);
        }}
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
        }}
        layout="horizontal"
      >
        <Splitter.Panel
          resizable={true}
          collapsible={true}
          style={{
            height: '100%',
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
          size={sizes[0]}
          min={0}
          max={600}
        >
          <LeftComponents
            moduleType={ModuleEnum.UI_STEP}
            currentProjectId={currentProjectId}
            onModuleChange={onModuleChange}
            onProjectChange={onProjectChange}
          />
        </Splitter.Panel>
        <Splitter.Panel
          resizable={true}
          collapsible={true}
          size={sizes[1]}
          style={{
            overflow: 'auto',
            minHeight: 0,
            display: 'flex',
          }}
        >
          <ProCard
            bodyStyle={{ padding: 0 }}
            tabs={{
              type: 'card',
              items: item,
            }}
          />
        </Splitter.Panel>
      </Splitter>
    </ProCard>
  );
};

export default Index;

import LeftComponents from '@/components/LeftComponents';
import PlayCommonStep from '@/pages/Play/PlayStep/PlayCommonStep';
import PlayStepGroupTable from '@/pages/Play/PlayStep/PlayStepGroup/PlayStepGroupTable';
import { ModuleEnum } from '@/utils/config';
import { getSplitter, setSplitter } from '@/utils/token';
import { ProCard } from '@ant-design/pro-components';
import { Splitter, theme } from 'antd';
import { useEffect, useMemo, useState } from 'react';

const Index = () => {
  const { token } = theme.useToken();
  const [currentModuleId, setCurrentModuleId] = useState<number>();
  const [currentProjectId, setCurrentProjectId] = useState<number>();
  const PlayStep = 'PlayStep';
  const PlayStepGroup = 'PlayStepGroup';
  const PerKeySplitter = 'PlayStep:Splitter';

  const [sizes, setSizes] = useState<(number | string)[]>(['20%', '80%']);

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

  const styles = useMemo(
    () => ({
      container: {
        height: 'auto',
        minHeight: '90vh',
      },
      bodyStyle: {
        height: '100%',
        minHeight: '90vh',
        padding: 0,
        overflow: 'hidden',
      },
      leftPanel: {
        height: '100%',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column' as const,
        overflow: 'hidden',
        backgroundColor: token.colorBgContainer,
        borderRadius: token.borderRadiusLG,
        margin: 8,
        boxShadow: `0 1px 2px 0 ${token.colorBgLayout}`,
      },
      rightPanel: {
        overflow: 'auto',
        minHeight: 0,
        display: 'flex',
        backgroundColor: token.colorBgContainer,
        borderRadius: token.borderRadiusLG,
        margin: '8px 8px 8px 0',
        boxShadow: `0 1px 2px 0 ${token.colorBgLayout}`,
      },
      splitter: {
        width: '100%',
        height: '100%',
        display: 'flex',
        backgroundColor: token.colorBgLayout,
      },
      tabCard: {
        padding: 0,
      },
    }),
    [token],
  );

  const item = [
    {
      key: 'common',
      label: (
        <span
          style={{
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          步骤
        </span>
      ),
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
      label: (
        <span
          style={{
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          步骤组
        </span>
      ),
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
    <ProCard style={styles.container} bodyStyle={styles.bodyStyle}>
      <Splitter
        onResize={(sizes: number[]) => {
          setSizes(sizes);
          setSplitter(PerKeySplitter, sizes[0], sizes[1]);
        }}
        style={styles.splitter}
        layout="horizontal"
      >
        <Splitter.Panel
          resizable={true}
          collapsible={true}
          style={styles.leftPanel}
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
          style={styles.rightPanel}
        >
          <ProCard
            style={{ width: '100%', height: '100%' }}
            bodyStyle={styles.tabCard}
            tabs={{
              type: 'card',
              items: item,
              tabBarStyle: {
                marginBottom: 0,
                paddingLeft: 12,
                backgroundColor: token.colorBgContainer,
                borderBottom: `1px solid ${token.colorBorderSecondary}`,
              },
            }}
          />
        </Splitter.Panel>
      </Splitter>
    </ProCard>
  );
};

export default Index;

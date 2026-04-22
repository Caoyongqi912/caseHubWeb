import { useGlassStyles } from '@/components/Glass';
import LeftComponents from '@/components/LeftComponents';
import InterfaceApiCaseTaskTable from '@/pages/Httpx/InterfaceApiCaseTask/InterfaceApiCaseTaskTable';
import { ModuleEnum } from '@/utils/config';
import { getSplitter, setSplitter } from '@/utils/token';
import { ProCard } from '@ant-design/pro-components';
import { Splitter } from 'antd';
import { useEffect, useState } from 'react';

const Index = () => {
  const styles = useGlassStyles();

  const [currentModuleId, setCurrentModuleId] = useState<number>();
  const [currentProjectId, setCurrentProjectId] = useState<number>();
  const PerKey = 'InterfaceTask';
  const PerKeySplitter = 'InterfaceTask:Splitter';
  const [sizes, setSizes] = useState<(number | string)[]>(['20%', '80%']);

  const onProjectChange = (projectId: number | undefined) => {
    setCurrentProjectId(projectId);
  };

  const onModuleChange = (moduleId: number) => {
    setCurrentModuleId(moduleId);
  };

  useEffect(() => {
    const data = getSplitter(PerKeySplitter);
    if (data) {
      setSizes([data.left, data.right]);
    }
  }, []);

  return (
    <ProCard
      style={{
        marginBottom: 24,
        borderRadius: '16px',
        background: styles.colors.glass,
        backdropFilter: 'blur(20px)',
        border: `1px solid ${styles.colors.glassBorder}`,
        boxShadow: `0 8px 32px ${styles.colors.primaryGlow}20`,
      }}
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
            moduleType={ModuleEnum.API_TASK}
            currentProjectId={currentProjectId}
            onProjectChange={onProjectChange}
            onModuleChange={onModuleChange}
          />
        </Splitter.Panel>
        <Splitter.Panel
          size={sizes[1]}
          min={'60%'}
          style={{ overflow: 'auto' }}
        >
          <InterfaceApiCaseTaskTable
            currentModuleId={currentModuleId}
            currentProjectId={currentProjectId}
            perKey={PerKey}
          />
        </Splitter.Panel>
      </Splitter>
    </ProCard>
  );
};

export default Index;

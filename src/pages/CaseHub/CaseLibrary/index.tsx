import { useGlassStyles } from '@/components/Glass';
import LeftComponents from '@/components/LeftComponents';
import { ModuleEnum } from '@/utils/config';
import { getSplitter, setSplitter } from '@/utils/token';
import { ProCard } from '@ant-design/pro-components';
import { Splitter } from 'antd';
import { useEffect, useState } from 'react';
import useCaseHubTheme from '../styles';
import CaseDataTable from './components/CaseDataTable';

const Index = () => {
  const styles = useGlassStyles();

  const { borderRadius, shadows } = useCaseHubTheme();
  const [currentModuleId, setCurrentModuleId] = useState<number | undefined>();
  const [currentProjectId, setCurrentProjectId] = useState<
    number | undefined
  >();
  const [sizes, setSizes] = useState<(number | string)[]>(['20%', '80%']);

  const PerKey = 'TEST_CASE';
  const PerKeySplitter = 'TEST_CASE:Splitter';

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
    <>
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
            borderRadius: borderRadius.xl,
            boxShadow: shadows.card,
            overflow: 'hidden',
          }}
        >
          <Splitter.Panel
            collapsible={true}
            size={sizes[0]}
            style={{ height: 'auto' }}
          >
            <LeftComponents
              moduleType={ModuleEnum.CASE}
              currentProjectId={currentProjectId}
              onModuleChange={onModuleChange}
              onProjectChange={onProjectChange}
            />
          </Splitter.Panel>

          <Splitter.Panel
            size={sizes[1]}
            min={'60%'}
            style={{ height: 'auto', overflow: 'auto' }}
          >
            <CaseDataTable
              perKey={PerKey}
              currentProjectId={currentProjectId}
              currentModuleId={currentModuleId}
            />
          </Splitter.Panel>
        </Splitter>
      </ProCard>
    </>
  );
};

export default Index;

import { addDefaultTestCase } from '@/api/case/testCase';
import CaseStatsBar from '@/pages/CaseHub/Requirement/RequirementCases/components/CaseStatsBar';
import CaseStepSearchForm from '@/pages/CaseHub/Requirement/RequirementCases/components/CaseStepSearchForm';
import ChoiceSettingArea from '@/pages/CaseHub/Requirement/RequirementCases/components/ChoiceSettingArea';
import RequirementCaseCard from '@/pages/CaseHub/Requirement/RequirementCases/components/RequirementCaseCard';
import {
  CaseSelectionProvider,
  useCaseSelection,
} from '@/pages/CaseHub/Requirement/RequirementCases/contexts';
import { CaseUpdateProvider } from '@/pages/CaseHub/Requirement/RequirementCases/contexts/CaseUpdateContext';
import {
  useCaseGrouping,
  useCaseList,
} from '@/pages/CaseHub/Requirement/RequirementCases/hooks';
import { useCaseHubTheme, useCaseInfoStyles } from '@/pages/CaseHub/styles';
import { CaseSearchForm, ITestCase } from '@/pages/CaseHub/types';
import { useParams } from '@@/exports';
import {
  AppstoreOutlined,
  DownOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import { Collapse, Empty, Spin, Typography } from 'antd';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const { Text } = Typography;

const RequirementCasesContent: React.FC = () => {
  const { reqId, projectId, moduleId } = useParams<{
    reqId: string;
    projectId: string;
    moduleId: string;
  }>();
  const topRef = useRef<HTMLDivElement>(null);
  const [searchInfo, setSearchInfo] = useState<CaseSearchForm>({});
  const [shouldScroll, setShouldScroll] = useState(false);
  const { colors, spacing } = useCaseHubTheme();
  const styles = useCaseInfoStyles();

  const { testCases, tags, setTags, loading, refresh, updateCaseData } =
    useCaseList({ reqId, searchInfo });

  const {
    groupedTestCases,
    isGrouped,
    activeGroupKeys,
    isAllExpanded,
    toggleGrouped,
    expandAll,
    collapseAll,
    setActiveGroupKeys,
    resetGrouping,
  } = useCaseGrouping({ testCases });

  const { selectedCount, selectAll, clearSelection, selectedCaseIds } =
    useCaseSelection();

  useEffect(() => {
    if (shouldScroll) {
      const timer = setTimeout(() => {
        topRef.current?.scrollIntoView({ behavior: 'smooth' });
        setShouldScroll(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [shouldScroll]);

  useEffect(() => {
    resetGrouping();
  }, [searchInfo, resetGrouping]);

  const handleAddCase = useCallback(async () => {
    if (!reqId) return;
    const { code } = await addDefaultTestCase({
      requirement_id: parseInt(reqId),
    });
    if (code === 0) {
      refresh();
      setShouldScroll(true);
    }
  }, [reqId, refresh]);

  const caseStats = useMemo(() => {
    const total = testCases.length;
    const passed = testCases.filter((tc) => tc.case_status === 1).length;
    const failed = testCases.filter((tc) => tc.case_status === 2).length;
    const unchecked = testCases.filter(
      (tc) => tc.case_status === 0 || tc.case_status === undefined,
    ).length;
    return { total, passed, failed, unchecked };
  }, [testCases]);

  const handleSelectAll = useCallback(() => {
    const allIds = testCases
      .map((tc) => tc.id)
      .filter((id): id is number => id !== undefined);
    selectAll(allIds);
  }, [testCases, selectAll]);

  const renderTestCase = useCallback(
    (item: ITestCase) => (
      <RequirementCaseCard key={item.id} testcaseData={item} />
    ),
    [],
  );

  const renderGroupedCases = useMemo(() => {
    if (groupedTestCases.length === 0) {
      return (
        <Empty
          style={{ height: '70vh' }}
          description={<Text type="secondary">暂无用例</Text>}
        />
      );
    }
    const collapseItems = groupedTestCases.map((group) => ({
      key: group.tag,
      label: (
        <div style={styles.groupedCaseLabel()}>
          <div style={styles.groupTitle()}>
            <AppstoreOutlined style={{ color: colors.primary }} />
            <span>{group.tag}</span>
          </div>
          <span style={styles.groupCount()}>{group.cases.length} 个用例</span>
        </div>
      ),
      children: (
        <div style={{ padding: `${spacing.sm}px 0` }}>
          {group.cases.map(renderTestCase)}
        </div>
      ),
    }));

    return (
      <Collapse
        activeKey={activeGroupKeys}
        onChange={(keys) => setActiveGroupKeys(keys as string[])}
        items={collapseItems}
        expandIcon={({ isActive }) => (
          <div style={styles.collapseExpandIcon(!!isActive)}>
            {isActive ? (
              <DownOutlined style={{ fontSize: 10, color: '#fff' }} />
            ) : (
              <RightOutlined style={{ fontSize: 10, color: colors.primary }} />
            )}
          </div>
        )}
        expandIconPosition="start"
        style={{ background: 'transparent', border: 'none' }}
        bordered={false}
      />
    );
  }, [
    groupedTestCases,
    activeGroupKeys,
    spacing,
    colors,
    styles,
    renderTestCase,
  ]);

  const renderUngroupedCases = useMemo(() => {
    if (testCases.length === 0) {
      return (
        <Empty
          style={{ height: '70vh' }}
          description={<Text type="secondary">暂无用例</Text>}
        />
      );
    }

    return (
      <div style={styles.ungroupedContainer()}>
        {testCases.map(renderTestCase)}
        {testCases.length > 10 && (
          <div style={styles.scrollIndicator()}>滚动查看更多</div>
        )}
      </div>
    );
  }, [testCases, styles, renderTestCase]);

  const showCheckButton = selectedCount > 0;

  return (
    <CaseUpdateProvider
      reqId={reqId}
      tags={tags}
      setTags={setTags}
      refreshCases={refresh}
      onCaseDataChange={updateCaseData}
    >
      <ProCard
        split="horizontal"
        bodyStyle={{ padding: 0 }}
        style={styles.cardStyle()}
      >
        <CaseStepSearchForm
          tags={tags}
          setSearchForm={setSearchInfo}
          isGrouped={isGrouped}
          isAllExpanded={isAllExpanded}
          selectedCount={selectedCount}
          totalCount={testCases.length}
          onSelectAll={handleSelectAll}
          onExpandAll={expandAll}
          onCollapseAll={collapseAll}
          onClearSelection={clearSelection}
          onRefresh={refresh}
          onToggleGroup={toggleGrouped}
          onAddCase={handleAddCase}
          onUploadFinish={refresh}
          uploadProps={{ reqId, moduleId, projectId }}
        />

        <div style={{ padding: `${spacing.sm}px ${spacing.lg}px` }}>
          <CaseStatsBar
            total={caseStats.total}
            passed={caseStats.passed}
            failed={caseStats.failed}
            unchecked={caseStats.unchecked}
          />
        </div>

        <ProCard
          split="horizontal"
          bodyStyle={{ padding: spacing.sm }}
          style={styles.innerCardStyle()}
        >
          {showCheckButton && (
            <ChoiceSettingArea
              requirementId={parseInt(reqId!)}
              callback={refresh}
              allTestCase={testCases}
              showCheckButton={showCheckButton}
              selectedCase={Array.from(selectedCaseIds)}
              setSelectedCase={(
                ids: number[] | ((prev: number[]) => number[]),
              ) => {
                if (typeof ids === 'function') {
                  const result = ids(Array.from(selectedCaseIds));
                  selectAll(result);
                } else {
                  selectAll(ids);
                }
              }}
            />
          )}
          <>
            {loading ? (
              <Spin size="large" />
            ) : (
              <>{isGrouped ? renderGroupedCases : renderUngroupedCases}</>
            )}
          </>
        </ProCard>
      </ProCard>
    </CaseUpdateProvider>
  );
};

const Index: React.FC = () => {
  return (
    <CaseSelectionProvider>
      <RequirementCasesContent />
    </CaseSelectionProvider>
  );
};

export default Index;

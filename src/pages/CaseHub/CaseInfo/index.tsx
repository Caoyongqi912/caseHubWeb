import {
  addDefaultTestCase,
  queryCasesByRequirement,
  queryTagsByRequirement,
} from '@/api/case/testCase';
import CaseStepSearchForm from '@/pages/CaseHub/CaseInfo/CaseStepSearchForm';
import ChoiceSettingArea from '@/pages/CaseHub/component/ChoiceSettingArea';
import { useCaseHubTheme } from '@/pages/CaseHub/styles';
import TestCase from '@/pages/CaseHub/TestCase';
import { CaseSearchForm, ITestCase } from '@/pages/CaseHub/type';
import { useParams } from '@@/exports';
import {
  AppstoreOutlined,
  DownOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import { Collapse, Empty, Typography } from 'antd';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const { Text } = Typography;

interface GroupedTestCases {
  tag: string;
  cases: ITestCase[];
}

const Index = () => {
  const { reqId, projectId, moduleId } = useParams<{
    reqId: string;
    projectId: string;
    moduleId: string;
  }>();
  const topRef = useRef<HTMLDivElement>(null);
  const [testCases, setTestCases] = useState<ITestCase[]>([]);
  const [tags, setTags] = useState<{ label: string; value: string }[]>([]);
  const [showCheckButton, setShowCheckButton] = useState(false);
  const [shouldScroll, setShouldScroll] = useState(false);
  const [reload, setReload] = useState(0);
  const [searchInfo, setSearchInfo] = useState<CaseSearchForm>({});
  const [selectedCase, setSelectedCase] = useState<number[]>([]);
  const [isGrouped, setIsGrouped] = useState(true);
  const [activeGroupKeys, setActiveGroupKeys] = useState<string[]>([]);
  const { colors, spacing, borderRadius } = useCaseHubTheme();

  useEffect(() => {
    setShowCheckButton(selectedCase.length > 0);
  }, [selectedCase.length]);

  useEffect(() => {
    if (!reqId) return;

    const fetchCases = async () => {
      try {
        const searchValues = {
          requirement_id: reqId,
          ...searchInfo,
        };
        const { code, data } = await queryCasesByRequirement(searchValues);
        if (code === 0) {
          setTestCases(data);
        }
      } catch (error) {
        console.error('Failed to fetch cases:', error);
      }
    };

    fetchCases();
  }, [reqId, reload, searchInfo]);

  useEffect(() => {
    if (!reqId) return;
    queryTagsByRequirement({ requirement_id: parseInt(reqId) }).then(
      ({ code, data }) => {
        if (code === 0 && data.length > 0) {
          setTags(data.map((tag) => ({ label: tag, value: tag })));
        }
      },
    );
  }, [reqId]);

  useEffect(() => {
    if (shouldScroll) {
      const timer = setTimeout(() => {
        topRef.current?.scrollIntoView({ behavior: 'smooth' });
        setShouldScroll(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [shouldScroll]);

  const groupedTestCases = useMemo((): GroupedTestCases[] => {
    if (testCases.length === 0) return [];

    const groups: Record<string, ITestCase[]> = {};
    const untaggedCases: ITestCase[] = [];

    testCases.forEach((tc) => {
      const tag = tc.case_tag || '';
      if (tag) {
        if (!groups[tag]) {
          groups[tag] = [];
        }
        groups[tag].push(tc);
      } else {
        untaggedCases.push(tc);
      }
    });

    const result: GroupedTestCases[] = Object.entries(groups).map(
      ([tag, cases]) => ({
        tag,
        cases,
      }),
    );

    if (untaggedCases.length > 0) {
      result.push({ tag: '未分组', cases: untaggedCases });
    }

    return result;
  }, [testCases]);

  useEffect(() => {
    if (isGrouped && groupedTestCases.length > 0) {
      setActiveGroupKeys(groupedTestCases.map((g) => g.tag));
    }
  }, [isGrouped, groupedTestCases]);

  const handleReload = useCallback(() => {
    setReload((prev) => prev + 1);
  }, []);

  const isAllExpanded = useMemo(
    () =>
      activeGroupKeys.length === groupedTestCases.length &&
      groupedTestCases.length > 0,
    [activeGroupKeys.length, groupedTestCases.length],
  );

  const handleSelectAll = useCallback(() => {
    const allIds = testCases
      .map((tc) => tc.id)
      .filter((id): id is number => id !== undefined);
    setSelectedCase(allIds);
  }, [testCases]);

  const handleClearSelection = useCallback(() => {
    setSelectedCase([]);
  }, []);

  const handleExpandAll = useCallback(() => {
    setActiveGroupKeys(groupedTestCases.map((g) => g.tag));
  }, [groupedTestCases]);

  const handleCollapseAll = useCallback(() => {
    setActiveGroupKeys([]);
  }, []);

  const handleRefresh = useCallback(() => {
    handleReload();
  }, [handleReload]);

  const handleToggleGroup = useCallback(() => {
    setIsGrouped((prev) => !prev);
  }, []);

  const handleAddCase = useCallback(async () => {
    if (!reqId) return;
    const { code } = await addDefaultTestCase({
      requirement_id: parseInt(reqId),
    });
    if (code === 0) {
      handleReload();
      setShouldScroll(true);
    }
  }, [reqId, handleReload]);

  const cardStyle = useMemo(
    () => ({
      borderRadius: borderRadius.xl,
      border: `1px solid ${colors.border}`,
      boxShadow: `0 2px 8px ${colors.bgContainer}20`,
      overflow: 'hidden' as const,
    }),
    [borderRadius, colors],
  );

  const collapseExpandIcon = useCallback(
    (isActive: boolean) => (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 20,
          height: 20,
          borderRadius: borderRadius.sm,
          background: isActive ? colors.primary : colors.primaryBg,
          transition: 'all 200ms ease',
        }}
      >
        {isActive ? (
          <DownOutlined style={{ fontSize: 10, color: '#fff' }} />
        ) : (
          <RightOutlined style={{ fontSize: 10, color: colors.primary }} />
        )}
      </div>
    ),
    [borderRadius, colors],
  );

  const renderTestCase = useCallback(
    (item: ITestCase) => (
      <TestCase
        key={item.id}
        selectedCase={selectedCase}
        reqId={reqId}
        tags={tags}
        setTags={setTags}
        callback={handleReload}
        testcaseData={item}
        setSelectedCase={setSelectedCase}
      />
    ),
    [selectedCase, reqId, tags, handleReload],
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
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing.sm,
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          <AppstoreOutlined style={{ color: colors.primary }} />
          <span style={{ color: colors.text }}>{group.tag}</span>
          <span
            style={{
              color: colors.textSecondary,
              fontWeight: 400,
              fontSize: 12,
              background: colors.primaryBg,
              padding: '2px 8px',
              borderRadius: borderRadius.sm,
            }}
          >
            {group.cases.length} 个用例
          </span>
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
        expandIcon={({ isActive }) => collapseExpandIcon(!!isActive)}
        expandIconPosition="start"
        style={{
          background: 'transparent',
          border: 'none',
        }}
        bordered={false}
      />
    );
  }, [
    groupedTestCases,
    activeGroupKeys,
    spacing,
    colors,
    borderRadius,
    renderTestCase,
    collapseExpandIcon,
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
      <div
        style={{
          maxHeight: '70vh',
          overflowY: 'auto',
          padding: spacing.md,
          borderRadius: borderRadius.lg,
          background: colors.bgContainer,
        }}
      >
        {testCases.map(renderTestCase)}
        {testCases.length > 10 && (
          <div
            style={{
              position: 'sticky',
              bottom: 0,
              background: `linear-gradient(transparent, ${colors.bgLayout})`,
              height: spacing.xxxl,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: colors.textSecondary,
              fontSize: 12,
              borderTop: `1px solid ${colors.borderSecondary}`,
              marginTop: spacing.md,
            }}
          >
            滚动查看更多
          </div>
        )}
      </div>
    );
  }, [testCases, spacing, colors, borderRadius, renderTestCase]);

  return (
    <ProCard split="horizontal" bodyStyle={{ padding: 0 }} style={cardStyle}>
      <CaseStepSearchForm
        tags={tags}
        setSearchForm={setSearchInfo}
        isGrouped={isGrouped}
        isAllExpanded={isAllExpanded}
        selectedCount={selectedCase.length}
        totalCount={testCases.length}
        onSelectAll={handleSelectAll}
        onExpandAll={handleExpandAll}
        onCollapseAll={handleCollapseAll}
        onClearSelection={handleClearSelection}
        onRefresh={handleRefresh}
        onToggleGroup={handleToggleGroup}
        onAddCase={handleAddCase}
        onUploadFinish={handleReload}
        uploadProps={{
          reqId,
          moduleId,
          projectId,
        }}
      />

      <ProCard
        split="horizontal"
        bodyStyle={{ padding: spacing.sm }}
        style={{
          borderRadius: borderRadius.xl,
          margin: spacing.sm,
        }}
      >
        <ChoiceSettingArea
          callback={handleReload}
          allTestCase={testCases}
          showCheckButton={showCheckButton}
          selectedCase={selectedCase}
          setSelectedCase={setSelectedCase}
        />

        {isGrouped ? renderGroupedCases : renderUngroupedCases}
      </ProCard>
    </ProCard>
  );
};

export default Index;

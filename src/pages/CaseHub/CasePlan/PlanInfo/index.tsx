import { PageContainer } from '@ant-design/pro-components';
import { useParams } from '@umijs/max';
import { Tabs } from 'antd';
import { useCallback, useMemo } from 'react';
import { history, useSearchParams } from 'umi';
import PlanCases from './PlanCases';
import PlanMindMap from './PlanMindMap';
import PlanOverview from './PlanOverview';
import PlanReuirements from './PlanReuirements';

/** Tab 键名常量,集中维护便于 URL 同步校验 */
const TAB_KEYS = {
  CASES: 'cases',
  MIND: 'mind',
  REQUIREMENT: 'requirement',
  OVERVIEW: 'overview',
} as const;

type TabKey = (typeof TAB_KEYS)[keyof typeof TAB_KEYS];

const DEFAULT_TAB: TabKey = TAB_KEYS.CASES;

const isValidTab = (key: string | null): key is TabKey =>
  !!key && (Object.values(TAB_KEYS) as string[]).includes(key);

const Index = () => {
  const { planId } = useParams<{ planId: string }>();
  const [searchParams] = useSearchParams();

  /**
   * 当前 Tab 键
   * 优先从 URL ?tab= 读取,验证通过后使用;否则回退到默认 Tab
   * 解决:之前用 defaultActiveKey 强制 'cases',用户切到脑图后刷新页面又回到用例
   */
  const activeTab = useMemo<TabKey>(() => {
    const tabFromUrl = searchParams.get('tab');
    return isValidTab(tabFromUrl) ? tabFromUrl : DEFAULT_TAB;
  }, [searchParams]);

  /**
   * Tab 切换处理:用 history.replace 写回 URL,触发 React 重渲染读取新 activeTab
   * 选用 replace 而非 push,避免在浏览器历史栈里堆积大量 Tab 切换记录
   */
  const handleTabChange = useCallback((nextKey: string) => {
    if (!isValidTab(nextKey) || nextKey === DEFAULT_TAB) {
      // 默认 Tab 不写入 URL,保持 URL 干净
      history.replace({
        search: '',
      });
      return;
    }
    const next = new URLSearchParams(window.location.search);
    next.set('tab', nextKey);
    history.replace({
      search: `?${next.toString()}`,
    });
  }, []);

  const PlanItems = [
    {
      key: TAB_KEYS.CASES,
      label: '用例',
      // PlanCases 自管理 planInfo（通过 props 接收可选值），此处不强制要求 planInfo 已加载
      children: <PlanCases planId={planId} />,
    },
    {
      key: TAB_KEYS.MIND,
      label: '脑图',
      // PlanMindMap 自管理 planInfo / planModules 加载，脑图节点变更后会回调刷新模块树
      children: <PlanMindMap planId={planId} />,
    },
    {
      key: TAB_KEYS.REQUIREMENT,
      label: '需求',
      children: <PlanReuirements planId={planId} />,
    },
    {
      key: TAB_KEYS.OVERVIEW,
      label: '概览',
      // PlanOverview 内部自管理 getPlanInfo loading，切换到此 Tab 时再加载
      children: <PlanOverview planId={planId} />,
    },
  ];

  return (
    <PageContainer
      title={false}
      header={{
        breadcrumb: {
          items: [],
        },
      }}
      style={{
        height: '100vh',
        minHeight: '100vh',
        overflow: 'hidden',
      }}
    >
      <Tabs
        type="card"
        size="small"
        items={PlanItems}
        activeKey={activeTab}
        onChange={handleTabChange}
        style={{ height: '100%' }}
      />
    </PageContainer>
  );
};

export default Index;

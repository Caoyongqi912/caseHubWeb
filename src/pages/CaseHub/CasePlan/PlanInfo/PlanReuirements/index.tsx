/**
 * PlanReuirements — 测试计划「需求」Tab 容器
 */
import {
  getPlanInfo,
  linkPlanRequirements,
  pagePlanRequirements,
  unlinkPlanRequirements,
} from '@/api/case/caseplan';
import MyDrawer from '@/components/MyDrawer';
import RequirementDetail from '@/pages/CaseHub/Requirement/components/RequirementDetail';
import { useCaseHubTheme } from '@/pages/CaseHub/styles';
import { ICasePlan, IRequirement } from '@/pages/CaseHub/types';
import {
  AppstoreOutlined,
  LinkOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { Input, message, Popconfirm } from 'antd';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import ChoiceRequirementTable from './ChoiceRequirementTable';
import PlanRequirementList from './PlanRequirementList';
import { usePlanRequirementStyles } from './styles';

interface Props {
  /** 当前计划 ID（来自 URL 路由参数） */
  planId?: string;
}

const PlanReuirements: FC<Props> = ({ planId }) => {
  const { token, colors, borderRadius } = useCaseHubTheme();
  const styles = usePlanRequirementStyles();

  // 数据态
  const [requirements, setRequirements] = useState<IRequirement[]>([]);
  const [loading, setLoading] = useState(false);
  const [linkLoading, setLinkLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');

  // 计划信息（用于拿到 project_id，给选需求弹窗过滤）
  const [planInfo, setPlanInfo] = useState<ICasePlan>();

  // UI 态
  const [choiceOpen, setChoiceOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [activeReqId, setActiveReqId] = useState<number>();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  /** 加载计划信息（仅一次，用于 project_id） */
  const loadPlanInfo = useCallback(async () => {
    if (!planId) return;
    const { code, data } = await getPlanInfo(Number(planId));
    if (code === 0 && data) setPlanInfo(data);
  }, [planId]);

  /** 拉取已关联需求列表 */
  const fetchRequirements = useCallback(async () => {
    if (!planId) return;
    setLoading(true);
    try {
      const { code, data } = await pagePlanRequirements({
        plan_id: Number(planId),
        current: 1,
        pageSize: 200,
      });
      if (code === 0) {
        setRequirements(data?.items || []);
      }
    } finally {
      setLoading(false);
    }
  }, [planId]);

  useEffect(() => {
    loadPlanInfo();
    fetchRequirements();
  }, [loadPlanInfo, fetchRequirements]);

  /** 客户端关键词过滤（接口已支持 server 过滤时再切回） */
  const filtered = useMemo(() => {
    if (!searchKeyword.trim()) return requirements;
    const kw = searchKeyword.trim().toLowerCase();
    return requirements.filter(
      (r) =>
        r.requirement_name?.toLowerCase().includes(kw) ||
        r.uid?.toLowerCase().includes(kw),
    );
  }, [requirements, searchKeyword]);

  /** 解除关联 */
  const handleUnlink = useCallback(
    async (record: IRequirement) => {
      if (!planId) return;
      const hide = message.loading('正在解除关联…', 0);
      try {
        const { code, msg } = await unlinkPlanRequirements({
          plan_id: Number(planId),
          requirement_ids: [record.id],
        });
        if (code === 0) {
          message.success('已解除关联');
          fetchRequirements();
        } else {
          message.error(msg || '解除失败');
        }
      } finally {
        hide();
      }
    },
    [planId, fetchRequirements],
  );

  /** 批量关联 */
  const handleBatchLink = useCallback(async () => {
    if (!planId || selectedRowKeys.length === 0) return;
    setLinkLoading(true);
    const hide = message.loading('正在关联需求…', 0);
    try {
      const { code, msg } = await linkPlanRequirements({
        plan_id: Number(planId),
        requirement_ids: selectedRowKeys as number[],
      });
      if (code === 0) {
        message.success(`已关联 ${selectedRowKeys.length} 个需求`);
        setChoiceOpen(false);
        setSelectedRowKeys([]);
        fetchRequirements();
      } else {
        message.error(msg || '关联失败');
      }
    } finally {
      hide();
      setLinkLoading(false);
    }
  }, [planId, selectedRowKeys, fetchRequirements]);

  /** 打开详情 */
  const handleView = useCallback((record: IRequirement) => {
    setActiveReqId(record.id);
    setDetailOpen(true);
  }, []);

  /**
   * 关联按钮渐变：纯黑 / 纯白 二值对比
   * - 亮色：纯黑 #0a0a0a -> 深灰 #1f1f1f
   * - 暗色：纯白 #ffffff -> 浅灰 #e8e8e8
   */
  const linkButtonGradient = useMemo(() => {
    const { accent } = styles.palette;
    return `linear-gradient(135deg, ${accent.primary} 0%, ${accent.primaryHover} 100%)`;
  }, [styles.palette]);
  /** 关联按钮文字色：亮色用米白，暗色用深棕以保证对比 */
  const linkButtonTextColor = styles.isDark ? '#0a0a0a' : '#ffffff';

  // 标题区「编辑感」样式
  const headerStyle = useMemo(
    () => ({
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: styles.spacing.lg,
      padding: `${styles.spacing.xl}px ${styles.spacing.xxl}px`,
      borderBottom: `1px solid ${styles.palette.ink[200]}`,
      position: 'relative' as const,
    }),
    [styles],
  );

  const titleGroupStyle = useMemo(
    () => ({
      display: 'flex',
      flexDirection: 'column' as const,
      gap: styles.spacing.xs,
    }),
    [styles],
  );

  // 抽屉 header 的渐变，与模块设计语言保持一致
  const choiceDrawerStyles = useMemo(
    () => ({
      header: {
        background: `linear-gradient(135deg, ${styles.palette.accent.primarySoft} 0%, ${token.colorBgContainer} 100%)`,
        borderBottom: `1px solid ${styles.palette.ink[200]}`,
        padding: `${token.paddingLG}px ${token.paddingXL}px`,
        fontWeight: 600,
        fontFamily: styles.fonts.display,
        fontSize: 18,
        color: styles.palette.ink[900],
      },
      body: {
        padding: styles.spacing.lg,
        background: token.colorBgContainer,
      },
    }),
    [styles, token],
  );

  const detailDrawerStyles = useMemo(
    () => ({
      header: {
        background: `linear-gradient(135deg, ${colors.primaryBg} 0%, ${token.colorBgContainer} 100%)`,
        borderBottom: `1px solid ${colors.border}`,
        padding: `${token.paddingLG}px ${token.paddingXL}px`,
        fontWeight: 600,
      },
      body: {
        padding: styles.spacing.lg,
        background: token.colorBgContainer,
      },
    }),
    [colors, token, styles],
  );

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: styles.surfaces.canvas,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* 顶部纸张感 header */}
      <header style={headerStyle}>
        <div style={titleGroupStyle}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: styles.spacing.sm,
              fontFamily: styles.fonts.body,
              fontSize: 11,
              letterSpacing: '0.18em',
              color: styles.palette.ink[600],
              textTransform: 'uppercase' as const,
            }}
          >
            <AppstoreOutlined />
            <span>Plan · Requirements</span>
          </div>
          <h2
            style={{
              fontFamily: styles.fonts.display,
              fontSize: 28,
              fontWeight: 500,
              color: styles.palette.ink[900],
              margin: 0,
              letterSpacing: '-0.015em',
              fontStyle: 'italic',
            }}
          >
            关联需求
          </h2>
          <div
            style={{
              fontFamily: styles.fonts.body,
              fontSize: 13,
              color: styles.palette.ink[600],
              marginTop: 2,
            }}
          >
            已为该计划整理{' '}
            <span
              style={{
                color: styles.palette.accent.primary,
                fontWeight: 600,
                fontFamily: styles.fonts.mono,
              }}
            >
              {requirements.length}
            </span>{' '}
            个需求 ·{' '}
            {loading ? '正在加载…' : '按需点击「关联需求」或悬停卡片查看操作'}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: styles.spacing.md,
            flexShrink: 0,
          }}
        >
          <Input
            allowClear
            prefix={
              <SearchOutlined style={{ color: styles.palette.ink[500] }} />
            }
            placeholder="搜索需求名 / UID"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            style={{
              width: 240,
              borderRadius: borderRadius.md,
              fontFamily: styles.fonts.body,
            }}
          />
          <Popconfirm
            title={
              <span style={{ fontFamily: styles.fonts.display, fontSize: 15 }}>
                关联已有需求？
              </span>
            }
            description={
              <span style={{ fontFamily: styles.fonts.body, fontSize: 13 }}>
                从当前项目下未关联到此计划的需求中选取。
              </span>
            }
            okText="打开选择器"
            cancelText="取消"
            onConfirm={() => {
              setSelectedRowKeys([]);
              setChoiceOpen(true);
            }}
            icon={
              <LinkOutlined style={{ color: styles.palette.accent.primary }} />
            }
          >
            <button
              type="button"
              style={{
                background: linkButtonGradient,
                color: linkButtonTextColor,
                border: 'none',
                padding: '8px 18px',
                borderRadius: borderRadius.md,
                fontFamily: styles.fonts.body,
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: styles.shadows.card,
                transition: `transform ${styles.motion.base}, box-shadow ${styles.motion.base}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = styles.shadows.cardHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = styles.shadows.card;
              }}
            >
              <PlusOutlined />
              关联需求
            </button>
          </Popconfirm>
        </div>
      </header>

      {/* 主体：需求卡片网格 */}
      <main
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          padding: `${styles.spacing.xxl}px`,
        }}
      >
        <PlanRequirementList
          planId={planId ? Number(planId) : undefined}
          requirements={filtered}
          loading={loading}
          onUnlink={handleUnlink}
          onView={handleView}
        />
      </main>

      {/* 关联需求弹窗 */}
      <MyDrawer
        width={'70%'}
        name={'关联需求到当前计划'}
        open={choiceOpen}
        setOpen={(v) => {
          setChoiceOpen(v);
          if (!v) setSelectedRowKeys([]);
        }}
        drawerStyles={choiceDrawerStyles}
      >
        <ChoiceRequirementTable
          projectId={planInfo?.project_id}
          selectedRowKeys={selectedRowKeys}
          onSelectionChange={setSelectedRowKeys}
          onConfirm={handleBatchLink}
          confirmDisabled={linkLoading || selectedRowKeys.length === 0}
        />
      </MyDrawer>

      {/* 详情抽屉（复用现有 RequirementDetail） */}
      <MyDrawer
        width={'50%'}
        name={'需求详情'}
        open={detailOpen}
        setOpen={setDetailOpen}
        drawerStyles={detailDrawerStyles}
      >
        <RequirementDetail
          requirementId={activeReqId}
          callback={() => {
            setDetailOpen(false);
            // 详情保存后刷新列表（可能改了进度 / 名称）
            fetchRequirements();
          }}
        />
      </MyDrawer>
    </div>
  );
};

export default PlanReuirements;

/**
 * PlanMindMap —— 计划详情"脑图"Tab 容器
 *
 * 头部 = atlas 头部:
 *   - 计划名(主标题)
 *   - 副标题:脑图自身的统计(总节点 / 顶级数 / 最大深度)
 *   - 右侧:上次同步时间
 *
 * 中部 = MindMapCanvas 画布(自由脑图,按 plan_id 持久化 JSON)
 *
 * 职责:拉取计划信息(取 project_id),其它一概不取
 *       —— 脑图是独立的 JSON 笔记,跟 IPlanModule 树完全脱钩
 *
 * 布局关键:
 *   - 外层 div 是 flex column,固定高度 calc(100vh - 150px)
 *   - 头部 flexShrink: 0(不被压扁)
 *   - 内层 div 用 `position: relative; flex: 1; minHeight: 0` 撑开
 *   - MindMapCanvas 通过 position: absolute; inset: 0 填充(已内部实现)
 */
import { getPlanInfo } from '@/api/case/caseplan';
import MindMapCanvas from '@/pages/CaseHub/MindMap/MindMapCanvas';
import { useCaseHubTheme } from '@/pages/CaseHub/styles';
import { ICasePlan } from '@/pages/CaseHub/types';
import { Spin, Tag } from 'antd';
import dayjs from 'dayjs';
import { FC, useCallback, useEffect, useState } from 'react';

interface Props {
  planId?: string;
}

const PlanMindMap: FC<Props> = ({ planId }) => {
  const { token, colors, spacing } = useCaseHubTheme();
  const [planInfo, setPlanInfo] = useState<ICasePlan>();
  const [loading, setLoading] = useState(true);

  const loadPlanInfo = useCallback(async () => {
    if (!planId) return;
    setLoading(true);
    try {
      const { code, data } = await getPlanInfo(Number(planId));
      if (code === 0) setPlanInfo(data);
    } finally {
      setLoading(false);
    }
  }, [planId]);

  useEffect(() => {
    loadPlanInfo();
  }, [loadPlanInfo]);

  if (!planId) {
    return <div style={{ padding: spacing.lg }}>缺少 planId</div>;
  }
  if (loading || !planInfo) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: 'calc(100vh - 150px)',
        }}
      >
        <Spin description="正在加载脑图…" />
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: spacing.md,
        height: 'calc(100vh - 150px)',
        minHeight: 600,
        padding: `${spacing.lg}px ${spacing.xl}px`,
        background: token.colorBgLayout,
        overflow: 'hidden',
      }}
    >
      {/* Atlas 头部 */}
      <header
        style={{
          flexShrink: 0,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: spacing.lg,
          paddingBottom: spacing.md,
          borderBottom: `1px solid ${colors.border}`,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 10,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: colors.textTertiary,
              fontFamily: token.fontFamily,
            }}
          >
            <span>Plan · Atlas</span>
            <span style={{ width: 1, height: 10, background: colors.border }} />
            <span>Free Mind Map</span>
          </div>

          <h2
            style={{
              margin: 0,
              fontSize: 20,
              fontWeight: 500,
              color: colors.text,
              letterSpacing: '-0.005em',
              lineHeight: 1.25,
            }}
          >
            {planInfo.plan_name || `计划 #${planInfo.id}`}
          </h2>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              marginTop: 6,
              fontSize: 11,
              color: colors.textSecondary,
              letterSpacing: '0.04em',
            }}
          >
            <span
              style={{
                fontSize: 10,
                color: colors.textTertiary,
                fontStyle: 'italic',
              }}
            >
              中心主题 = "中心主题" · 自由编辑
            </span>
            {planInfo.plan_status ? (
              <Tag
                style={{
                  marginLeft: 4,
                  fontSize: 10,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  borderRadius: 2,
                  padding: '0 8px',
                  lineHeight: '18px',
                  color: colors.primary,
                  background: colors.primaryBg,
                  border: `1px solid ${colors.primary}40`,
                }}
              >
                {planInfo.plan_status}
              </Tag>
            ) : null}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 4,
            fontSize: 10,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: colors.textTertiary,
            fontFamily: token.fontFamily,
          }}
        >
          <span>Last sync</span>
          <span
            style={{
              fontSize: 12,
              color: colors.text,
              fontFamily: token.fontFamilyCode,
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: '0.02em',
              textTransform: 'none',
            }}
          >
            {dayjs().format('YYYY-MM-DD HH:mm')}
          </span>
        </div>
      </header>

      {/* 画布区 —— 撑开剩余高度,让 MindMapCanvas 用 position:absolute; inset:0 填满 */}
      <div
        style={{
          position: 'relative',
          flex: 1,
          minHeight: 0,
          width: '100%',
        }}
      >
        <MindMapCanvas
          planId={Number(planId)}
          projectId={planInfo.project_id}
        />
      </div>
    </div>
  );
};

export default PlanMindMap;

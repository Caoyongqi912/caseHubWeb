/**
 * StatCards · 顶部统计卡片行
 *
 * 设计取向:延续 Refined Ledger 语言 —— 不做"卡片盒子",只用发丝线
 * 切分四列;每列上小标签 (uppercase + tracking),中大数字 (等宽),
 * 底指示元素 (点 / 小条)。色值全走 antd token。
 *
 * 状态列(2 / 3)动态取自配置中心：按 sort 顺序取前两个状态做头条统计，
 * 其余状态展示在 QuickFilters 里。配置为空时,只保留 Total / Avg 两列。
 */

import { CaseEnumOption } from '@/pages/CaseHub/hooks/caseEnumOption';
import { ICasePlan } from '@/pages/CaseHub/types';
import { memo } from 'react';
import { resolveStatusColor } from '../statusColor';

export type PlanStatusItem = CaseEnumOption;

export interface PlanStats {
  /** 总计划数 */
  total: number;
  /** 各状态计数,key = 状态 value */
  statusCounts: Record<string, number>;
  /** 各阶段计数,key = 阶段 value */
  phaseCounts: Record<string, number>;
  /** 平均完成率 (0-100) */
  avgCompletion: number;
}

/** 从计划列表计算统计;statuses/phases 用于按 value 归类计数 */
export const computePlanStats = (
  plans: ICasePlan[],
  statuses: PlanStatusItem[],
  phases: PlanStatusItem[] = [],
): PlanStats => {
  const statusCounts: Record<string, number> = {};
  for (const s of statuses) statusCounts[s.value] = 0;
  const phaseCounts: Record<string, number> = {};
  for (const p of phases) phaseCounts[p.value] = 0;

  let completionSum = 0;
  let completionCount = 0;
  for (const p of plans) {
    const sKey = p.plan_status || '';
    if (sKey in statusCounts) statusCounts[sKey] += 1;
    const pKey = p.plan_phase || '';
    if (pKey in phaseCounts) phaseCounts[pKey] += 1;
    if (typeof p.completion_rate === 'number') {
      completionSum += p.completion_rate;
      completionCount += 1;
    }
  }
  return {
    total: plans.length,
    statusCounts,
    phaseCounts,
    avgCompletion:
      completionCount > 0 ? Math.round(completionSum / completionCount) : 0,
  };
};

interface CardProps {
  label: string;
  value: string;
  sub?: React.ReactNode;
  token: any;
  /** 强调色 token key(用于数值着色) */
  accentColorKey?: string;
  /** 标签右上的小标记 */
  tag?: React.ReactNode;
}

/** 单个 stat 列 —— 上标签、中数字、底 sub */
const StatColumn: React.FC<CardProps> = ({
  label,
  value,
  sub,
  token,
  accentColorKey,
  tag,
}) => (
  <div
    style={{
      flex: 1,
      minWidth: 0,
      padding: '4px 0 4px 0',
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
    }}
  >
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 6,
      }}
    >
      <span
        style={{
          fontSize: 10,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: token.colorTextTertiary,
          fontWeight: 600,
          fontFamily: token.fontFamilyCode,
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </span>
      {tag}
    </div>
    <div
      style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: 4,
        fontFamily: token.fontFamilyCode,
        fontVariantNumeric: 'tabular-nums',
        lineHeight: 1.05,
      }}
    >
      <span
        style={{
          fontSize: 28,
          fontWeight: 600,
          color: accentColorKey
            ? token[accentColorKey] || token.colorText
            : token.colorText,
          letterSpacing: '-0.01em',
        }}
      >
        {value}
      </span>
    </div>
    {sub ? (
      <div
        style={{
          fontSize: 11,
          color: token.colorTextTertiary,
          lineHeight: 1.4,
        }}
      >
        {sub}
      </div>
    ) : null}
  </div>
);

export interface StatCardsProps {
  stats: PlanStats;
  /** 状态配置(取自配置中心,空时只渲染 Total + Avg 两列) */
  statuses: PlanStatusItem[];
  loading?: boolean;
  token: any;
}

const StatCards: React.FC<StatCardsProps> = ({
  stats,
  statuses,
  loading,
  token,
}) => {
  const dash = loading ? '—' : '0';
  const [primary, secondary] = statuses;

  const primaryCount = primary ? stats.statusCounts[primary.value] || 0 : 0;
  const secondaryCount = secondary
    ? stats.statusCounts[secondary.value] || 0
    : 0;
  const primaryColor = primary
    ? resolveStatusColor(token, primary.color)
    : token.colorTextTertiary;
  const secondaryColor = secondary
    ? resolveStatusColor(token, secondary.color)
    : token.colorTextTertiary;

  const total = stats.total;
  const pct = (n: number) =>
    total > 0 ? `${Math.round((n / total) * 100)}%` : '0%';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'stretch',
        gap: 0,
        padding: '14px 0 16px',
        borderTop: `1px solid ${token.colorBorderSecondary}`,
        borderBottom: `1px solid ${token.colorBorderSecondary}`,
      }}
    >
      <StatColumn
        token={token}
        label="Total · 总计划"
        value={String(total).padStart(3, '0')}
        sub={
          <span
            style={{
              fontFamily: token.fontFamilyCode,
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: '0.05em',
            }}
          >
            № {loading ? '—' : String(total).padStart(3, '0')}
          </span>
        }
        tag={
          <span
            style={{
              width: 5,
              height: 5,
              borderRadius: '50%',
              background: token.colorPrimary,
              display: 'inline-block',
            }}
          />
        }
      />
      {primary ? (
        <>
          <Divider token={token} />
          <StatColumn
            token={token}
            label={primary.label}
            value={loading ? dash : String(primaryCount).padStart(2, '0')}
            sub={
              <DotLine
                token={token}
                color={primaryColor}
                label={pct(primaryCount)}
              />
            }
            tag={
              <span
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  background: primaryColor,
                  display: 'inline-block',
                }}
              />
            }
          />
        </>
      ) : null}
      {secondary ? (
        <>
          <Divider token={token} />
          <StatColumn
            token={token}
            label={secondary.label}
            value={loading ? dash : String(secondaryCount).padStart(2, '0')}
            sub={
              <DotLine
                token={token}
                color={secondaryColor}
                label={pct(secondaryCount)}
              />
            }
            tag={
              <span
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  background: secondaryColor,
                  display: 'inline-block',
                }}
              />
            }
          />
        </>
      ) : null}
      <Divider token={token} />
      <StatColumn
        token={token}
        label="Avg · 平均完成率"
        value={loading ? dash : `${stats.avgCompletion}%`}
        accentColorKey={
          stats.avgCompletion >= 100
            ? 'colorSuccess'
            : stats.avgCompletion >= 60
            ? 'colorPrimary'
            : 'colorText'
        }
        sub={
          <div
            style={{
              position: 'relative',
              height: 1,
              background: token.colorBorderSecondary,
              marginTop: 4,
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                width: `${Math.max(0, Math.min(100, stats.avgCompletion))}%`,
                background:
                  stats.avgCompletion >= 100
                    ? token.colorSuccess
                    : token.colorPrimary,
                transition: 'width 600ms cubic-bezier(0.22, 1, 0.36, 1)',
              }}
            />
          </div>
        }
      />
    </div>
  );
};

/** 列间发丝线 */
const Divider: React.FC<{ token: any }> = ({ token }) => (
  <div
    style={{
      width: 1,
      alignSelf: 'stretch',
      background: token.colorBorderSecondary,
      margin: '0 28px',
      opacity: 0.7,
    }}
  />
);

/** sub 行 · 一个色点 + 文本 */
const DotLine: React.FC<{ token: any; color: string; label: string }> = ({
  color,
  label,
}) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      fontVariantNumeric: 'tabular-nums',
    }}
  >
    <span
      style={{
        width: 5,
        height: 5,
        borderRadius: '50%',
        background: color,
        display: 'inline-block',
      }}
    />
    {label}
  </span>
);

export default memo(StatCards);

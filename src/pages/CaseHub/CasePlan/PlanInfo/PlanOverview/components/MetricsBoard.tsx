import { IPlanOverview, IPlanOverviewRound } from '@/api/case/caseplan';
import { useCaseHubTheme } from '@/pages/CaseHub/styles';
import { Tooltip } from 'antd';
import { ReactNode } from 'react';
import { usePlanOverviewStyles } from '../styles';

interface MetricsBoardProps {
  overview: IPlanOverview | undefined;
  loading: boolean;
}

/**
 * 顶部指标面板
 *
 * 三组核心指标横向并排：用例 / 缺陷 / 需求
 *  - 每组展示「主指标」+ 「副指标」两块，3 列等宽
 *  - 主指标：当前已有数据源中最具代表性的 1 个数字（大字号、强调色）
 *  - 副指标：辅助信息（小字号、低饱和）
 *  - 字段未维护时（缺陷完成率/重开率）—— 直接不展示，避免假数据
 *  - 数字走 tabular-nums 等宽，label 走 uppercase + tracking，与 StatCards 保持同一语言
 *
 * 数据来源：
 *  - 用例主指标 ← case_total；副指标 ← first_round（通过 / 失败 / 完成率）
 *  - 缺陷主指标 ← bug_total（后端目前只给总数）
 *  - 需求主指标 ← requirement_total；副指标 ← 需求完成数 / 需求完成率
 */
const MetricsBoard: React.FC<MetricsBoardProps> = ({ overview, loading }) => {
  // 用例指标
  const caseTotal = overview?.case_total ?? 0;
  const firstRound: IPlanOverviewRound = overview?.first_round ?? {
    passed: 0,
    failed: 0,
    not_executed: 0,
    completion_rate: 0,
  };

  // 缺陷指标
  const bugTotal = overview?.bug_total ?? 0;

  // 需求指标
  const reqTotal = overview?.requirement_total ?? 0;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        gap: 16,
      }}
    >
      <MetricGroupCard
        title="用例"
        accentTokenKey="colorPrimary"
        loading={loading}
        primary={{
          label: '用例总数',
          value: caseTotal,
          accentTokenKey: 'colorPrimary',
          tooltip: '该计划下关联的全部用例数',
        }}
        secondary={
          <SecondaryLine
            loading={loading}
            items={[
              {
                label: '通过',
                value: firstRound.passed,
                colorKey: 'colorSuccess',
              },
              {
                label: '失败',
                value: firstRound.failed,
                colorKey: 'colorError',
              },
              { label: '完成率', value: `${firstRound.completion_rate}%` },
            ]}
          />
        }
      />

      <MetricGroupCard
        title="缺陷"
        accentTokenKey="colorError"
        loading={loading}
        primary={{
          label: '缺陷总数',
          value: bugTotal,
          accentTokenKey: 'colorError',
          tooltip: '该计划下已关联的缺陷链接数（后端未维护完成/重开字段）',
        }}
        // 缺陷完成数 / 完成率 / 重开率 后端字段均未维护 —— secondary 不展示,
        // 整张卡只展示核心主指标, 保持视觉简洁
        secondary={null}
      />

      <MetricGroupCard
        title="需求"
        accentTokenKey="colorInfo"
        loading={loading}
        primary={{
          label: '需求总数',
          value: reqTotal,
          accentTokenKey: 'colorInfo',
          tooltip: '该计划下关联的需求数',
        }}
        // 需求完成数 / 完成率 —— 后续再设计其他数值时再补, 当前不展示
        secondary={null}
      />
    </div>
  );
};

/* ──────────────────────────────────────────────────────────────────── */

interface MetricPrimary {
  label: string;
  value: number;
  accentTokenKey?: string;
  tooltip?: string;
}

interface MetricGroupCardProps {
  title: string;
  accentTokenKey: string;
  loading: boolean;
  primary: MetricPrimary;
  /** 副区域：可放 SecondaryLine 或自定义 span */
  secondary?: ReactNode;
}

/**
 * 单个指标组卡片
 *  - 左侧 4px 宽「组标签」色条（accentTokenKey）
 *  - 顶部 GROUP / 组名（uppercase + 颜色）
 *  - 主体：1 个大主指标 + 1 行副指标
 */
const MetricGroupCard: React.FC<MetricGroupCardProps> = ({
  title,
  accentTokenKey,
  primary,
  secondary,
}) => {
  const styles = usePlanOverviewStyles();
  const { token } = useCaseHubTheme();
  const accent = resolveAccentColor(token, accentTokenKey);

  const primaryBody = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        padding: '6px 14px 8px 14px',
        minWidth: 0,
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
        }}
      >
        {primary.label}
      </span>
      <span
        style={{
          fontSize: 30,
          fontWeight: 600,
          color: primary.accentTokenKey
            ? resolveAccentColor(token, primary.accentTokenKey)
            : token.colorText,
          letterSpacing: '-0.01em',
          fontFamily: token.fontFamilyCode,
          fontVariantNumeric: 'tabular-nums',
          lineHeight: 1.05,
        }}
      >
        {String(primary.value).padStart(3, '0')}
      </span>
    </div>
  );

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'stretch',
        background: token.colorBgContainer,
        border: `1px solid ${token.colorBorderSecondary}`,
        borderRadius: 8,
        boxShadow: '0 1px 2px 0 rgba(0,0,0,0.03)',
        overflow: 'hidden',
        minWidth: 0,
      }}
    >
      {/* 左侧 4px 宽色条 */}
      <div
        style={{
          width: 4,
          flexShrink: 0,
          background: accent,
        }}
      />

      {/* 头部 + 主体 */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* 头部 GROUP 标签 + 组名 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 8,
            padding: '6px 14px 4px 12px',
            borderBottom: `1px dashed ${token.colorBorderSecondary}`,
          }}
        >
          <span
            style={{
              fontSize: 10,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: token.colorTextTertiary,
              fontWeight: 600,
              fontFamily: token.fontFamilyCode,
            }}
          >
            GROUP
          </span>
          <span
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: accent,
              fontFamily: token.fontFamilyCode,
            }}
          >
            {title}
          </span>
        </div>

        {/* 主指标 */}
        {primary.tooltip ? (
          <Tooltip title={primary.tooltip} placement="top">
            {primaryBody}
          </Tooltip>
        ) : (
          primaryBody
        )}

        {/* 副指标 —— 用底部细线分割 */}
        {secondary ? (
          <div
            style={{
              borderTop: `1px dashed ${token.colorBorderSecondary}`,
              padding: '6px 14px 8px 14px',
              minHeight: 22,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {secondary}
          </div>
        ) : null}
      </div>
    </div>
  );
};

/* ──────────────────────────────────────────────────────────────────── */

interface SecondaryItem {
  label: string;
  value: number | string;
  /** 可选：数值强调色 token key */
  colorKey?: string;
}

interface SecondaryLineProps {
  items: SecondaryItem[];
  loading: boolean;
}

/** 副指标一行：点 / 数字 + label 拼接；空格分隔各项 */
const SecondaryLine: React.FC<SecondaryLineProps> = ({ items }) => {
  const { token } = useCaseHubTheme();
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 14,
        fontSize: 11,
        color: token.colorTextTertiary,
        fontFamily: token.fontFamilyCode,
        fontVariantNumeric: 'tabular-nums',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}
    >
      {items.map((it, i) => {
        const display =
          typeof it.value === 'number'
            ? String(it.value).padStart(2, '0')
            : it.value;
        return (
          <span
            key={it.label}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
          >
            <span
              style={{
                width: 5,
                height: 5,
                borderRadius: '50%',
                background: it.colorKey
                  ? resolveAccentColor(token, it.colorKey)
                  : token.colorTextQuaternary,
                display: 'inline-block',
              }}
            />
            <span style={{ color: token.colorTextTertiary }}>{it.label}</span>
            <span
              style={{
                color: it.colorKey
                  ? resolveAccentColor(token, it.colorKey)
                  : token.colorTextSecondary,
                fontWeight: 600,
              }}
            >
              {display}
            </span>
          </span>
        );
      })}
    </span>
  );
};

/** 把 antd token key 解析为实际色值 */
const resolveAccentColor = (token: any, key: string): string => {
  if (!key) return token.colorText;
  if (token[key]) return token[key];
  return token.colorText;
};

export default MetricsBoard;

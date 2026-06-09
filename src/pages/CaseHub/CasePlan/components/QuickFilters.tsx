/**
 * QuickFilters · 状态/阶段快捷过滤 + 自定义搜索行
 *
 * 设计取向:
 *   上行: 状态与阶段 chip 组，靠左排列，激活态用主色微填充;
 *   下行(extra): 计划名称、负责人、时间范围等自定义筛选控件，
 *   与上行用发丝线分隔，整体保持 Refined Ledger 视觉语言。
 *
 * 状态列表由调用方传入(配置中心拉来)，配置为空时整组隐藏。
 * 所有组都为空且无 extra 时，整个组件不渲染。
 */

import { memo } from 'react';
import { resolveStatusColor } from '../statusColor';
import { PlanStatusItem } from './StatCards';

export type PlanStatusFilter = 'all' | string;

export interface FilterGroup {
  /** 分组小标签(uppercase tracking),如「状态」「阶段」 */
  label: string;
  /** 枚举项(配置中心拉来,空数组代表整组隐藏) */
  items: PlanStatusItem[];
  /** 项计数,key = item.value */
  counts: Record<string, number>;
  /** 当前选中 */
  value: PlanStatusFilter;
  /** 选中回调 */
  onChange: (v: PlanStatusFilter) => void;
}

export interface QuickFiltersProps {
  /** 多组过滤(状态、阶段等),空组会自动隐藏 */
  groups: FilterGroup[];
  /** 全部 chip 的计数 */
  total: number;
  token: any;
  /** 额外的自定义筛选控件(搜索框等)，渲染在 chip 行下方 */
  extra?: React.ReactNode;
}

const QuickFilters: React.FC<QuickFiltersProps> = ({
  groups,
  total,
  token,
  extra,
}) => {
  // 过滤掉空组
  const visibleGroups = groups.filter((g) => g.items.length > 0);
  const hasVisibleGroups = visibleGroups.length > 0;

  if (!hasVisibleGroups && !extra) return null;

  return (
    <div style={{ padding: '10px 0 0' }}>
      {/* chip 行 */}
      {hasVisibleGroups && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 24,
            flexWrap: 'wrap',
            paddingBottom: extra ? 10 : 12,
          }}
        >
          {visibleGroups.map((group) => {
            const options = [
              {
                key: 'all',
                label: '全部',
                count: total,
                dotColor: token.colorTextTertiary,
              },
              ...group.items.map((item) => ({
                key: item.value,
                label: item.label,
                count: group.counts[item.value] || 0,
                dotColor: resolveStatusColor(token, item.color),
              })),
            ];
            return (
              <div
                key={group.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  flexWrap: 'wrap',
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
                    marginRight: 6,
                    minWidth: 48,
                  }}
                >
                  {group.label}
                </span>
                {options.map((opt) => {
                  const active = group.value === opt.key;
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => group.onChange(opt.key)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 7,
                        height: 26,
                        padding: active ? '0 12px' : '0 10px',
                        border: active
                          ? `1px solid ${opt.dotColor}55`
                          : `1px solid ${token.colorBorderSecondary}`,
                        borderRadius: 2,
                        background: active
                          ? `${opt.dotColor}14`
                          : 'transparent',
                        color: active ? opt.dotColor : token.colorTextSecondary,
                        fontSize: 12,
                        fontWeight: active ? 600 : 500,
                        cursor: 'pointer',
                        transition: 'all 180ms ease',
                        fontFamily: token.fontFamily,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <span
                        style={{
                          width: 5,
                          height: 5,
                          borderRadius: '50%',
                          background: opt.dotColor,
                          opacity: active ? 1 : 0.65,
                          flexShrink: 0,
                        }}
                      />
                      {opt.label}
                      <span
                        style={{
                          fontFamily: token.fontFamilyCode,
                          fontSize: 11,
                          fontVariantNumeric: 'tabular-nums',
                          color: active
                            ? opt.dotColor
                            : token.colorTextTertiary,
                          opacity: active ? 0.9 : 0.85,
                          letterSpacing: '0.02em',
                        }}
                      >
                        {String(opt.count).padStart(2, '0')}
                      </span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}

      {/* extra 搜索行 */}
      {extra && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap',
            padding: hasVisibleGroups ? '10px 0 12px' : '0 0 12px',
            borderTop: hasVisibleGroups
              ? `1px solid ${token.colorBorderSecondary}`
              : 'none',
          }}
        >
          {extra}
        </div>
      )}
    </div>
  );
};

export default memo(QuickFilters);

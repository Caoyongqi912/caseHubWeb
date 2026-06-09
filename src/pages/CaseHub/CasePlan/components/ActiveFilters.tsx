/**
 * ActiveFilters · 已激活的筛选条件可视化条
 *
 * 设计取向:与 QuickFilters 同行 / 同区域;有激活条件时显示为可移除标签,
 * 右侧放置 "清空筛选" 按钮。无激活条件时整行不渲染,避免噪音。
 *
 * 当前覆盖 状态 / 阶段(QuickFilters 衍生);ProTable 表单筛选项
 * (名称 / 负责人 / 时间) 由 "清空筛选" 一并清掉。
 */

import { CloseCircleFilled, FilterFilled } from '@ant-design/icons';
import { Button } from 'antd';
import { memo } from 'react';

export interface ActiveFilterItem {
  /** 分组名,如「状态」「阶段」 */
  group: string;
  /** 当前 value(显示文案) */
  value: string;
  /** 移除回调 */
  onRemove: () => void;
}

export interface ActiveFiltersProps {
  items: ActiveFilterItem[];
  /** 一键清空:同时清掉 ProTable 表单筛选项 */
  onClearAll: () => void;
  token: any;
}

const ActiveFilters: React.FC<ActiveFiltersProps> = ({
  items,
  onClearAll,
  token,
}) => {
  if (items.length === 0) return null;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        flexWrap: 'wrap',
        padding: '6px 0 10px',
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          flexWrap: 'wrap',
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 10,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: token.colorTextTertiary,
            fontWeight: 600,
            fontFamily: token.fontFamilyCode,
            marginRight: 4,
          }}
        >
          <FilterFilled style={{ fontSize: 10 }} />
          Active · 已选
        </span>
        {items.map((item) => (
          <span
            key={`${item.group}:${item.value}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              height: 22,
              padding: '0 4px 0 10px',
              borderRadius: 2,
              background: token.colorFillTertiary,
              border: `1px solid ${token.colorBorderSecondary}`,
              fontSize: 12,
              color: token.colorTextSecondary,
            }}
          >
            <span style={{ color: token.colorTextTertiary, fontSize: 10 }}>
              {item.group}
            </span>
            <span style={{ color: token.colorText, fontWeight: 500 }}>
              {item.value}
            </span>
            <span
              role="button"
              aria-label={`移除筛选 ${item.group}:${item.value}`}
              onClick={item.onRemove}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 16,
                height: 16,
                cursor: 'pointer',
                color: token.colorTextTertiary,
                transition: 'color 160ms ease',
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.color =
                  token.colorError)
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.color =
                  token.colorTextTertiary)
              }
            >
              <CloseCircleFilled style={{ fontSize: 12 }} />
            </span>
          </span>
        ))}
      </div>
      <Button
        type="text"
        size="small"
        onClick={onClearAll}
        style={{
          color: token.colorTextSecondary,
          fontSize: 12,
          height: 22,
          padding: '0 8px',
        }}
      >
        清空筛选
      </Button>
    </div>
  );
};

export default memo(ActiveFilters);

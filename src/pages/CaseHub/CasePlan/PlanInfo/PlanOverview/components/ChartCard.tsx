import { ReactNode } from 'react';
import { usePlanOverviewStyles } from '../styles';

interface ChartCardProps {
  title: ReactNode;
  /** 右上角小操作按钮（默认无 —— 留作后续接入） */
  extra?: ReactNode;
  /** 图表区域 children —— 调用方控制内部具体图表组件 */
  children: ReactNode;
  /** 自定义 body 高度（默认 260） */
  bodyHeight?: number;
}

/**
 * 图表卡：与用例 Tab 的 caseItem 视觉一致
 *  - 白底、细发丝线边框、8px 圆角
 *  - 顶部：标题（extra 槽位保留，按需传入）
 *  - 主体：固定高度的图表区域，避免布局抖动
 */
const ChartCard: React.FC<ChartCardProps> = ({
  title,
  extra,
  children,
  bodyHeight,
}) => {
  const styles = usePlanOverviewStyles();

  return (
    <div style={styles.chartCard}>
      {/* header */}
      <div style={styles.chartHeader}>
        <div style={styles.chartTitle}>{title}</div>
        {extra ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {extra}
          </div>
        ) : null}
      </div>

      {/* body */}
      <div
        style={{
          ...styles.chartBody,
          height: bodyHeight ?? 260,
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default ChartCard;

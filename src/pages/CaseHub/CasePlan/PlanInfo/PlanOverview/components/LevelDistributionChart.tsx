import { useCaseHubTheme } from '@/pages/CaseHub/styles';
import { Pie } from '@ant-design/charts';
import { Empty } from 'antd';
import { useMemo } from 'react';

/**
 * 用例等级分布
 *  - 数据：后端 case_by_level（如 {"P0": 0, "P1": 2, "P2": 32}）
 *  - 展示：环形图 + 中心总数 + 底部 legend
 *  - 颜色：P0 红 / P1 橙 / P2 蓝 / P3 紫 —— 与用例 Tab 等级色板保持一致
 */
interface Props {
  levelMap: Record<string, number>;
}

const LEVEL_COLOR: Record<string, string> = {
  P0: '#ff4d4f',
  P1: '#faad14',
  P2: '#1890ff',
  P3: '#722ed1',
};

const LevelDistributionChart: React.FC<Props> = ({ levelMap }) => {
  const { token } = useCaseHubTheme();

  // 排序：P0 → P1 → P2 → P3，未知等级排最后
  const data = useMemo(() => {
    return Object.entries(levelMap || {})
      .filter(([, v]) => v > 0)
      .map(([level, value]) => ({ level, value }))
      .sort((a, b) => a.level.localeCompare(b.level));
  }, [levelMap]);

  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (total === 0) {
    return <Empty description="暂无数据" style={{ marginTop: 60 }} />;
  }

  return (
    <div style={{ height: '100%', position: 'relative' }}>
      <Pie
        data={data}
        angleField="value"
        colorField="level"
        radius={0.85}
        innerRadius={0.6}
        color={({ level }: any) => LEVEL_COLOR[level] || token.colorPrimary}
        label={
          data.length <= 4
            ? {
                type: 'outer',
                content: ({ percent }: any) => `${(percent * 100).toFixed(1)}%`,
                style: { fontSize: 11 },
              }
            : false
        }
        legend={{
          position: 'bottom',
          itemName: {
            style: { fontSize: 11 },
          },
        }}
        height={260}
        statistic={{
          title: {
            content: '总数',
            style: {
              fontSize: 11,
              color: token.colorTextTertiary,
              fontFamily: token.fontFamilyCode,
            },
          },
          content: {
            content: String(total),
            style: {
              fontSize: 24,
              fontWeight: 600,
              color: token.colorText,
              fontFamily: token.fontFamilyCode,
            },
          },
        }}
      />
    </div>
  );
};

export default LevelDistributionChart;

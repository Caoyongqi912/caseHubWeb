import { resolveStatusColor } from '@/pages/CaseHub/CasePlan/statusColor';
import { useCaseEnumConfig } from '@/pages/CaseHub/hooks/useCaseEnumConfig';
import { useCaseHubTheme } from '@/pages/CaseHub/styles';
import { Pie } from '@ant-design/charts';
import { Empty } from 'antd';
import { useMemo } from 'react';

/**
 * 一轮/二轮执行结果分布
 *  - 数据：后端 case_by_first_status / case_by_second_status（label -> count）
 *  - 展示：双 Pie，左侧「一轮」，右侧「二轮」
 *  - 颜色：走配置中心 CASE_STATUS —— 与用例 Tab / 状态过滤等所有页面保持同源
 */
interface Props {
  firstStatusMap: Record<string, number>;
  secondStatusMap: Record<string, number>;
}

const StatusDistributionChart: React.FC<Props> = ({
  firstStatusMap,
  secondStatusMap,
}) => {
  const { token } = useCaseHubTheme();
  const { options: caseStatusOptions } = useCaseEnumConfig('CASE_STATUS');

  // 用配置中心的 label -> color 做主映射，配置为空时降级到内置兜底色
  const STATUS_COLOR: Record<string, string> = useMemo(() => {
    const built: Record<string, string> = {};
    for (const opt of caseStatusOptions) {
      built[opt.label] = resolveStatusColor(token, opt.color);
    }
    return built;
  }, [caseStatusOptions, token]);

  // 兜底：配置中心没拉回来时用内置色
  const FALLBACK_COLOR = '#8c8c8c';
  const resolveColor = (label: string): string =>
    STATUS_COLOR[label] || FALLBACK_COLOR;

  const firstData = useMemo(
    () =>
      Object.entries(firstStatusMap || {})
        .filter(([, v]) => v > 0)
        .map(([type, value]) => ({ type, value })),
    [firstStatusMap],
  );

  const secondData = useMemo(
    () =>
      Object.entries(secondStatusMap || {})
        .filter(([, v]) => v > 0)
        .map(([type, value]) => ({ type, value })),
    [secondStatusMap],
  );

  if (firstData.length === 0 && secondData.length === 0) {
    return <Empty description="暂无数据" style={{ marginTop: 60 }} />;
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        height: '100%',
        padding: '8px 16px',
      }}
    >
      <RoundPie
        label="ROUND 1 · 一轮"
        data={firstData}
        resolveColor={resolveColor}
        token={token}
      />
      {/* 中间分隔细线 */}
      <div
        style={{
          width: 1,
          alignSelf: 'stretch',
          background: token.colorBorderSecondary,
          margin: '0 4px',
        }}
      />
      <RoundPie
        label="ROUND 2 · 二轮"
        data={secondData}
        resolveColor={resolveColor}
        token={token}
      />
    </div>
  );
};

interface RoundPieProps {
  label: string;
  data: { type: string; value: number }[];
  resolveColor: (label: string) => string;
  token: any;
}

const RoundPie: React.FC<RoundPieProps> = ({
  label,
  data,
  resolveColor,
  token,
}) => {
  if (data.length === 0) {
    return (
      <div style={{ flex: 1, height: '100%' }}>
        <div
          style={{
            textAlign: 'center',
            fontSize: 11,
            color: token.colorTextTertiary,
            fontFamily: token.fontFamilyCode,
            letterSpacing: '0.1em',
            marginBottom: 4,
          }}
        >
          {label}
        </div>
        <div
          style={{
            height: 'calc(100% - 18px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: token.colorTextTertiary,
            fontSize: 12,
          }}
        >
          暂无数据
        </div>
      </div>
    );
  }
  return (
    <div style={{ flex: 1, height: '100%' }}>
      <div
        style={{
          textAlign: 'center',
          fontSize: 11,
          color: token.colorTextTertiary,
          fontFamily: token.fontFamilyCode,
          letterSpacing: '0.1em',
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div style={{ height: 'calc(100% - 18px)' }}>
        <Pie
          data={data}
          angleField="value"
          colorField="type"
          radius={0.85}
          innerRadius={0.55}
          color={({ type }: any) => resolveColor(type)}
          label={
            data.length <= 4
              ? {
                  type: 'inner',
                  content: ({ value }: any) => `${value}`,
                  style: {
                    fill: '#fff',
                    fontSize: 12,
                    fontWeight: 600,
                  },
                }
              : false
          }
          legend={{
            position: 'bottom',
            itemName: { style: { fontSize: 11 } },
          }}
          height={220}
        />
      </div>
    </div>
  );
};

export default StatusDistributionChart;

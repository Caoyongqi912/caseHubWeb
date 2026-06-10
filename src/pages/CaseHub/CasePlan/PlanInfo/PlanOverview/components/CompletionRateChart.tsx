import { IPlanOverviewRound } from '@/api/case/caseplan';
import { resolveStatusColor } from '@/pages/CaseHub/CasePlan/statusColor';
import { useCaseEnumConfig } from '@/pages/CaseHub/hooks/useCaseEnumConfig';
import { useCaseHubTheme } from '@/pages/CaseHub/styles';
import { Empty } from 'antd';
import { useMemo } from 'react';

/**
 * 一轮 / 二轮 完成率对比
 *
 *  - 横向双行进度条：上方「一轮」下方「二轮」
 *  - 条内分段：通过 / 失败 / 未执行 比例着色
 *  - 右侧数字：完成率 + 通过 / 失败 计数
 *  - 颜色：走配置中心 CASE_STATUS —— 与状态分布图保持同源
 *  - 数据源：overview.first_round / overview.second_round
 */
interface Props {
  first: IPlanOverviewRound;
  second: IPlanOverviewRound;
}

const CompletionRateChart: React.FC<Props> = ({ first, second }) => {
  const { token } = useCaseHubTheme();
  const { options: caseStatusOptions } = useCaseEnumConfig('CASE_STATUS');

  // 从配置中心解析「通过 / 失败」色
  const colorOf = useMemo(() => {
    const built: Record<string, string> = {};
    for (const opt of caseStatusOptions) {
      built[opt.label] = resolveStatusColor(token, opt.color);
    }
    return (label: string) => built[label] || token.colorTextTertiary;
  }, [caseStatusOptions, token]);

  const data = useMemo(
    () => [
      { label: '一轮 · Round 1', round: first },
      { label: '二轮 · Round 2', round: second },
    ],
    [first, second],
  );

  const total = first.passed + first.failed + first.not_executed;
  if (total === 0) {
    return <Empty description="暂无数据" style={{ marginTop: 60 }} />;
  }

  return (
    <div
      style={{
        height: '100%',
        padding: '16px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
        justifyContent: 'center',
      }}
    >
      {data.map(({ label, round }) => {
        const sum = round.passed + round.failed + round.not_executed;
        if (sum === 0) return null;
        const passedPct = (round.passed / sum) * 100;
        const failedPct = (round.failed / sum) * 100;
        const notExecPct = 100 - passedPct - failedPct;

        // 通过色: 优先"通过"label 的色, 否则 success token
        const passedColor =
          colorOf('通过') || colorOf('成功') || token.colorSuccess;
        const failedColor = colorOf('失败') || token.colorError;

        return (
          <div
            key={label}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            {/* 标题行 */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: 12,
              }}
            >
              <span
                style={{
                  color: token.colorTextSecondary,
                  fontFamily: token.fontFamilyCode,
                  letterSpacing: '0.05em',
                }}
              >
                {label}
              </span>
              <span
                style={{
                  color: token.colorText,
                  fontFamily: token.fontFamilyCode,
                  fontVariantNumeric: 'tabular-nums',
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                {round.completion_rate}%
                <span
                  style={{
                    color: token.colorTextTertiary,
                    fontWeight: 400,
                    fontSize: 11,
                    marginLeft: 8,
                  }}
                >
                  通过 {round.passed} · 失败 {round.failed}
                </span>
              </span>
            </div>

            {/* 进度条：分段渲染 */}
            <div
              style={{
                position: 'relative',
                height: 18,
                borderRadius: 4,
                overflow: 'hidden',
                background: token.colorFillTertiary,
                display: 'flex',
              }}
            >
              <div
                style={{
                  width: `${passedPct}%`,
                  background: passedColor,
                  transition: 'width 300ms ease',
                }}
                title={`通过 ${round.passed}`}
              />
              <div
                style={{
                  width: `${failedPct}%`,
                  background: failedColor,
                  transition: 'width 300ms ease',
                }}
                title={`失败 ${round.failed}`}
              />
              <div
                style={{
                  width: `${notExecPct}%`,
                  background: 'transparent',
                }}
                title={`未执行 ${round.not_executed}`}
              />
            </div>

            {/* 图例 */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                fontSize: 11,
                color: token.colorTextTertiary,
                fontFamily: token.fontFamilyCode,
              }}
            >
              <LegendDot color={passedColor} label="通过" />
              <LegendDot color={failedColor} label="失败" />
              <LegendDot
                color="transparent"
                borderColor={token.colorBorder}
                label="未执行"
              />
              <span style={{ marginLeft: 'auto' }}>总数 {sum}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

interface LegendDotProps {
  color: string;
  borderColor?: string;
  label: string;
}
const LegendDot: React.FC<LegendDotProps> = ({ color, borderColor, label }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
    <span
      style={{
        display: 'inline-block',
        width: 8,
        height: 8,
        borderRadius: 2,
        background: color,
        border: borderColor ? `1px solid ${borderColor}` : 'none',
      }}
    />
    {label}
  </span>
);

export default CompletionRateChart;

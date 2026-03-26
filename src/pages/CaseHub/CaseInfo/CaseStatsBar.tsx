import { useCaseHubTheme } from '@/pages/CaseHub/styles';
import {
  CheckCircleFilled,
  ClockCircleFilled,
  CloseCircleFilled,
} from '@ant-design/icons';
import { Tooltip } from 'antd';
import { FC, useMemo } from 'react';
import { useCaseStatsBarStyles } from '../styles/CaseStatsBarStyles';

interface Props {
  total: number;
  passed: number;
  failed: number;
  unchecked: number;
}

const CaseStatsBar: FC<Props> = ({ total, passed, failed, unchecked }) => {
  const styles = useCaseStatsBarStyles();
  const { colors } = useCaseHubTheme();

  const stats = useMemo(() => {
    const executed = passed + failed;
    const passRate = executed > 0 ? Math.round((passed / executed) * 100) : 0;
    const executionRate = total > 0 ? Math.round((executed / total) * 100) : 0;

    return {
      executed,
      passRate,
      executionRate,
    };
  }, [total, passed, failed]);

  if (total === 0) {
    return null;
  }

  return (
    <div style={styles.container()}>
      <div style={styles.progressSection()}>
        <Tooltip title={`执行进度: ${stats.executed}/${total}`}>
          <div style={styles.progressBarContainer()}>
            <div style={styles.progressBarFill(stats.executionRate)} />
          </div>
        </Tooltip>
        <span style={styles.statValue()}>
          {stats.executed}/{total}
        </span>
        <span style={styles.summaryText()}>已执行</span>
      </div>

      <div style={styles.divider()} />

      <Tooltip title={`通过率: ${stats.passRate}%`}>
        <div style={styles.statItem(colors.success)}>
          <CheckCircleFilled style={{ color: colors.success, fontSize: 14 }} />
          <span style={styles.statValue()}>{passed}</span>
          <span style={styles.statPercent()}>({stats.passRate}%)</span>
          <span style={styles.summaryText()}>通过</span>
        </div>
      </Tooltip>

      <Tooltip title={`失败数: ${failed}`}>
        <div style={styles.statItem(colors.error)}>
          <CloseCircleFilled style={{ color: colors.error, fontSize: 14 }} />
          <span style={styles.statValue()}>{failed}</span>
          <span style={styles.statPercent()}>
            ({total > 0 ? Math.round((failed / total) * 100) : 0}%)
          </span>
          <span style={styles.summaryText()}>失败</span>
        </div>
      </Tooltip>

      <Tooltip title={`未测数: ${unchecked}`}>
        <div style={styles.statItem(colors.textSecondary)}>
          <ClockCircleFilled
            style={{ color: colors.textSecondary, fontSize: 14 }}
          />
          <span style={styles.statValue()}>{unchecked}</span>
          <span style={styles.statPercent()}>
            ({total > 0 ? Math.round((unchecked / total) * 100) : 0}%)
          </span>
          <span style={styles.summaryText()}>未测</span>
        </div>
      </Tooltip>

      <div style={styles.divider()} />

      <Tooltip title="总用例数">
        <div style={styles.statItem(colors.primary)}>
          <span style={styles.statValue()}>{total}</span>
          <span style={styles.summaryText()}>总用例</span>
        </div>
      </Tooltip>
    </div>
  );
};

export default CaseStatsBar;

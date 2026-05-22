import {
  CheckCircleFilled,
  ClockCircleFilled,
  CloseCircleFilled,
} from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import { Divider, Progress, Space, Statistic, theme, Tooltip } from 'antd';
import { FC, useMemo } from 'react';

const { useToken } = theme;

interface Props {
  total: number;
  passed: number;
  failed: number;
  unchecked: number;
}

const CaseStatsBar: FC<Props> = ({ total, passed, failed, unchecked }) => {
  const { token } = useToken();

  const stats = useMemo(() => {
    const executed = passed + failed;
    const executionRate = total > 0 ? Math.round((executed / total) * 100) : 0;
    const passRate = executed > 0 ? Math.round((passed / executed) * 100) : 0;
    const failRate = total > 0 ? Math.round((failed / total) * 100) : 0;
    const uncheckedRate = total > 0 ? Math.round((unchecked / total) * 100) : 0;
    return { executed, executionRate, passRate, failRate, uncheckedRate };
  }, [total, passed, failed, unchecked]);

  if (total === 0) return null;

  return (
    <ProCard bodyStyle={{ padding: 0 }} style={{ marginTop: 8, width: '100%' }}>
      <div
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: token.marginXL,
          padding: `${token.paddingSM}px ${token.paddingLG}px`,
          background: `linear-gradient(135deg, ${token.colorPrimaryBg} 0%, ${token.colorBgContainer} 100%)`,
          borderRadius: token.borderRadiusLG,
          border: `1px solid ${token.colorBorder}`,
          flexWrap: 'wrap',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            flex: 1,
            minWidth: 200,
            gap: token.marginMD,
          }}
        >
          <Tooltip title={`执行进度: ${stats.executed}/${total}`}>
            <Progress
              percent={stats.executionRate}
              showInfo={false}
              size={{ height: 8 }}
              strokeColor={{
                from: token.colorPrimary,
                to: token.colorPrimaryHover || token.colorPrimary,
              }}
              trailColor={`${token.colorBorder}40`}
              style={{ flex: 1, margin: 0 }}
            />
          </Tooltip>
          <span
            style={{ fontSize: 14, fontWeight: 700, color: token.colorText }}
          >
            {stats.executed}/{total}
          </span>
          <span
            style={{
              fontSize: 12,
              color: token.colorTextSecondary,
              whiteSpace: 'nowrap',
            }}
          >
            已执行
          </span>
        </div>

        <Divider type="vertical" style={{ height: 24, margin: 0 }} />

        <Tooltip title={`通过率: ${stats.passRate}%`}>
          <Space size="small" align="center">
            <CheckCircleFilled
              style={{ color: token.colorSuccess, fontSize: 14 }}
            />
            <Statistic
              value={passed}
              suffix={`(${stats.passRate}%)`}
              precision={0}
              valueStyle={{
                fontSize: 14,
                fontWeight: 700,
                color: token.colorText,
              }}
              style={{ marginBottom: 0 }}
            />
            <span style={{ fontSize: 12, color: token.colorTextSecondary }}>
              通过
            </span>
          </Space>
        </Tooltip>

        <Tooltip title={`失败数: ${failed}`}>
          <Space size="small" align="center">
            <CloseCircleFilled
              style={{ color: token.colorError, fontSize: 14 }}
            />
            <Statistic
              value={failed}
              suffix={`(${stats.failRate}%)`}
              precision={0}
              valueStyle={{
                fontSize: 14,
                fontWeight: 700,
                color: token.colorText,
              }}
              style={{ marginBottom: 0 }}
            />
            <span style={{ fontSize: 12, color: token.colorTextSecondary }}>
              失败
            </span>
          </Space>
        </Tooltip>

        <Tooltip title={`未测数: ${unchecked}`}>
          <Space size="small" align="center">
            <ClockCircleFilled
              style={{ color: token.colorTextSecondary, fontSize: 14 }}
            />
            <Statistic
              value={unchecked}
              suffix={`(${stats.uncheckedRate}%)`}
              precision={0}
              valueStyle={{
                fontSize: 14,
                fontWeight: 700,
                color: token.colorText,
              }}
              style={{ marginBottom: 0 }}
            />
            <span style={{ fontSize: 12, color: token.colorTextSecondary }}>
              未测
            </span>
          </Space>
        </Tooltip>

        <Divider type="vertical" style={{ height: 24, margin: 0 }} />

        <Tooltip title="总用例数">
          <Space size="small" align="center">
            <Statistic
              value={total}
              precision={0}
              valueStyle={{
                fontSize: 14,
                fontWeight: 700,
                color: token.colorText,
              }}
              style={{ marginBottom: 0 }}
            />
            <span style={{ fontSize: 12, color: token.colorTextSecondary }}>
              总用例
            </span>
          </Space>
        </Tooltip>
      </div>
    </ProCard>
  );
};

export default CaseStatsBar;

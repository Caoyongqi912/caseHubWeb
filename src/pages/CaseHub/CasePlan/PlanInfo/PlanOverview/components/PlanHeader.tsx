import { resolveStatusColor } from '@/pages/CaseHub/CasePlan/statusColor';
import { useCaseEnumConfig } from '@/pages/CaseHub/hooks/useCaseEnumConfig';
import { useCaseHubTheme } from '@/pages/CaseHub/styles';
import { ICasePlan } from '@/pages/CaseHub/types';
import { ReloadOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Space, Tag } from 'antd';
import { useMemo } from 'react';
import { usePlanOverviewStyles } from '../styles';

interface PlanHeaderProps {
  planInfo: ICasePlan | undefined;
  loading: boolean;
  onRefresh: () => void;
}

/**
 * 概览页头部
 *
 * 左侧：计划名称 + 状态 Tag（颜色取自配置中心的 PLAN_STATUS 枚举）
 * 中部：负责人、起止时间（图标 + 文本）
 * 右侧：时间区间筛选（无指定时间时回退为「近 30 天」展示）与刷新按钮
 *
 * 设计要点：
 *  - 不做"卡片"嵌套，只用一组 inline 信息 —— 与用例 Tab 顶部过滤条同语言
 *  - 时间筛选为占位入口（后端目前未支持按时间过滤统计），点击后通过 tooltip 提示
 */
const PlanHeader: React.FC<PlanHeaderProps> = ({ planInfo, onRefresh }) => {
  const styles = usePlanOverviewStyles();
  const { token } = useCaseHubTheme();
  const { options: planStatusOptions } = useCaseEnumConfig('PLAN_STATUS');

  // 状态颜色：与配置中心 PLAN_STATUS 枚举保持一致
  const statusColorMap = useMemo<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    for (const s of planStatusOptions) {
      map[s.value] = resolveStatusColor(token, s.color);
    }
    return map;
  }, [planStatusOptions, token]);

  const statusValue = planInfo?.plan_status || '';
  const statusColor = statusColorMap[statusValue] || token.colorTextTertiary;
  // plan_status 在数据库里存的是 value (如 PROCESSING / DONE),
  // 展示走 label —— 用配置中心的 value->label 映射
  const statusLabel =
    planStatusOptions.find((s) => s.value === statusValue)?.label ||
    statusValue ||
    '-';

  return (
    <div style={styles.headerCard}>
      {/* 左侧：计划名 + 状态 */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          minWidth: 0,
          flex: '1 1 280px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            minWidth: 0,
          }}
        >
          <span
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: token.colorText,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {planInfo?.plan_name || '加载中...'}
          </span>
          {planInfo?.plan_status ? (
            <Tag
              style={{
                color: statusColor,
                background: 'transparent',
                border: `1px solid ${statusColor}`,
                margin: 0,
                fontFamily: token.fontFamilyCode,
              }}
            >
              {statusLabel}
            </Tag>
          ) : null}
        </div>
        {planInfo?.plan_description ? (
          <span
            style={{
              fontSize: 12,
              color: token.colorTextTertiary,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {planInfo.plan_description}
          </span>
        ) : null}
      </div>

      {/* 中部：负责人 */}
      <Space size="middle">
        <InfoItem
          icon={<UserOutlined style={{ color: token.colorTextSecondary }} />}
          label="负责人"
          value={planInfo?.charge_name || '-'}
        />
      </Space>

      {/* 右侧：仅刷新按钮
       * 计划起止时间 / 时间范围筛选都不展示 —— 后端统计接口未支持时间维度,
       * 用户层也大概率不会传起止时间, 展示出来会形成「看起来可筛」假象。 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginLeft: 'auto',
        }}
      >
        <Button
          size="small"
          type="text"
          icon={<ReloadOutlined />}
          onClick={onRefresh}
        >
          刷新
        </Button>
      </div>
    </div>
  );
};

interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}

/** 单个 inline 信息单元 —— 图标 + label + value，间距与用例 Tab 头部信息条保持一致 */
const InfoItem: React.FC<InfoItemProps> = ({ icon, label, value }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      fontSize: 12,
      color: '#595959',
    }}
  >
    {icon}
    <span style={{ color: '#8c8c8c' }}>{label}</span>
    <span style={{ color: '#262626', fontWeight: 500 }}>{value}</span>
  </div>
);

export default PlanHeader;

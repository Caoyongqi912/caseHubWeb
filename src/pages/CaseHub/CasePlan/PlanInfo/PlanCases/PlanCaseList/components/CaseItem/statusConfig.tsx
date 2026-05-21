import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  MinusCircleOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';

export interface StatusConfig {
  label: string;
  color: string;
}

export const QUICK_TOGGLE_STATUS: number[] = [1, 2];

export const STATUS_CONFIG_MAP: Record<number, StatusConfig> = {
  0: { label: '未开始', color: 'default' },
  1: { label: '通过', color: 'success' },
  2: { label: '失败', color: 'error' },
  3: { label: '阻塞', color: 'warning' },
  4: { label: '跳过', color: 'processing' },
};

export const STATUS_ICON_MAP: Record<number, React.ReactNode> = {
  0: <ClockCircleOutlined />,
  1: <CheckCircleOutlined />,
  2: <CloseCircleOutlined />,
  3: <MinusCircleOutlined />,
  4: <MinusCircleOutlined />,
};

export const createStatusSelectItems = (): MenuProps['items'] =>
  Object.entries(STATUS_CONFIG_MAP).map(([key, config]) => ({
    key,
    label: (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        {STATUS_ICON_MAP[Number(key)]}
        {config.label}
      </span>
    ),
  }));

export const getStatusConfig = (status: number): StatusConfig =>
  STATUS_CONFIG_MAP[status] || STATUS_CONFIG_MAP[0];

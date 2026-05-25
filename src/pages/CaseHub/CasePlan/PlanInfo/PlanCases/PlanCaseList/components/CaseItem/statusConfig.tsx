import {
  CheckCircleFilled,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleFilled,
  CloseCircleOutlined,
  ExclamationCircleFilled,
  MinusCircleFilled,
  MinusCircleOutlined,
  QuestionCircleFilled,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';

/**
 * 用例状态配置（用于列表展示和批量操作）
 */
export interface StatusConfig {
  label: string;
  color: string;
}

/**
 * 步骤状态配置（用于步骤表格，包含图标）
 */
export interface StepStatusConfig extends StatusConfig {
  icon: React.ReactNode;
}

export const QUICK_TOGGLE_STATUS: number[] = [1, 2];

/**
 * 用例状态配置映射
 * 用于 CaseItem 组件的状态展示和批量操作
 */
export const CASE_STATUS_CONFIG: Record<number, StatusConfig> = {
  0: { label: '未开始', color: 'default' },
  1: { label: '通过', color: 'success' },
  2: { label: '失败', color: 'error' },
  3: { label: '阻塞', color: 'warning' },
  4: { label: '跳过', color: 'processing' },
};

/**
 * 保持向后兼容的别名
 * @deprecated 使用 CASE_STATUS_CONFIG 代替
 */
export const STATUS_CONFIG_MAP = CASE_STATUS_CONFIG;

/**
 * 步骤状态配置映射（用于步骤表格）
 * 包含状态图标，区分"未填写"与"通过"等状态
 */
export const STEP_STATUS_CONFIG: Record<number, StepStatusConfig> = {
  0: {
    label: '未填写',
    color: 'default',
    icon: <QuestionCircleFilled style={{ fontSize: 16, color: '#aeaeaeff' }} />,
  },
  1: {
    label: '通过',
    color: 'success',
    icon: <CheckCircleFilled style={{ fontSize: 16, color: '#13c2c2' }} />,
  },
  2: {
    label: '阻塞',
    color: 'error',
    icon: <CloseCircleFilled style={{ fontSize: 16, color: '#FF4D4F' }} />,
  },
  3: {
    label: '跳过',
    color: 'warning',
    icon: <MinusCircleFilled style={{ fontSize: 16, color: '#FF9900' }} />,
  },
  4: {
    label: '其他',
    color: 'purple',
    icon: (
      <ExclamationCircleFilled style={{ fontSize: 16, color: '#FF4D4F' }} />
    ),
  },
};

/**
 * 保持向后兼容的别名
 * @deprecated 使用 STEP_STATUS_CONFIG 代替
 */
export const STATUS_ICON_MAP: Record<number, React.ReactNode> = {
  0: <ClockCircleOutlined />,
  1: <CheckCircleOutlined />,
  2: <CloseCircleOutlined />,
  3: <MinusCircleOutlined />,
  4: <MinusCircleOutlined />,
};

/**
 * 创建状态选择下拉菜单项
 * 用于 CaseItem 组件的状态切换下拉菜单
 */
export const createStatusSelectItems = (): MenuProps['items'] =>
  Object.entries(CASE_STATUS_CONFIG).map(([key, config]) => ({
    key,
    label: (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        {STATUS_ICON_MAP[Number(key)]}
        {config.label}
      </span>
    ),
  }));

/**
 * 获取用例状态配置
 */
export const getCaseStatusConfig = (status: number): StatusConfig =>
  CASE_STATUS_CONFIG[status] || CASE_STATUS_CONFIG[0];

/**
 * 获取步骤状态配置
 */
export const getStepStatusConfig = (status: number): StepStatusConfig =>
  STEP_STATUS_CONFIG[status] || STEP_STATUS_CONFIG[0];

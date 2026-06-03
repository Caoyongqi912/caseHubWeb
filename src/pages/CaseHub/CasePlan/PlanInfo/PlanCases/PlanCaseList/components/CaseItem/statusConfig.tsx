import type { MenuProps } from 'antd';
import { useMemo } from 'react';

import { useCaseEnumConfig } from '@/pages/CaseHub/hooks/useCaseEnumConfig';

/**
 * 用例状态配置（用于列表展示和批量操作）
 * 从 useCaseEnumConfig 动态获取，支持后端配置化
 */
export interface StatusConfig {
  label: string;
  color: string;
}

/**
 * 从动态枚举数据构建用例状态配置映射
 * @param options - 从 Context 获取的状态选项列表（value 为 string 类型）
 * @returns 按 status value 索引的配置映射（无数据时返回空对象）
 */
export const buildStatusConfig = (
  options: Array<{ value: string; label: string; color: string }>,
): Record<string, StatusConfig> => {
  if (!options.length) return {};
  const config: Record<string, StatusConfig> = {};
  options.forEach((opt) => {
    config[opt.value] = {
      label: opt.label,
      color: opt.color,
    };
  });
  return config;
};

/**
 * 创建带颜色圆点的下拉菜单项（统一函数）
 * 用于 CaseItem 组件的状态切换 / 评审状态切换下拉菜单
 * 无数据时返回空数组
 *
 * 原代码中 createStatusSelectItems 与 createReviewSelectItems 实现完全一致，
 * 已合并为单一函数避免重复
 */
export const createSelectMenuItems = (
  options: Array<{ value: string; label: string; color: string }>,
): MenuProps['items'] =>
  options.length > 0
    ? options.map((opt) => ({
        key: opt.value,
        label: (
          <span
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            <span
              style={{
                display: 'inline-block',
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: opt.color || '#999',
              }}
            />
            {opt.label}
          </span>
        ),
      }))
    : [];

/** @deprecated 使用 createSelectMenuItems 替代 */
export const createStatusSelectItems = createSelectMenuItems;

/** @deprecated 使用 createSelectMenuItems 替代 */
export const createReviewSelectItems = createSelectMenuItems;

/**
 * Hook：获取动态构建的状态配置
 * 内部消费 useCaseEnumConfig，返回可直接使用的配置对象
 * 所有需要状态配置的组件应优先使用此 Hook
 *
 * @returns {
 *   caseStatusConfig - 用例状态配置（用于 Tag 展示、消息提示等），key 为 string
 *   stepStatusConfig - 步骤状态配置（与 caseStatusConfig 完全相同，保留别名兼容旧引用）
 *   statusSelectItems - 下拉菜单项（用于 Dropdown 选择器）
 *   reviewSelectItems - 评审状态下拉菜单项（用于评审状态 Dropdown 选择器）
 * }
 *
 * @example
 * const { caseStatusConfig, statusSelectItems } = useDynamicStatusConfig();
 * const config = caseStatusConfig[firstStatusStr];
 */
export const useDynamicStatusConfig = () => {
  const { options: caseOptions } = useCaseEnumConfig('CASE_STATUS');
  const { options: reviewOptions } = useCaseEnumConfig('REVIEW_STATUS');

  const caseStatusConfig = useMemo(
    () => buildStatusConfig(caseOptions),
    [caseOptions],
  );

  // 步骤状态复用同一份执行状态枚举配置（一轮/二轮/步骤主状态共用）
  // 直接使用同一引用，无需重复构建
  const stepStatusConfig = caseStatusConfig;

  const statusSelectItems = useMemo(
    () => createSelectMenuItems(caseOptions),
    [caseOptions],
  );

  const reviewSelectItems = useMemo(
    () => createSelectMenuItems(reviewOptions),
    [reviewOptions],
  );

  return {
    caseStatusConfig,
    stepStatusConfig,
    statusSelectItems,
    reviewSelectItems,
  };
};

/**
 * @file pages/CaseHub/hooks/caseEnumOption.ts
 * @description 用例中心枚举（等级 / 状态 / 评审状态）公共类型与转换工具
 * 供所有 CaseHub 页面通过 useCaseEnumConfig 拉取后统一消费
 */

import type { ICaseEnumConfig } from '@/pages/CaseHub/CaseConfig/types';

/**
 * antd Select / ProFormSelect 所需的最小 options 形状
 * 用 Pick 复用 CaseEnumOption，避免字段重复定义
 */
export type CaseEnumSelectOption = Pick<CaseEnumOption, 'value' | 'label'>;

/**
 * 单个枚举选项的展示形态（从后端 ICaseEnumConfig 映射而来）
 */
export interface CaseEnumOption {
  /** 枚举数值（string 类型，与后端 value 字段对齐） */
  value: string;
  /** 显示名称 */
  label: string;
  /** 主题色（Tag 颜色），支持 antd 语义色关键字或 hex 色值 */
  color: string;
}

/**
 * 将后端返回的 ICaseEnumConfig[] 转换为前端使用的 CaseEnumOption[]
 * 过滤掉 enabled=false 的项，并按 sort 升序排列
 */
export const transformEnumDataToOptions = (
  data: ICaseEnumConfig[] | undefined | null,
): CaseEnumOption[] => {
  if (!Array.isArray(data) || data.length === 0) return [];

  return data
    .filter((item) => item.enabled !== false)
    .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
    .map((item) => ({
      value: item.value,
      label: item.label,
      color: item.color || 'default',
    }));
};

/**
 * 将 CaseEnumOption[] 转换为 antd Select / ProFormSelect 所需的 options 格式
 * 空数组上 .map 自动返回 []，无需额外守卫
 */
export const toSelectOptions = (
  options: CaseEnumOption[],
): CaseEnumSelectOption[] =>
  options.map(({ value, label }) => ({ value, label }));

/**
 * 将 CaseEnumOption[] 转换为 ProTable valueEnum 格式
 * 兼容默认显示（{value: {text}}）与 valueType='select'
 */
export const toValueEnum = (
  options: CaseEnumOption[],
): Record<string, { text: string; status?: string }> => {
  const result: Record<string, { text: string; status?: string }> = {};
  for (const { value, label, color } of options) {
    result[value] = { text: label, status: color };
  }
  return result;
};

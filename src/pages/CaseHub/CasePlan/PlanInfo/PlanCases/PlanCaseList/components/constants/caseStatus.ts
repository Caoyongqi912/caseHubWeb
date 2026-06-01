/**
 * @file PlanCaseList/components/constants/caseStatus.ts
 * @description 用例状态相关的常量定义，统一管理所有状态配置
 */

/**
 * 用例状态选项（用于表单选择）
 * 包含完整的 5 种状态：未开始、通过、失败、阻塞、跳过
 */
export const CASE_STATUS_OPTIONS: { label: string; value: number }[] = [
  { label: '未开始', value: 0 },
  { label: '通过', value: 1 },
  { label: '失败', value: 2 },
  { label: '阻塞', value: 3 },
  { label: '跳过', value: 4 },
];

/**
 * 用例状态选项（用于批量复制，只包含前 3 种状态）
 * 复制时通常只需要设置常用状态
 */
export const CASE_STATUS_OPTIONS_FOR_COPY: { label: string; value: number }[] =
  [
    { label: '待执行', value: 0 },
    { label: '通过', value: 1 },
    { label: '失败', value: 2 },
  ];

/**
 * 评审状态选项
 */
export const REVIEW_STATUS_OPTIONS: { label: string; value: number }[] = [
  { label: '待评审', value: 0 },
  { label: '已评审', value: 1 },
];

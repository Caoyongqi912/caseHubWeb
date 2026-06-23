/**
 * @file pages/CaseHub/CaseConfig/caseStatus.ts
 * @description 用例状态枚举 (CASE_STATUS) 硬编码常量
 *
 * 与后端 `app/constant/caseStatus.py` 的 BUILTIN_CASE_STATUS 保持一一对应。
 * 这里不再走 case_config 表, 避免:
 *  1. admin 在配置中心改掉 value 后, 破坏 step→case 聚合 / 统计 / dynamic 文案
 *  2. 一轮 / 二轮 step 状态共用同一份枚举, 漂移面大, 收口在代码层
 *  3. value 改用英文短词 (pass / fail / ...), 排查日志 / 抓 trace 时更可读
 *
 * 新增 / 修改状态需要同时改这里 + 后端 BUILTIN_CASE_STATUS, 并检查
 *   所有 _LABEL_OF / 聚合逻辑是否还成立.
 */

export interface CaseStatusItem {
  /** 状态值, 与后端 PlanCaseAssociation.first_status/second_status 列内容一致 */
  value: string;
  /** 中文展示名 */
  label: string;
  /** 主题色 (用于 Tag / 进度条 / 图例) */
  color: string;
  /** 排序 (升序) */
  sort: number;
}

/** 5 个硬编码状态. 顺序即 sort 升序, 调换位置 = 业务变更. */
export const BUILTIN_CASE_STATUS: readonly CaseStatusItem[] = [
  { value: 'ready', label: '待测试', color: '#918f8f', sort: 0 },
  { value: 'pass', label: '成功', color: '#52c41a', sort: 1 },
  { value: 'fail', label: '失败', color: '#ff0000', sort: 2 },
  { value: 'skip', label: '跳过', color: '#faad14', sort: 3 },
  { value: 'block', label: '阻塞', color: '#722ed1', sort: 4 },
] as const;

/** value -> 状态项. 给按 value 查 label/color 场景用. */
export const BUILTIN_CASE_STATUS_MAP: Readonly<Record<string, CaseStatusItem>> =
  Object.freeze(
    BUILTIN_CASE_STATUS.reduce<Record<string, CaseStatusItem>>((acc, item) => {
      acc[item.value] = item;
      return acc;
    }, {}),
  );

/** value 是否在硬编码枚举内. 入参校验 / DB 旧数据迁移判定. */
export const isValidCaseStatus = (value: string): boolean =>
  value in BUILTIN_CASE_STATUS_MAP;

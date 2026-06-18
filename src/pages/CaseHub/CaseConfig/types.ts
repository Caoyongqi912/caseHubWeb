/**
 * @file src/pages/CaseHub/CaseConfig/types.ts
 * @description 用例配置相关类型定义
 * 通过 config_key 字段在同一张表中区分不同枚举类型，支持扩展
 */

/**
 * 用例配置项（用于状态、评审状态等枚举）
 * label + value 构成下拉项主体，color / description / sort 为辅助属性
 */
export interface ICaseEnumConfig {
  id: number;
  uid: string;
  /** 枚举类型标识，如 CASE_STATUS / REVIEW_STATUS */
  config_key: string;
  /** 显示名称 */
  label: string;
  /**
   * 枚举值
   * 保留 string 兼容后续需要字符串键的场景
   */
  value: string;
  /** 主题色（用于 Tag / 状态点等展示），遵循 antd 预设或自定义 hex */
  color?: string;
  /** 描述说明，悬停 / 详情中展示 */
  description?: string;
  /** 排序字段，升序 */
  sort?: number;
  /** 是否启用，禁用后不参与下拉与状态流转 */
  enabled?: boolean;
  creator?: number;
  creatorName?: string;
  updater?: number;
  updaterName?: string;
  create_time?: string;
  update_time?: string;
}

/**
 * 已支持的配置枚举 key
 * 后续新增配置只需在此追加并配合 CASE_CONFIG_CATEGORIES 添加 Tab
 */
export enum CaseConfigKeyEnum {
  /**
   * 注: 用例执行状态 (CASE_STATUS) 已 hardcode 在后端 (app/constant/caseStatus.py),
   * 不再走配置中心, 不在配置中心 Tab 出现. 字符串字面量 'CASE_STATUS' 仍可用于
   * useCaseEnumConfig 等只读消费场景 (后端短路返回 hardcode), 这里不再列枚举项.
   */
  /** 评审状态 */
  REVIEW_STATUS = 'REVIEW_STATUS',
  /** 用例等级（如 P0 / P1 / P2） */
  CASE_LEVEL = 'CASE_LEVEL',
  /** 用例类型（如 回归 / 冒烟 / 功能等） */
  CASE_TYPE = 'CASE_TYPE',
  /** 测试计划状态（如 进行中 / 已完成 / 已暂停 / 已取消 等，可由用户在配置中心自定义） */
  PLAN_STATUS = 'PLAN_STATUS',
  /** 测试计划执行阶段（如 规划 / 设计 / 执行 / 验收 等，可由用户在配置中心自定义） */
  PLAN_PHASE = 'PLAN_PHASE',
  /** 用例适用端（如 PC / H5 / Android / iOS / 小程序 等，可由用户在配置中心自定义） */
  PLATFORM = 'PLATFORM',
}

/**
 * 计划目录模板节点
 * 与 IPlanModule 字段保持一致，仅去除 plan_id、case_nums 等运行时字段
 * 用于在配置中心维护一个全局的「默认目录结构模板」，
 * 新建测试计划时会把这份树形结构复制为计划的初始目录
 */
export interface IPlanModuleTemplate {
  id: number;
  uid?: string;
  /** 父级目录 id，根节点为 null */
  parent_id?: number | null;
  /** 目录名称 */
  title: string;
  /** 同级排序，升序 */
  order: number;
  /** 子节点 */
  children?: IPlanModuleTemplate[];
}

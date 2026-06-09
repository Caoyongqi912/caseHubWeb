/**
 * @file src/pages/CaseHub/CaseConfig/constants.ts
 * @description 用例配置中心 - 配置分类注册表
 * 新增配置分类时，在此追加即可，主页面会自动渲染对应 Tab
 */

import { CaseConfigKeyEnum } from './types';

export interface ICaseConfigCategory {
  /** 唯一 key，对应 ICaseEnumConfig.config_key */
  key: CaseConfigKeyEnum | string;
  /** Tab 标题 */
  label: string;
  /** Tab 副标题 / 描述（用于顶部信息条） */
  description: string;
  /** Tab 图标（antd icon name） */
  icon: string;
}

/**
 * 配置中心支持的枚举分类清单
 * 顺序即 Tab 展示顺序
 */
export const CASE_CONFIG_CATEGORIES: ICaseConfigCategory[] = [
  {
    key: CaseConfigKeyEnum.CASE_STATUS,
    label: '用例状态',
    description:
      '配置测试用例执行状态枚举。用于测试计划用例状态展示、筛选、批量操作及运行结果汇总。',
    icon: 'ExperimentOutlined',
  },
  {
    key: CaseConfigKeyEnum.REVIEW_STATUS,
    label: '评审状态',
    description: '配置测试用例评审状态枚举，控制用例评审流程中的可用状态。',
    icon: 'AuditOutlined',
  },
  {
    key: CaseConfigKeyEnum.CASE_LEVEL,
    label: '用例等级',
    description:
      '配置测试用例等级枚举（典型如 P0 / P1 / P2）。等级同时作为枚举的 value 与 label，便于用例库与计划模块按等级筛选、汇总。',
    icon: 'TrophyOutlined',
  },
  {
    key: CaseConfigKeyEnum.CASE_TYPE,
    label: '用例类型',
    description:
      '配置测试用例类型枚举（如 回归 / 冒烟 / 功能 / 性能 等），用于用例库分类、计划编排与多维筛选。',
    icon: 'TagsOutlined',
  },
  {
    key: CaseConfigKeyEnum.PLAN_STATUS,
    label: '计划状态',
    description:
      '配置测试计划状态枚举（如 进行中 / 已完成 / 已暂停 / 已取消 等），用于测试计划列表的状态展示、印章着色、快捷过滤及统计分组。',
    icon: 'FlagOutlined',
  },
  {
    key: CaseConfigKeyEnum.PLAN_PHASE,
    label: '计划阶段',
    description:
      '配置测试计划执行阶段枚举（如 规划 / 设计 / 执行 / 验收 等），用于测试计划列表的阶段展示、阶段色点着色及搜索筛选。',
    icon: 'RocketOutlined',
  },
];

/**
 * 根据 config_key 查找分类元信息
 */
export const findCaseConfigCategory = (
  key: string,
): ICaseConfigCategory | undefined =>
  CASE_CONFIG_CATEGORIES.find((item) => item.key === key);

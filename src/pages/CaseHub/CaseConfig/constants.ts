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
  /** 是否为预留 / 即将上线的占位项，true 时禁用交互 */
  comingSoon?: boolean;
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
];

/**
 * 根据 config_key 查找分类元信息
 */
export const findCaseConfigCategory = (
  key: string,
): ICaseConfigCategory | undefined =>
  CASE_CONFIG_CATEGORIES.find((item) => item.key === key);

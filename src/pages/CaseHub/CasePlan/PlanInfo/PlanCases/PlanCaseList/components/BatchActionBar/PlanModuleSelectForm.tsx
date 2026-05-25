import { useCaseHubTheme } from '@/pages/CaseHub/styles';
import { FC } from 'react';
import ModuleTreeSelect from './ModuleTreeSelect';
import PlanSelect from './PlanSelect';

/**
 * 公共的测试计划和目录选择表单组件
 * 用于批量移动、复制等弹窗中的通用选择逻辑
 */
interface PlanModuleSelectFormProps {
  /** 当前计划ID（用于排除自身） */
  excludePlanId?: number;
  /** 选中的计划ID */
  planId?: number;
  /** 选中的目录ID */
  moduleId?: number;
  /** 计划选择变化回调 */
  onPlanChange: (planId: number | undefined) => void;
  /** 目录选择变化回调 */
  onModuleChange: (moduleId: number | undefined) => void;
  /** 是否显示评审状态选择（仅复制弹窗需要） */
  showReviewStatus?: boolean;
  /** 评审状态值 */
  reviewStatus?: number;
  /** 评审状态变化回调 */
  onReviewStatusChange?: (status: number) => void;
}

const PlanModuleSelectForm: FC<PlanModuleSelectFormProps> = ({
  excludePlanId,
  planId,
  moduleId,
  onPlanChange,
  onModuleChange,
}) => {
  const { colors, spacing, token } = useCaseHubTheme();

  const labelStyle = {
    display: 'block',
    marginBottom: spacing.xs,
    color: colors.text,
    fontSize: token.fontSize,
  };

  return (
    <>
      <div style={{ marginBottom: spacing.md }}>
        <label style={labelStyle}>目标测试计划</label>
        <PlanSelect
          value={planId}
          onChange={onPlanChange}
          excludePlanId={excludePlanId}
          placeholder="搜索测试计划..."
        />
      </div>

      <div>
        <label style={labelStyle}>目标目录</label>
        <ModuleTreeSelect
          planId={planId}
          value={moduleId}
          onChange={onModuleChange}
        />
      </div>
    </>
  );
};

export default PlanModuleSelectForm;
export type { PlanModuleSelectFormProps };

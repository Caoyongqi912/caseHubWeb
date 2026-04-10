import { getConditionContentInfo } from '@/api/inter/interCase';
import Handler from '@/components/DnDDraggable/handler';
import CardExtraOption from '@/pages/Httpx/InterfaceApiCase/InterfaceApiCaseDetail/contents/CardExtraOption';
import ApiCondition from '@/pages/Httpx/InterfaceApiCase/InterfaceApiCaseDetail/contents/ConditionProCard/ApiCondition';
import { IInterfaceCaseContent } from '@/pages/Httpx/types';
import { BranchesOutlined } from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import { Space, Tag, theme, Typography } from 'antd';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';

const { Text } = Typography;
const { useToken } = theme;

const OperatorOption: { [key: number]: string } = {
  0: '等于',
  1: '不等于',
  2: '大于',
  3: '小于',
  4: '大于等于',
  5: '小于等于',
  6: '包含',
  7: '不包含',
};

interface Props {
  id: number;
  step: number;
  caseId: number;
  caseContent: IInterfaceCaseContent;
  projectId?: number;
  callback?: () => void;
}

/**
 * 条件卡片组件
 * 用于显示条件判断步骤，支持条件配置和条件接口列表
 */
const Index: FC<Props> = (props) => {
  const { token } = useToken();
  const { step, id, projectId, caseId, caseContent, callback } = props;
  const [showOption, setShowOption] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [conditionKey, setConditionKey] = useState<string>();
  const [conditionValue, setConditionValue] = useState<string>();
  const [conditionOperatorLabel, setConditionOperatorLabel] =
    useState<string>();
  const [conditionOperatorValue, setConditionOperatorValue] =
    useState<number>();

  /**
   * 加载条件基本信息
   * @description 卡片渲染时立即请求，获取条件信息用于标题展示
   */
  useEffect(() => {
    if (!caseContent.target_id) return;

    getConditionContentInfo(caseContent.target_id).then(({ code, data }) => {
      if (code === 0 && data) {
        setConditionKey(data.condition_key);
        setConditionValue(data.condition_value);
        setConditionOperatorLabel(OperatorOption[data.condition_operator]);
        setConditionOperatorValue(data.condition_operator);
      }
    });
  }, [caseContent.target_id]);

  /**
   * 鼠标进入事件处理
   * @description 显示额外操作选项
   */
  const handleMouseEnter = useCallback(() => {
    setShowOption(true);
  }, []);

  /**
   * 鼠标离开事件处理
   * @description 隐藏额外操作选项
   */
  const handleMouseLeave = useCallback(() => {
    setShowOption(false);
  }, []);

  /**
   * 展开/折叠处理
   * @description 监听卡片折叠状态变化
   */
  const handleCollapse = useCallback((collapsed: boolean) => {
    setIsCollapsed(collapsed);
  }, []);

  /**
   * 刷新条件信息
   * @description 重新获取条件信息并更新标题显示
   */
  const refreshConditionInfo = useCallback(() => {
    if (!caseContent.target_id) return;
    getConditionContentInfo(caseContent.target_id).then(({ code, data }) => {
      if (code === 0 && data) {
        setConditionKey(data.condition_key);
        setConditionValue(data.condition_value);
        setConditionOperatorLabel(OperatorOption[data.condition_operator]);
        setConditionOperatorValue(data.condition_operator);
      }
    });
  }, [caseContent.target_id]);

  /**
   * 条件卡片标题渲染
   * @description 展示条件的变量、操作符和比较值
   */
  const conditionTitle = useMemo(
    () => (
      <Space size={10} align="center">
        <Handler id={id} step={step} />
        <Tag
          icon={<BranchesOutlined />}
          style={{
            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            color: '#fff',
            border: 'none',
            fontWeight: 600,
            fontSize: '12px',
            padding: '4px 10px',
            borderRadius: '6px',
            boxShadow: '0 2px 8px rgba(139, 92, 246, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          IF 条件
        </Tag>
        {conditionKey && (
          <Text
            style={{
              fontSize: '14px',
              color: '#8b5cf6',
              fontWeight: 600,
              background: 'rgba(139, 92, 246, 0.1)',
              padding: '2px 8px',
              borderRadius: '4px',
              border: '1px solid rgba(139, 92, 246, 0.2)',
            }}
          >
            {conditionKey}
          </Text>
        )}
        {conditionOperatorLabel && (
          <Text strong style={{ fontSize: '14px', color: token.colorText }}>
            {conditionOperatorLabel}
          </Text>
        )}
        {conditionValue && (
          <Text
            style={{
              fontSize: '14px',
              color: '#8b5cf6',
              fontWeight: 600,
              background: 'rgba(139, 92, 246, 0.1)',
              padding: '2px 8px',
              borderRadius: '4px',
              border: '1px solid rgba(139, 92, 246, 0.2)',
            }}
          >
            {conditionValue}
          </Text>
        )}
      </Space>
    ),
    [id, step, conditionKey, conditionOperatorLabel, conditionValue, token],
  );

  return (
    <ProCard
      bordered
      collapsible
      hoverable
      bodyStyle={{ padding: 0 }}
      defaultCollapsed
      style={{
        borderRadius: '16px',
        boxShadow: showOption
          ? `0 8px 32px rgba(139, 92, 246, 0.15), 0 2px 8px rgba(0, 0, 0, 0.08)`
          : `0 2px 12px rgba(0, 0, 0, 0.06)`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        border: showOption
          ? `1px solid rgba(139, 92, 246, 0.3)`
          : `1px solid ${token.colorBorderSecondary}`,
        overflow: 'hidden',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      extra={
        <CardExtraOption
          show={showOption}
          callback={callback}
          caseContent={caseContent}
          caseId={caseId}
        />
      }
      onCollapse={handleCollapse}
      collapsibleIconRender={() => conditionTitle}
    >
      {!isCollapsed && (
        <ApiCondition
          case_id={caseId}
          projectId={projectId}
          caseContent={caseContent}
          initialConditionData={{
            condition_key: conditionKey,
            condition_value: conditionValue,
            condition_operator: conditionOperatorValue,
          }}
          onConditionChange={refreshConditionInfo}
        />
      )}
    </ProCard>
  );
};

export default Index;

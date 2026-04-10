import Handler from '@/components/DnDDraggable/handler';
import GroupInterfaceTable from '@/pages/Httpx/Interface/interfaceApiGroup/GroupInterfaceTable';
import CardExtraOption from '@/pages/Httpx/InterfaceApiCase/InterfaceApiCaseDetail/contents/CardExtraOption';
import { IInterfaceCaseContent } from '@/pages/Httpx/types';
import { GroupOutlined } from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import { Space, Tag, theme, Typography } from 'antd';
import { FC, useCallback, useMemo, useState } from 'react';

const { Text } = Typography;
const { useToken } = theme;

interface Props {
  id: number;
  step: number;
  caseId: number;
  caseContent: IInterfaceCaseContent;
  callback?: () => void;
}

/**
 * 接口组卡片组件
 * 用于显示和管理接口组步骤内容，支持组内接口列表展示
 */
const GroupProCard: FC<Props> = (props) => {
  const { token } = useToken();
  const { step, id, caseId, caseContent, callback } = props;
  const [showOption, setShowOption] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);

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
   * 接口组卡片标题渲染
   * @description 展示组的序号、名称和描述信息
   */
  const groupTitle = useMemo(
    () => (
      <Space size={10} align="center">
        <Handler id={id} step={step} />
        <Tag
          icon={<GroupOutlined />}
          style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            color: '#fff',
            border: 'none',
            fontWeight: 600,
            fontSize: '12px',
            padding: '4px 10px',
            borderRadius: '6px',
            boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          组 x {caseContent.group_interface_num}
        </Tag>
        {caseContent.content_name && (
          <Text
            strong
            style={{
              fontSize: '15px',
              color: token.colorText,
              letterSpacing: '0.5px',
            }}
          >
            {caseContent.content_name}
          </Text>
        )}
      </Space>
    ),
    [id, step, caseContent, token],
  );

  return (
    <ProCard
      bordered
      collapsible
      hoverable
      defaultCollapsed
      bodyStyle={{ padding: 0 }}
      style={{
        borderRadius: '16px',
        boxShadow: showOption
          ? `0 8px 32px rgba(59, 130, 246, 0.15), 0 2px 8px rgba(0, 0, 0, 0.08)`
          : `0 2px 12px rgba(0, 0, 0, 0.06)`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        border: showOption
          ? `1px solid rgba(59, 130, 246, 0.3)`
          : `1px solid ${token.colorBorderSecondary}`,
        overflow: 'hidden',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onCollapse={handleCollapse}
      extra={
        <CardExtraOption
          show={showOption}
          callback={callback}
          caseContent={caseContent}
          caseId={caseId}
        />
      }
      collapsibleIconRender={() => groupTitle}
    >
      {!isCollapsed && <GroupInterfaceTable groupId={caseContent.target_id} />}
    </ProCard>
  );
};

export default GroupProCard;

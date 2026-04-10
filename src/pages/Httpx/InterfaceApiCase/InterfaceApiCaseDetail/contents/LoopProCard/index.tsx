import { updateCaseContent } from '@/api/inter/interCase';
import Handler from '@/components/DnDDraggable/handler';
import CardExtraOption from '@/pages/Httpx/InterfaceApiCase/InterfaceApiCaseDetail/contents/CardExtraOption';
import LoopSteps from '@/pages/Httpx/InterfaceApiCase/InterfaceApiCaseDetail/contents/LoopProCard/LoopSteps';
import { IInterfaceCaseContent } from '@/pages/Httpx/types';
import { EditOutlined, RetweetOutlined } from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import { Input, Space, Tag, theme, Typography } from 'antd';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';

const { Text } = Typography;
const { useToken } = theme;

interface Props {
  id: number;
  step: number;
  caseId: number;
  caseContent: IInterfaceCaseContent;
  projectId?: number;
  callback?: () => void;
}

/**
 * 循环步骤卡片组件
 * 展示循环步骤的整体信息和折叠内容
 */
const Index: FC<Props> = (props) => {
  const { token } = useToken();
  const { id, step, caseId, caseContent, projectId, callback } = props;
  const [showOption, setShowOption] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [contentLoopName, setContentLoopName] = useState<string>();
  const [showLoopTitleInput, setShowLoopTitleInput] = useState(true);
  const [showEditIcon, setShowEditIcon] = useState(false);

  /**
   * 监听 caseContent 变化，初始化内容名称
   * @description 当 caseContent 的 content_name 存在时，设置显示文本模式
   */
  useEffect(() => {
    const { content_name } = caseContent;
    if (content_name) {
      setContentLoopName(content_name);
      setShowLoopTitleInput(false);
    }
  }, [caseContent]);

  /**
   * 鼠标进入事件处理
   * @description 鼠标进入卡片时显示额外操作选项和编辑图标
   */
  const handleMouseEnter = useCallback(() => {
    setShowOption(true);
    setShowEditIcon(true);
  }, []);

  /**
   * 鼠标离开事件处理
   * @description 鼠标离开卡片时隐藏额外操作选项和编辑图标
   */
  const handleMouseLeave = useCallback(() => {
    setShowOption(false);
    setShowEditIcon(false);
  }, []);

  /**
   * 展开/折叠处理
   * @description ProCard展开时设置isExpanded标识，用于控制子组件的数据加载
   * @param collapsed - 当前折叠状态，false表示展开
   */
  const handleCollapse = useCallback((collapsed: boolean) => {
    setIsExpanded(!collapsed);
  }, []);

  /**
   * 更新内容标题
   * @description 保存编辑后的内容标题到服务端
   * @param value - 新的标题内容
   */
  const updateContentTitle = useCallback(
    async (value: string | undefined) => {
      if (value) {
        const { code, data } = await updateCaseContent({
          content_id: caseContent.id,
          content_name: value,
        });
        if (code === 0) {
          setContentLoopName(data.content_name);
          setShowLoopTitleInput(false);
        }
      } else {
        setShowLoopTitleInput(true);
      }
    },
    [caseContent.id],
  );

  /**
   * 循环卡片标题输入组件
   * @description 根据状态渲染文本或输入框，支持点击编辑图标进入编辑模式
   */
  const LoopTitleInput = useMemo(() => {
    if (contentLoopName && !showLoopTitleInput) {
      return (
        <Space size={8} align="center">
          <Text
            strong
            style={{
              fontSize: '15px',
              color: token.colorText,
              letterSpacing: '0.5px',
            }}
          >
            {contentLoopName}
          </Text>
          {showEditIcon && (
            <EditOutlined
              style={{
                color: '#ca8a04',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'all 0.2s ease',
                padding: '4px',
                borderRadius: '4px',
              }}
              onClick={(event) => {
                event.stopPropagation();
                setShowLoopTitleInput(true);
              }}
            />
          )}
        </Space>
      );
    }
    return (
      <Input
        style={{
          width: '100%',
          maxWidth: '280px',
          borderRadius: '6px',
        }}
        variant="borderless"
        placeholder="输入循环名称..."
        onChange={(e) => {
          e.stopPropagation();
          if (e.target.value) setContentLoopName(e.target.value);
        }}
        onClick={(e) => e.stopPropagation()}
        onBlur={() => updateContentTitle(contentLoopName)}
        onPressEnter={() => updateContentTitle(contentLoopName)}
      />
    );
  }, [
    contentLoopName,
    showLoopTitleInput,
    showEditIcon,
    token,
    updateContentTitle,
  ]);

  /**
   * 循环卡片标题渲染
   * @description 渲染带有循环标签和步骤信息的卡片标题
   */
  const loopTitle = useMemo(
    () => (
      <Space size={10} align="center">
        <Handler id={id} step={step} />
        <Tag
          icon={<RetweetOutlined />}
          style={{
            background: 'linear-gradient(135deg, #ca8a04 0%, #a16207 100%)',
            color: '#fff',
            border: 'none',
            fontWeight: 600,
            fontSize: '12px',
            padding: '4px 10px',
            borderRadius: '6px',
            boxShadow: '0 2px 8px rgba(202, 138, 4, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          Loop
        </Tag>
        {LoopTitleInput}
      </Space>
    ),
    [id, step, token, LoopTitleInput],
  );

  return (
    <ProCard
      bordered
      collapsible
      hoverable
      bodyStyle={{ padding: 0 }}
      defaultCollapsed
      onCollapse={handleCollapse}
      style={{
        borderRadius: '16px',
        boxShadow: showOption
          ? `0 8px 32px rgba(202, 138, 4, 0.15), 0 2px 8px rgba(0, 0, 0, 0.08)`
          : `0 2px 12px rgba(0, 0, 0, 0.06)`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        border: showOption
          ? `1px solid rgba(202, 138, 4, 0.3)`
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
      collapsibleIconRender={() => loopTitle}
    >
      <LoopSteps
        case_id={caseId}
        caseContent={caseContent}
        callback={callback}
        projectId={projectId}
        isExpanded={isExpanded}
      />
    </ProCard>
  );
};

export default Index;

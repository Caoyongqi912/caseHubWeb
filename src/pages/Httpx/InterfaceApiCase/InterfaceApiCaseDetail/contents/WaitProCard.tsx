import { updateCaseContent } from '@/api/inter/interCase';
import Handler from '@/components/DnDDraggable/handler';
import CardExtraOption from '@/pages/Httpx/InterfaceApiCase/InterfaceApiCaseDetail/contents/CardExtraOption';
import { TagConfig } from '@/pages/Httpx/InterfaceApiCase/InterfaceApiCaseDetail/contents/tagConfig';
import { IInterfaceCaseContent } from '@/pages/Httpx/types';
import { ClockCircleOutlined, EditOutlined } from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import { InputNumber, Space, Tag, theme, Typography } from 'antd';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';

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
 * 等待步骤卡片组件
 * 用于显示和管理等待步骤内容，支持设置等待时间
 */
const WaitProCard: FC<Props> = (props) => {
  const { id, step, caseId, caseContent, callback } = props;
  const { token } = useToken();

  const [waitTime, setWaitTime] = useState<number>();
  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  /**
   * 监听 caseContent.wait_time 变化，初始化等待时间
   * @description 当 wait_time 存在时，设置等待时间值并退出编辑模式
   */
  useEffect(() => {
    const hasWaitTime =
      caseContent.wait_time !== undefined && caseContent.wait_time !== null;
    if (hasWaitTime) {
      setWaitTime(caseContent.wait_time);
      setIsEditing(false);
    }
  }, [caseContent.wait_time]);

  /**
   * 更新等待时间到服务端
   * @description 保存编辑后的等待时间
   * @param value - 等待时间值
   */
  const updateWaitTime = useCallback(
    async (value: number | null) => {
      if (value === null || value === undefined) {
        setIsEditing(true);
        return;
      }

      const { code, data } = await updateCaseContent({
        content_id: caseContent.id,
        wait_time: value,
      });

      if (code === 0) {
        setWaitTime(data?.wait_time ?? value);
        setIsEditing(false);
      }
    },
    [caseContent.id],
  );

  /**
   * 输入值变化处理
   * @description 更新本地等待时间状态
   * @param value - 新的等待时间值
   */
  const handleInputChange = useCallback((value: number | null) => {
    setWaitTime(value ?? undefined);
  }, []);

  /**
   * 输入框失焦处理
   * @description 触发保存等待时间
   */
  const handleInputBlur = useCallback(() => {
    updateWaitTime(waitTime ?? null);
  }, [waitTime, updateWaitTime]);

  /**
   * 回车键处理
   * @description 触发保存等待时间
   */
  const handleInputPressEnter = useCallback(() => {
    updateWaitTime(waitTime ?? null);
  }, [waitTime, updateWaitTime]);

  /**
   * 等待时间显示组件
   * @description 根据编辑状态渲染文本或输入框
   */
  const waitDisplay = useMemo(() => {
    if (!isEditing && waitTime !== undefined && waitTime !== null) {
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
            {waitTime}
            <Text type="warning" style={{ marginLeft: 4, fontSize: '13px' }}>
              s
            </Text>
          </Text>
          {isHovered && (
            <EditOutlined
              style={{
                color: TagConfig.WAIT.color,
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'all 0.2s ease',
                padding: '4px',
                borderRadius: '4px',
              }}
              onClick={() => setIsEditing(true)}
            />
          )}
        </Space>
      );
    }

    return (
      <InputNumber
        style={{ width: '100%', maxWidth: 150, borderRadius: '6px' }}
        value={waitTime}
        min={0}
        max={10}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        onPressEnter={handleInputPressEnter}
        suffix="s"
      />
    );
  }, [
    isEditing,
    isHovered,
    waitTime,
    token,
    handleInputChange,
    handleInputBlur,
    handleInputPressEnter,
  ]);

  /**
   * 卡片标题渲染
   * @description 渲染带有等待标签和步骤信息的卡片标题
   */
  const cardTitle = useMemo(
    () => (
      <Space size={10} align="center">
        <Handler id={id} step={step} />
        <Tag
          icon={<ClockCircleOutlined />}
          style={{
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            color: '#fff',
            border: 'none',
            fontWeight: 600,
            fontSize: '12px',
            padding: '4px 10px',
            borderRadius: '6px',
            boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          等待
        </Tag>
        {waitDisplay}
      </Space>
    ),
    [id, step, waitDisplay],
  );

  return (
    <ProCard
      bordered
      hoverable
      collapsible={false}
      defaultCollapsed
      bodyStyle={{ padding: 0 }}
      style={{
        borderRadius: '16px',
        boxShadow: isHovered
          ? `0 8px 32px rgba(245, 158, 11, 0.15), 0 2px 8px rgba(0, 0, 0, 0.08)`
          : `0 2px 12px rgba(0, 0, 0, 0.06)`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        border: isHovered
          ? `1px solid rgba(245, 158, 11, 0.3)`
          : `1px solid ${token.colorBorderSecondary}`,
        overflow: 'hidden',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      extra={
        <CardExtraOption
          show={isHovered}
          callback={callback}
          caseContent={caseContent}
          caseId={caseId}
        />
      }
      title={cardTitle}
    />
  );
};

export default WaitProCard;

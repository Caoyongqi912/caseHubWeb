import Handler from '@/components/DnDDraggable/handler';
import MyDrawer from '@/components/MyDrawer';
import InterfaceApiDetail from '@/pages/Httpx/Interface/InterfaceApiDetail';
import CardExtraOption from '@/pages/Httpx/InterfaceApiCase/InterfaceApiCaseDetail/contents/CardExtraOption';
import {
  HttpMethod,
  TagConfig,
} from '@/pages/Httpx/InterfaceApiCase/InterfaceApiCaseDetail/contents/tagConfig';
import { IInterfaceCaseContent } from '@/pages/Httpx/types';
import { ApiOutlined } from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import { Space, Tag, theme, Typography } from 'antd';
import { FC, useEffect, useMemo, useState } from 'react';

const { Text } = Typography;
const { useToken } = theme;

interface Props {
  id: number;
  step: number;
  caseId: number;
  caseContent: IInterfaceCaseContent;
  callback?: () => void;
  open?: boolean;
}

/**
 * API 卡片组件
 * 用于显示和管理接口步骤内容，支持点击展开接口详情
 */
const ApiProCard: FC<Props> = (props) => {
  const { open = false, step, caseId, id, caseContent, callback } = props;
  const { token } = useToken();
  const [showAPIDetail, setShowAPIDetail] = useState(false);
  const [showOption, setShowOption] = useState(false);

  /**
   * 监听 open 属性变化
   * @description 当 open 属性变化时，同步 showAPIDetail 状态
   */
  useEffect(() => {
    if (open) {
      setShowAPIDetail(open);
    }
  }, [open]);

  /**
   * 关闭详情回调
   * @description 关闭详情抽屉并触发外部回调
   */
  const selfCallback = () => {
    setShowAPIDetail(false);
    callback?.();
  };

  /**
   * HTTP 方法配置
   * @description 根据接口的 HTTP 方法获取对应的 Tag 样式配置
   */
  const methodConfig = useMemo(() => {
    const method = (caseContent.content_desc?.toUpperCase() ||
      'GET') as HttpMethod;
    return TagConfig.API[method] || TagConfig.API.GET;
  }, [caseContent.content_desc]);

  /**
   * 可见性配置
   * @description 根据接口的 is_common_api 属性获取公共/私有标签配置
   */
  const visibilityConfig = useMemo(() => {
    return caseContent.is_common_api === 1
      ? TagConfig.VISIBILITY.PUBLIC
      : TagConfig.VISIBILITY.PRIVATE;
  }, [caseContent.is_common_api]);

  /**
   * 可见性图标组件
   * @description 根据可见性配置获取对应的图标
   */
  const VisibilityIcon = useMemo(() => {
    return visibilityConfig.icon;
  }, [visibilityConfig]);

  /**
   * 卡片标题渲染
   * @description 渲染带有 HTTP 方法、可见性和接口名称的卡片标题
   */
  const cardTitle = useMemo(
    () => (
      <Space size={10} align="center">
        <Handler id={id} step={step} />
        <Tag
          icon={<ApiOutlined />}
          style={{
            background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
            color: '#fff',
            border: 'none',
            fontWeight: 600,
            fontSize: '12px',
            padding: '4px 10px',
            borderRadius: '6px',
            boxShadow: '0 2px 8px rgba(6, 182, 212, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          {methodConfig.label}
        </Tag>
        <Tag
          icon={<VisibilityIcon />}
          style={{
            background: visibilityConfig.bgColor,
            color: visibilityConfig.color,
            border: `1px solid ${visibilityConfig.borderColor}`,
            fontWeight: 500,
            fontSize: '12px',
            padding: '2px 8px',
            borderRadius: '6px',
          }}
        >
          {visibilityConfig.label}
        </Tag>
        <Text
          strong
          style={{
            fontSize: '15px',
            color: token.colorText,
            maxWidth: '400px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            letterSpacing: '0.5px',
          }}
        >
          {caseContent.content_name}
        </Text>
      </Space>
    ),
    [
      id,
      step,
      caseContent,
      methodConfig,
      visibilityConfig,
      VisibilityIcon,
      token,
    ],
  );

  return (
    <>
      <MyDrawer
        name={caseContent.content_name}
        width={'75%'}
        open={showAPIDetail}
        setOpen={setShowAPIDetail}
      >
        <InterfaceApiDetail
          interfaceId={caseContent.target_id}
          callback={selfCallback}
        />
      </MyDrawer>
      <ProCard
        bordered
        collapsible={false}
        hoverable
        defaultCollapsed
        style={{
          borderRadius: '16px',
          boxShadow: showOption
            ? `0 8px 32px rgba(6, 182, 212, 0.15), 0 2px 8px rgba(0, 0, 0, 0.08)`
            : `0 2px 12px rgba(0, 0, 0, 0.06)`,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
          border: showOption
            ? `1px solid rgba(6, 182, 212, 0.3)`
            : `1px solid ${token.colorBorderSecondary}`,
          overflow: 'hidden',
        }}
        bodyStyle={{ padding: 0 }}
        onMouseEnter={() => setShowOption(true)}
        onMouseLeave={() => setShowOption(false)}
        title={cardTitle}
        collapsibleIconRender={() => null}
        extra={
          <CardExtraOption
            show={showOption}
            callback={selfCallback}
            caseContent={caseContent}
            caseId={caseId}
          />
        }
        onClick={(event) => {
          event.stopPropagation();
          setShowAPIDetail(true);
        }}
      />
    </>
  );
};

export default ApiProCard;

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

const ApiProCard: FC<Props> = (props) => {
  const { open = false, step, caseId, id, caseContent, callback } = props;
  const { token } = useToken();
  const [showAPIDetail, setShowAPIDetail] = useState(false);
  const [showOption, setShowOption] = useState(false);

  useEffect(() => {
    if (open) {
      setShowAPIDetail(open);
    }
  }, [open]);

  const selfCallback = () => {
    setShowAPIDetail(false);
    callback && callback();
  };

  const methodConfig = useMemo(() => {
    const method = (caseContent.content_desc?.toUpperCase() ||
      'GET') as HttpMethod;
    return TagConfig.API[method] || TagConfig.API.GET;
  }, [caseContent.content_desc]);

  const visibilityConfig = useMemo(() => {
    return caseContent.is_common_api === 1
      ? TagConfig.VISIBILITY.PUBLIC
      : TagConfig.VISIBILITY.PRIVATE;
  }, [caseContent.is_common_api]);

  const VisibilityIcon = useMemo(() => {
    return visibilityConfig.icon;
  }, [visibilityConfig]);

  const cardTitle = useMemo(
    () => (
      <Space size={8} align="center">
        <Handler id={id} step={step} />
        <Tag
          icon={<ApiOutlined />}
          style={{
            background: methodConfig.bgColor,
            color: methodConfig.color,
            border: `1px solid ${methodConfig.borderColor}`,
            fontWeight: 600,
            fontSize: '12px',
            padding: '2px 8px',
            borderRadius: token.borderRadiusSM,
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
            borderRadius: token.borderRadiusSM,
          }}
        >
          {visibilityConfig.label}
        </Tag>
        <Text
          strong
          style={{
            fontSize: '14px',
            color: token.colorText,
            maxWidth: '400px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
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
          borderRadius: token.borderRadiusLG,
          boxShadow: showOption
            ? `0 4px 12px ${token.colorPrimaryBg}`
            : `0 1px 3px ${token.colorBgLayout}`,
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          borderColor: showOption
            ? token.colorPrimaryBorder
            : token.colorBorder,
        }}
        bodyStyle={{
          padding: 0,
        }}
        onMouseEnter={() => {
          setShowOption(true);
        }}
        onMouseLeave={() => {
          setShowOption(false);
        }}
        title={cardTitle}
        collapsibleIconRender={() => {
          return null;
        }}
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

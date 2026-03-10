import Handler from '@/components/DnDDraggable/handler';
import GroupInterfaceTable from '@/pages/Httpx/Interface/interfaceApiGroup/GroupInterfaceTable';
import CardExtraOption from '@/pages/Httpx/InterfaceApiCase/InterfaceApiCaseDetail/contents/CardExtraOption';
import { IInterfaceCaseContent } from '@/pages/Httpx/types';
import { GroupOutlined } from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import { Space, Tag, theme, Typography } from 'antd';
import { FC, useMemo, useState } from 'react';

const { Text } = Typography;
const { useToken } = theme;

interface Props {
  id: number;
  step: number;
  caseId: number;
  caseContent: IInterfaceCaseContent;
  callback?: () => void;
}

const GroupProCard: FC<Props> = (props) => {
  const { token } = useToken();
  const { step, id, caseId, caseContent, callback } = props;
  const [showOption, setShowOption] = useState(false);

  const groupTitle = useMemo(
    () => (
      <Space size={8} align="center">
        <Handler id={id} step={step} />
        <Tag
          icon={<GroupOutlined />}
          style={{
            background: '#e0f2fe',
            color: '#3b82f6',
            border: '1px solid #3b82f620',
            fontWeight: 600,
            fontSize: '12px',
            padding: '2px 8px',
            borderRadius: token.borderRadiusSM,
          }}
        >
          分组
        </Tag>
        {caseContent.content_name && (
          <Text
            strong
            style={{
              fontSize: '14px',
              color: token.colorText,
            }}
          >
            {caseContent.content_name}
          </Text>
        )}
        {caseContent.content_desc && (
          <Text type={'secondary'} style={{ fontSize: '12px' }}>
            {caseContent.content_desc}
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
      style={{
        borderRadius: token.borderRadiusLG,
        boxShadow: showOption
          ? `0 4px 12px ${token.colorPrimaryBg}`
          : `0 1px 3px ${token.colorBgLayout}`,
        transition: 'all 0.3s ease',
        borderColor: showOption ? token.colorPrimaryBorder : token.colorBorder,
      }}
      bodyStyle={{ padding: 0 }}
      onMouseEnter={() => {
        setShowOption(true);
      }}
      onMouseLeave={() => {
        setShowOption(false);
      }}
      extra={
        <CardExtraOption
          show={showOption}
          callback={callback}
          caseContent={caseContent}
          caseId={caseId}
        />
      }
      collapsibleIconRender={({}) => {
        return groupTitle;
      }}
    >
      <GroupInterfaceTable groupId={caseContent.target_id} />
    </ProCard>
  );
};

export default GroupProCard;

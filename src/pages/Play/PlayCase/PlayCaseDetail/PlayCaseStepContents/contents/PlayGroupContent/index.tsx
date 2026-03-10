import Handler from '@/components/DnDDraggable/handler';
import { IPlayStepContent } from '@/pages/Play/componets/uiTypes';
import ContentExtra from '@/pages/Play/PlayCase/PlayCaseDetail/PlayCaseStepContents/contentExtra';
import GroupTable from '@/pages/Play/PlayCase/PlayCaseDetail/PlayCaseStepContents/contents/PlayGroupContent/GroupTable';
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
  stepContent: IPlayStepContent;
  callback: () => void;
}

const Index: FC<Props> = (props) => {
  const { token } = useToken();
  const { id, step, caseId, stepContent, callback } = props;
  const [showOption, setShowOption] = useState(false);
  const [collapsed, setCollapsed] = useState(true);

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
        {stepContent.content_name && (
          <Text
            strong
            style={{
              fontSize: '14px',
              color: token.colorText,
            }}
          >
            {stepContent.content_name}
          </Text>
        )}
        {stepContent.content_desc && (
          <Text type={'secondary'} style={{ fontSize: '12px' }}>
            {stepContent.content_desc}
          </Text>
        )}
      </Space>
    ),
    [id, step, stepContent, token],
  );

  return (
    <div>
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
          borderColor: showOption
            ? token.colorPrimaryBorder
            : token.colorBorder,
        }}
        bodyStyle={{ padding: 0 }}
        onMouseEnter={() => {
          setShowOption(true);
        }}
        onMouseLeave={() => {
          setShowOption(false);
        }}
        onCollapse={(value) => {
          setCollapsed(value);
        }}
        extra={
          <ContentExtra
            stepContent={stepContent}
            caseId={caseId}
            callback={callback}
            show={showOption}
          />
        }
        collapsibleIconRender={({}) => {
          return groupTitle;
        }}
      >
        {!collapsed && (
          <GroupTable groupId={stepContent.target_id} callback={callback} />
        )}
      </ProCard>
    </div>
  );
};

export default Index;

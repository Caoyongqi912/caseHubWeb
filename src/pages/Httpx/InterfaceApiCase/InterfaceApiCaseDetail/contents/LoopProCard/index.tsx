import Handler from '@/components/DnDDraggable/handler';
import CardExtraOption from '@/pages/Httpx/InterfaceApiCase/InterfaceApiCaseDetail/contents/CardExtraOption';
import LoopSteps from '@/pages/Httpx/InterfaceApiCase/InterfaceApiCaseDetail/contents/LoopProCard/LoopSteps';
import { IInterfaceCaseContent } from '@/pages/Httpx/types';
import { RetweetOutlined } from '@ant-design/icons';
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
  projectId?: number;
  callback?: () => void;
}

const Index: FC<Props> = (props) => {
  const { token } = useToken();
  const { id, step, caseId, caseContent, projectId, callback } = props;
  const [showOption, setShowOption] = useState(false);

  const loopTitle = useMemo(
    () => (
      <Space size={8} align="center">
        <Handler id={id} step={step} />
        <Tag
          icon={<RetweetOutlined />}
          style={{
            background: '#fef9c3',
            color: '#ca8a04',
            border: '1px solid #ca8a0420',
            fontWeight: 600,
            fontSize: '12px',
            padding: '2px 8px',
            borderRadius: token.borderRadiusSM,
          }}
        >
          Loop
        </Tag>
        <Text
          strong
          style={{
            fontSize: '14px',
            color: token.colorText,
          }}
        >
          循环
        </Text>
      </Space>
    ),
    [id, step, token],
  );
  return (
    <ProCard
      bordered
      collapsible
      hoverable
      bodyStyle={{ padding: 0 }}
      defaultCollapsed
      style={{
        borderRadius: token.borderRadiusLG,
        boxShadow: showOption
          ? `0 4px 12px ${token.colorPrimaryBg}`
          : `0 1px 3px ${token.colorBgLayout}`,
        transition: 'all 0.3s ease',
        borderColor: showOption ? token.colorPrimaryBorder : token.colorBorder,
      }}
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
      collapsibleIconRender={() => {
        return loopTitle;
      }}
    >
      <LoopSteps
        case_id={caseId}
        caseContent={caseContent}
        callback={callback}
        projectId={projectId}
      />
    </ProCard>
  );
};

export default Index;

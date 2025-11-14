import MyDrawer from '@/components/MyDrawer';
import InterfaceApiDetail from '@/pages/Httpx/Interface/InterfaceApiDetail';
import CardExtraOption from '@/pages/Httpx/InterfaceApiCase/InterfaceApiCaseDetail/contents/CardExtraOption';
import { IInterfaceCaseContent } from '@/pages/Httpx/types';
import { UnorderedListOutlined } from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import { Space, Tag, Typography } from 'antd';
import { BaseType } from 'antd/es/typography/Base';
import { FC, useState } from 'react';

const { Text } = Typography;

interface Props {
  step: number;
  caseId: number;
  caseContent: IInterfaceCaseContent;
  callback?: () => void;
}

const TextType: { [key: string]: string } = {
  GET: 'success',
  POST: 'warning',
  PUT: 'warning',
  DELETE: 'danger',
};

const ApiProCard: FC<Props> = (props) => {
  const { step, caseId, caseContent, callback } = props;
  const [showAPIDetail, setShowAPIDetail] = useState(false);
  const [showOption, setShowOption] = useState(false);

  return (
    <>
      <MyDrawer
        width={'75%'}
        name={''}
        open={showAPIDetail}
        setOpen={setShowAPIDetail}
      >
        <InterfaceApiDetail
          interfaceId={caseContent.target_id}
          callback={() => {}}
        />
      </MyDrawer>
      <ProCard
        bordered
        collapsible
        hoverable
        defaultCollapsed
        onMouseEnter={() => {
          setShowOption(true);
        }}
        onMouseLeave={() => {
          setShowOption(false);
        }}
        title={
          <Space>
            <UnorderedListOutlined
              style={{ color: '#c3cad4', marginRight: 20 }}
            />
            <Tag color={'green-inverse'}>STEP_{step}</Tag>
            <Tag color={'gold-inverse'}>
              API
              {caseContent.is_common_api === 1 ? (
                <span style={{ marginLeft: 5 }}>共</span>
              ) : (
                <span style={{ marginLeft: 5 }}>私</span>
              )}
            </Tag>
            {caseContent.content_desc && (
              <Text
                strong
                type={TextType[caseContent.content_desc] as BaseType}
              >
                {caseContent.content_desc}
              </Text>
            )}
            <Text strong style={{ marginLeft: 20 }}>
              {caseContent.content_name}
            </Text>
          </Space>
        }
        collapsibleIconRender={({ collapsed }) => {
          return null;
        }}
        extra={
          <CardExtraOption
            show={showOption}
            callback={callback}
            caseContent={caseContent}
            caseId={caseId}
          />
        }
        onClick={(event) => {
          event.stopPropagation();
          setShowAPIDetail(true);
        }}
      ></ProCard>
    </>
  );
};

export default ApiProCard;

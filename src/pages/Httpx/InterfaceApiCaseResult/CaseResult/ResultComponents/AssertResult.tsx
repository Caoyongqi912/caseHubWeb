import { ICaseContentResult } from '@/pages/Httpx/types';
import {
  CheckCircleTwoTone,
  CloseCircleTwoTone,
  QuestionOutlined,
} from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import { Space, Tag, Tooltip, Typography } from 'antd';
import { FC } from 'react';

const { Text } = Typography;

interface Props {
  result: ICaseContentResult;
}

const AssertResult: FC<Props> = ({ result }) => {
  const { content_asserts } = result;
  return (
    <ProCard
      bordered
      style={{ borderRadius: '5px', marginTop: 5 }}
      collapsibleIconRender={({}) => {
        return null;
      }}
      title={
        <Space>
          <Tag color={'green-inverse'}>STEP_{result.content_step}</Tag>
          <Tooltip title={'断言'}>
            <Tag color={'red-inverse'} icon={<QuestionOutlined />} />
          </Tooltip>
          {result.content_result ? (
            <CheckCircleTwoTone twoToneColor="#52c41a" />
          ) : (
            <CloseCircleTwoTone twoToneColor={'#c20000'} />
          )}
          <Text type={'secondary'} style={{ marginLeft: 20 }}>
            {result.content_name}
          </Text>
          {content_asserts && (
            <Space style={{ marginLeft: 20 }}>
              <Text type={'secondary'}>
                预期
                <Text type={'warning'} style={{ marginLeft: 20 }}>
                  {content_asserts.expect}
                </Text>
              </Text>
              <Text type={'secondary'} style={{ marginLeft: 20 }}>
                实际{' '}
                <Text type={'warning'} style={{ marginLeft: 20 }}>
                  {' '}
                  {content_asserts.actual}
                </Text>{' '}
              </Text>

              {/*<Text type={'warning'}>实际 {content_asserts.actual}</Text>*/}
            </Space>
          )}
        </Space>
      }
      headerBordered
      collapsible
      defaultCollapsed
    ></ProCard>
  );
};

export default AssertResult;

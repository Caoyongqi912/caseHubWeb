import { IObjGet } from '@/api';
import { ProDescriptions } from '@ant-design/pro-components';
import { FC } from 'react';

interface SelfProps {
  header?: IObjGet;
}

const RequestHeaders: FC<SelfProps> = ({ header }) => {
  console.log(header);

  return (
    <ProDescriptions column={1} bordered={true} size="small">
      {header &&
        Object.entries(header).map(([key, value]) => (
          <ProDescriptions.Item
            valueType="text"
            contentStyle={{
              maxWidth: '20%', // 设置 label 的最大宽度
              overflow: 'hidden', // 隐藏溢出的文本
              textOverflow: 'ellipsis', // 溢出时显示省略号
            }}
            copyable={true}
            ellipsis
            label={key}
          >
            {value}
          </ProDescriptions.Item>
        ))}
    </ProDescriptions>
  );
};

export default RequestHeaders;

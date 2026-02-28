import AceCodeEditor from '@/components/CodeEditor/AceCodeEditor';
import { IExtracts } from '@/pages/Httpx/types';
import { CONFIG } from '@/utils/config';
import { ProColumns } from '@ant-design/pro-table/lib/typing';
import { Tag } from 'antd';
const ResponseExtractColumns: ProColumns<IExtracts>[] = [
  {
    title: '变量名',
    copyable: true,
    dataIndex: 'key',
    render: (text) => {
      return <Tag color={'green'}>{text}</Tag>;
    },
  },
  {
    title: '提取目标',
    dataIndex: 'target',
    render: (text) => {
      return (
        <Tag color={'blue'}>
          {/*// @ts-ignore*/}
          {CONFIG.EXTRACT_RESPONSE_TARGET_ENUM[text]?.text}
        </Tag>
      );
    },
  },
  {
    title: '提取值',
    dataIndex: 'value',
    valueType: 'text',
    copyable: true,
    width: '60%',
    render: (_text, record) => {
      const { value } = record;

      // 判断值的类型
      if (typeof value === 'object' && value !== null) {
        // 如果是对象类型，使用 AceCodeEditor 展示 JSON
        return (
          <AceCodeEditor
            value={JSON.stringify(value, null, 2)}
            readonly={true}
            height="80px"
          />
        );
      }

      if (typeof value === 'string') {
        // 如果是数字或者字符串，直接返回文本
        return <span>{value}</span>;
      }

      // 其他情况默认返回空
      return null;
    },
  },
];

export default ResponseExtractColumns;

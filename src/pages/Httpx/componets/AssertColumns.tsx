import AceCodeEditor from '@/components/CodeEditor/AceCodeEditor';
import { AssertEnum } from '@/pages/Httpx/componets/assertEnum';
import { IAsserts } from '@/pages/Httpx/types';
import { ProColumns } from '@ant-design/pro-table/lib/typing';
import { Tag } from 'antd';

const typeContent = (T: any) => {
  if (typeof T === 'object') {
    return (
      <AceCodeEditor
        gutter={false}
        value={JSON.stringify(T, null, 2)}
        readonly={true}
        height={'40px'}
      />
    );
  } else if (typeof T === 'boolean') {
    return <Tag color={T ? 'green' : 'red'}>{T.toString()}</Tag>;
  } else {
    return <span>{T}</span>;
  }
};
const AssertColumns: ProColumns<IAsserts>[] = [
  {
    title: '目标',
    dataIndex: 'assert_target',
    key: 'assert_target',
    valueType: 'text',
    render: (text) => <Tag color={'blue'}>{text}</Tag>,
  },
  {
    title: '提取',
    dataIndex: 'assert_extract',
    key: 'assert_extract',
    render: (text) => <Tag color={'blue'}>{text}</Tag>,
  },
  {
    title: '语法',
    dataIndex: 'assert_text',
    key: 'assert_text',
    render: (text) => <Tag color={'blue'}>{text}</Tag>,
  },
  {
    title: '预计结果',
    dataIndex: 'expect',
    key: 'expect',
    valueType: 'jsonCode',
    render: (_text, record) => {
      return <span>{record.assert_value}</span>;
    },
  },
  {
    title: '断言方法',
    dataIndex: 'assert_opt',
    key: 'assert_opt',
    valueEnum: AssertEnum,
    render: (text) => <Tag color={'blue'}>{text}</Tag>,
  },
  {
    title: '实际结果',
    dataIndex: 'actual',
    key: 'actual',
    valueType: 'textarea',
    render: (_text, record) => {
      return typeContent(record.actual);
    },
  },

  {
    title: '测试结果',
    dataIndex: 'result',
    key: 'result',
    fixed: 'right',
    render: (text) => (
      <Tag color={text ? 'green' : 'volcano'}>{text ? 'SUCCESS' : 'FAIL'}</Tag>
    ),
  },
];

export default AssertColumns;

import { allJobs, setSwitch } from '@/api/base';
import MyProTable from '@/components/Table/MyProTable';
import { queryData } from '@/utils/somefunc';
import { history } from '@@/core/history';
import { ActionType, ProColumns } from '@ant-design/pro-components';
import { message, Switch, Tag } from 'antd';
import { useCallback, useRef } from 'react';

const Index = () => {
  const actionRef = useRef<ActionType>(); //Table action 的引用，便于自定义触发

  const fetchJobs = useCallback(async () => {
    const { code, data } = await allJobs();
    return queryData(code, data);
  }, []);

  const setTaskSwitch = async (tag: string, jobId: string, flag: boolean) => {
    const { code } = await setSwitch({ tag: tag, uid: jobId, switch: flag });
    if (code === 0) {
      if (flag) {
        message.success('已重启任务');
      } else {
        message.success('已暂停任务');
      }
    }
    actionRef.current?.reload();
  };

  const columns: ProColumns<any>[] = [
    {
      title: 'Tag',
      dataIndex: 'tag',
      key: 'tag',
      fixed: 'left',
      width: '10%',
      render: (text, record) => {
        return <Tag color={'geekblue-inverse'}>{record.tag}</Tag>;
      },
    },
    {
      title: '任务编号',
      dataIndex: 'uid',
      key: 'uid',
      fixed: 'left',
      width: '10%',
      copyable: true,
      render: (text, record) => {
        let url = '';
        if (record.tag === 'API') {
          url = '/interface/task/detail/taskId=' + record.id;
        } else {
          url = '/ui/task/detail/taskId=' + record.id;
        }
        return (
          <a
            onClick={() => {
              history.push(url);
            }}
          >
            {record.uid}
          </a>
        );
      },
    },
    {
      title: '任务名称',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => {
        return <Tag color={'geekblue-inverse'}>{record.title}</Tag>;
      },
    },
    {
      title: '任务状态',
      dataIndex: 'status',
      key: 'status',
      render: (text) => {
        if (text === 'RUNNING') {
          return <Tag color={'green'}>{text}</Tag>;
        } else {
          return <Tag color={'blue'}>{text}</Tag>;
        }
      },
    },
    {
      title: '开启中',
      hideInSearch: true,
      dataIndex: 'switch',
      render: (_, record) => {
        return (
          <Switch
            checkedChildren="ON"
            unCheckedChildren="OFF"
            onClick={async (checked) => {
              await setTaskSwitch(record.tag, record.uid, checked);
            }}
            value={record.switch}
          />
        );
      },
    },
    {
      title: 'next',
      dataIndex: 'next',

      hideInSearch: true,
    },
  ];

  return (
    <MyProTable
      search={false}
      // @ts-ignore
      actionRef={actionRef}
      rowKey={'id'}
      columns={columns}
      request={fetchJobs}
    />
  );
};

export default Index;

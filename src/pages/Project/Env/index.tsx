import { IEnv, ISearch } from '@/api';
import { deleteEnv, pageEnv, updateEnv } from '@/api/base';
import MyProTable from '@/components/Table/MyProTable';
import AddEnv from '@/pages/Project/Env/AddEnv';
import { ActionType, ProColumns } from '@ant-design/pro-components';
import { message } from 'antd';
import { useRef } from 'react';

const Index = () => {
  const actionRef = useRef<ActionType>(); //Table action 的引用，便于自定义触发’
  const pageEnvs = async (value: ISearch, sort: any) => {
    const searchData: any = {
      ...value,
      sort: sort,
    };
    const { code, data } = await pageEnv(searchData);
    if (code === 0) {
      return {
        data: data.items,
        total: data.pageInfo.total,
        success: true,
        pageSize: data.pageInfo.page,
        current: data.pageInfo.limit,
      };
    } else {
      return {
        data: [],
        total: 0,
        success: false,
      };
    }
  };

  const isReload = (value: boolean) => {
    if (value) {
      actionRef.current?.reload();
    }
  };
  const columns: ProColumns[] = [
    {
      title: '名称',
      dataIndex: 'name',
      ellipsis: true,
      width: '10%',
      formItemProps: {
        rules: [
          {
            required: true,
            message: '此项为必填项',
          },
        ],
      },
    },
    {
      title: '描述',
      dataIndex: 'desc',
      ellipsis: true,
      width: '10%',
    },
    {
      title: '路由',
      dataIndex: 'host',
      ellipsis: true,
      width: '10%',
      formItemProps: {
        rules: [
          {
            required: true,
            message: '此项为必填项',
          },
        ],
      },
      render: (text) => <a>{text}</a>,
    },
    {
      title: '端口',
      dataIndex: 'port',
      ellipsis: true,
      width: '10%',
    },
    {
      title: '创建人',
      dataIndex: 'creatorName',
      ellipsis: true,
      editable: false,
      search: false,
    },
    {
      title: '创建时间',
      key: 'showTime',
      dataIndex: 'create_time',
      valueType: 'dateTime',
      sorter: true,
      hideInSearch: true,
      editable: false,
    },
    {
      title: '更新时间',
      key: 'showTime',
      dataIndex: 'update_time',
      valueType: 'dateTime',
      sorter: true,
      hideInSearch: true,
      editable: false,
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      render: (text, record, _, action) => [
        <a
          key="editable"
          onClick={() => {
            action?.startEditable?.(record.uid);
          }}
        >
          编辑
        </a>,
      ],
    },
  ];

  const onSave = async (_: string, record: IEnv) => {
    updateEnv({ ...record }).then(({ code, msg }) => {
      if (code === 0) {
        message.success(msg);
        actionRef.current?.reload();
      }
    });
  };
  const onDelete = async (_: string, record: IEnv) => {
    await deleteEnv({ ...record }).then(({ code, msg }) => {
      if (code === 0) {
        message.success(msg);
        actionRef.current?.reload();
      }
    });
  };
  return (
    <MyProTable
      headerTitle={'Env'}
      actionRef={actionRef}
      columns={columns}
      request={pageEnvs}
      rowKey={'uid'}
      onSave={onSave}
      onDelete={onDelete}
      toolBarRender={() => [<AddEnv reload={isReload} />]}
    />
  );
};

export default Index;

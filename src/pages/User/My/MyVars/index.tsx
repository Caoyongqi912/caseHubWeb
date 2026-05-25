import { IUserVar } from '@/api';
import { addOrUpdateUserVars, pageUserVars } from '@/api/base';
import { removeInterGlobalVariable } from '@/api/inter/interGlobal';
import MyProTable from '@/components/Table/MyProTable';
import VarForm from '@/pages/User/My/MyVars/VarForm';
import { pageData } from '@/utils/somefunc';
import { PlusOutlined } from '@ant-design/icons';
import { ActionType, ProCard, ProColumns } from '@ant-design/pro-components';
import { Button, message, Space, Tag } from 'antd';
import { useCallback, useRef, useState } from 'react';

const Index = () => {
  const actionRef = useRef<ActionType>(); //Table action 的引用，便于自定义触发
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fetchUserVariables = useCallback(async (values: any, sort: any) => {
    const { code, data } = await pageUserVars({
      ...values,
      sort: sort,
    });
    return pageData(code, data);
  }, []);

  const setUserVariables = async (_: any, values: IUserVar) => {
    const { code, msg } = await addOrUpdateUserVars(values);
    if (code === 0) {
      actionRef.current?.reload();
      message.success(msg);
    }
  };
  const columns: ProColumns<IUserVar>[] = [
    {
      title: 'Key',
      dataIndex: 'key',
      copyable: true,
      render: (text) => {
        return <Tag color={'blue'}>{text}</Tag>;
      },
    },
    {
      title: 'Value',
      dataIndex: 'value',
      copyable: true,
      search: true,
      ellipsis: true,
    },
    {
      title: 'desc',
      dataIndex: 'description',
      valueType: 'textarea',
      search: true,
      ellipsis: true,
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      fixed: 'right',
      render: (__, record, _, action) => {
        return (
          <Space>
            <a
              onClick={async () => {
                action?.startEditable?.(record.uid);
              }}
            >
              编辑
            </a>
            <a
              onClick={async () => {
                await removeInterGlobalVariable(record.uid).then(
                  ({ code, msg }) => {
                    if (code === 0) {
                      message.success(msg);
                      actionRef.current?.reload();
                    }
                  },
                );
              }}
            >
              删除
            </a>
          </Space>
        );
      },
    },
  ];

  return (
    <ProCard>
      <VarForm
        open={isModalOpen}
        setOpen={setIsModalOpen}
        callBack={() => actionRef.current?.reload()}
      />
      <MyProTable
        actionRef={actionRef}
        columns={columns}
        request={fetchUserVariables}
        x={1000}
        toolBarRender={() => [
          <Button type={'primary'} onClick={() => setIsModalOpen(true)}>
            <PlusOutlined />
            添加变量
          </Button>,
        ]}
        rowKey={'uid'}
        onSave={setUserVariables}
      />
    </ProCard>
  );
};

export default Index;

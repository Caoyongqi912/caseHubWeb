import { pageDBConfig, removeDBConfig } from '@/api/base/dbConfig';
import MyProTable from '@/components/Table/MyProTable';
import DBModel from '@/pages/Project/Db/DBModel';
import { pageData } from '@/utils/somefunc';
import { useAccess } from '@@/exports';
import { ActionType, ProCard, ProColumns } from '@ant-design/pro-components';
import { Divider, Tag } from 'antd';
import { FC, useRef, useState } from 'react';

interface IProps {
  projectId?: string;
}

const Index: FC<IProps> = ({ projectId }) => {
  const actionRef = useRef<ActionType>(); //Table action 的引用，便于自定义触发’
  const [open, setOpen] = useState(false);
  const { isAdmin } = useAccess();
  const [currentDBConfig, setCurrentDBConfig] = useState<string>();
  const queryDbs = async (params: any, sort: any) => {
    const values = {
      ...params,
      project_id: projectId,
    };
    const { code, data } = await pageDBConfig({ ...values, sort: sort });
    return pageData(code, data);
  };
  const isReload = async () => {
    await actionRef.current?.reload();
    setOpen(false);
  };

  const columns: ProColumns[] = [
    {
      title: '类型',
      dataIndex: 'db_type',
      valueType: 'select',
      valueEnum: {
        1: { text: 'mysql', value: 1 },
        2: { text: 'oracle', value: 2 },
        3: { text: 'redis', value: 3 },
      },
      render: (text) => {
        return <Tag color={'blue'}>{text}</Tag>;
      },
    },
    {
      title: 'Name',
      dataIndex: 'db_name',
      ellipsis: true,
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
      title: 'Database',
      dataIndex: 'db_database',
      ellipsis: true,
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
      title: 'Creator',
      dataIndex: 'creatorName',
      ellipsis: true,
      editable: false,
      search: false,
    },
    {
      title: 'Opt',
      valueType: 'option',
      key: 'option',
      render: (text, record, _, action) => {
        if (isAdmin) {
          return (
            <>
              <a
                key="editable"
                onClick={() => {
                  setCurrentDBConfig(record.uid);
                  setOpen(true);
                }}
              >
                编辑
              </a>
              <Divider type="vertical" />
              <a
                onClick={async () => {
                  const { code } = await removeDBConfig({ uid: record.uid });
                  if (code === 0) {
                    await actionRef.current?.reload();
                  }
                }}
              >
                删除
              </a>
            </>
          );
        }
      },
    },
  ];

  return (
    <ProCard>
      <MyProTable
        toolBarRender={() => [
          <DBModel
            currentProjectId={projectId!}
            callBack={isReload}
            currentDBConfigId={currentDBConfig}
            open={open}
            setOpen={setOpen}
          />,
        ]}
        headerTitle={'DB配置'}
        actionRef={actionRef}
        columns={columns}
        request={queryDbs}
        rowKey={'uid'}
      />
    </ProCard>
  );
};

export default Index;

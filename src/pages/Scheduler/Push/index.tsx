import { pagePushConfig, removePushConfig } from '@/api/base/pushConfig';
import MyProTable from '@/components/Table/MyProTable';
import { IPushConfig } from '@/pages/Project/types';
import PushModal from '@/pages/Scheduler/Push/PushModal';
import { pageData } from '@/utils/somefunc';
import { ActionType, ProCard, ProColumns } from '@ant-design/pro-components';
import { Divider, Tag } from 'antd';
import { FC, useCallback, useRef, useState } from 'react';
interface IProps {
  projectId?: string;
}

const Index: FC<IProps> = ({ projectId }) => {
  const actionRef = useRef<ActionType>();
  const [open, setOpen] = useState(false);
  const [currentConfig, setCurrentConfig] = useState<IPushConfig | undefined>();

  const pageConfig = useCallback(async (values: any) => {
    const params = {
      project_id: projectId,
      ...values,
    };
    const { code, data } = await pagePushConfig(params);
    return pageData(code, data);
  }, []);

  const reload = async () => {
    await actionRef.current?.reload();
  };
  const columns: ProColumns[] = [
    {
      title: 'Type',
      dataIndex: 'push_type',
      valueType: 'select',
      valueEnum: {
        1: { text: 'Email', value: 1 },
        2: { text: 'DingTalk', value: 2 },
        3: { text: 'WeChat', value: 3 },
        4: { text: 'WeWork', value: 4 },
      },
      render: (text) => {
        return <Tag color={'blue'}>{text}</Tag>;
      },
    },
    {
      title: 'Title',
      dataIndex: 'push_name',
    },
    {
      title: 'Desc',
      dataIndex: 'push_desc',
    },
    {
      title: 'Value',
      dataIndex: 'push_value',
    },
    {
      title: 'Opt',
      valueType: 'option',
      render: (text, record, _, action) => {
        return (
          <>
            <a
              key="editable"
              onClick={() => {
                setCurrentConfig(record);
                setOpen(true);
              }}
            >
              编辑
            </a>
            <Divider type="vertical" />
            <a
              onClick={async () => {
                const { code } = await removePushConfig(record.id);
                if (code === 0) {
                  await reload();
                }
              }}
            >
              删除
            </a>
          </>
        );
      },
    },
  ];
  return (
    <ProCard>
      <MyProTable
        toolBarRender={() => [
          <PushModal
            callBack={reload}
            record={currentConfig}
            open={open}
            setOpen={setOpen}
          />,
        ]}
        actionRef={actionRef}
        request={pageConfig}
        columns={columns}
        rowKey={'uid'}
      />
    </ProCard>
  );
};

export default Index;

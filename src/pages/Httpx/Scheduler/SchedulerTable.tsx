import { page_aps_job, remove_aps_job } from '@/api/base/aps';
import MyProTable from '@/components/Table/MyProTable';
import ConfigForm from '@/pages/Httpx/Scheduler/ConfigForm';
import JobParams from '@/pages/Httpx/Scheduler/TableField/JobParams';
import TasksFiled from '@/pages/Httpx/Scheduler/TableField/TasksFiled';
import TriggerType from '@/pages/Httpx/Scheduler/TableField/TriggerType';
import { IJob } from '@/pages/Project/types';
import { ModuleEnum } from '@/utils/config';
import { pageData } from '@/utils/somefunc';
import { PlusOutlined } from '@ant-design/icons';
import { ActionType, ModalForm, ProColumns } from '@ant-design/pro-components';
import { Button, Space, Tag } from 'antd';
import { FC, useCallback, useEffect, useRef, useState } from 'react';

interface SelfProps {
  currentProjectId?: number;
  currentModuleId?: number;
  perKey: string;
}

const SchedulerTable: FC<SelfProps> = (props) => {
  const actionRef = useRef<ActionType>(); //Table action 的引用，便于自定义触发
  const { currentProjectId, currentModuleId, perKey } = props;
  const [modalVisit, setModalVisit] = useState(false);
  const [currentJob, setCurrentJob] = useState<IJob>();
  const columns: ProColumns<IJob>[] = [
    {
      title: '任务ID',
      dataIndex: 'uid',
      copyable: true,
      width: '10%',
      render: (_, record) => <Tag color={'blue-inverse'}>{record.uid}</Tag>,
    },
    {
      title: '任务名称',
      dataIndex: 'job_name',
      ellipsis: true,
      width: '10%',
      render: (_, record) => (
        <Tag color={'blue-inverse'}>{record.job_name}</Tag>
      ),
    },

    {
      title: '任务类型',
      dataIndex: 'job_type',
      width: '10%',
      valueEnum: {
        1: {
          text: 'API',
        },
        2: {
          text: 'UI',
        },
      },
      render: (_, record) => (
        <Tag color={'blue'}>{record.job_type === 1 ? 'API' : 'UI'}</Tag>
      ),
    },
    {
      title: '执行信息',
      dataIndex: 'job_trigger_type',
      search: false,
      width: '20%',
      render: (_, record) => <TriggerType record={record} />,
    },
    {
      title: '参数',
      dataIndex: 'job_kwargs',
      search: false,
      width: '20%',
      render: (text, record) => <JobParams text={text} record={record} />,
    },
    {
      title: '创建人',
      dataIndex: 'creatorName',
      width: '10%',
      render: (text, record) => (
        <Tag color={'geekblue'}>{record.creatorName}</Tag>
      ),
    },
    {
      title: '操作',
      dataIndex: 'option',
      width: '10%',
      fixed: 'right',
      render: (text, record) => (
        <Space>
          <a
            type="primary"
            onClick={() => {
              setCurrentJob(record);
              setModalVisit(true);
            }}
          >
            编辑
          </a>

          <a
            onClick={async () => {
              const { code, data } = await remove_aps_job({
                job_id: record.uid,
              });
              if (code === 0) {
                reloadTable();
              }
            }}
          >
            删除
          </a>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    reloadTable();
  }, [currentModuleId, currentProjectId]);

  const reloadTable = () => {
    actionRef.current?.reload();
    setModalVisit(false);
  };

  const fetchJobData = useCallback(
    async (values: any) => {
      const { code, data } = await page_aps_job({
        ...values,
        module_type: ModuleEnum.JOB,
        module_id: currentModuleId,
      });
      return pageData(code, data);
    },
    [currentModuleId],
  );
  return (
    <div>
      <ModalForm
        size={'small'}
        title="Create New Form"
        open={modalVisit}
        submitter={false}
        onFinish={async () => {
          return true;
        }}
        onOpenChange={setModalVisit}
      >
        <ConfigForm
          currentJob={currentJob}
          callback={reloadTable}
          currentProjectId={currentProjectId}
          currentModuleId={currentModuleId}
        />
      </ModalForm>
      <MyProTable
        expandable={{
          columnTitle: '关联任务',
          expandRowByClick: true,
          columnWidth: '4%',
          expandedRowRender: (record) => {
            return <TasksFiled job_uid={record.uid} />;
          },
        }}
        persistenceKey={perKey}
        actionRef={actionRef}
        columns={columns}
        rowKey={'id'}
        request={fetchJobData}
        toolBarRender={() => [
          <Button
            hidden={currentModuleId === undefined}
            type="primary"
            onClick={() => {
              setCurrentJob(undefined);
              setModalVisit(true);
            }}
          >
            <PlusOutlined />
            添加任务
          </Button>,
        ]}
      />
    </div>
  );
};
export default SchedulerTable;

import { IModuleEnum, IObjGet } from '@/api';
import { removeAllTaskResults } from '@/api/inter/interCase';
import {
  pageInterTaskResult,
  removeInterTaskResultDetail,
} from '@/api/inter/interTask';
import { queryProjectEnum } from '@/components/CommonFunc';
import MyProTable from '@/components/Table/MyProTable';
import { IInterfaceTaskResult } from '@/pages/Httpx/types';
import { IJob } from '@/pages/Project/types';
import { ModuleEnum } from '@/utils/config';
import { fetchModulesEnum, pageData } from '@/utils/somefunc';
import { ActionType, ProColumns } from '@ant-design/pro-components';
import { Button, message, Space, Tag } from 'antd';
import { FC, useCallback, useEffect, useRef, useState } from 'react';

interface SelfProps {
  apiCaseTaskId?: number | string;
  job?: IJob;
}

const InterfaceApiTaskResultTable: FC<SelfProps> = ({ apiCaseTaskId, job }) => {
  const actionRef = useRef<ActionType>(); //Table action 的引用，便于自定义触发
  const [showSearch, setShowSearch] = useState(true);
  const [projectEnumMap, setProjectEnumMap] = useState<IObjGet>({});
  const [moduleEnum, setModuleEnum] = useState<IModuleEnum[]>([]);
  const [selectProjectId, setSelectProjectId] = useState<number>();
  const [selectModuleId, setSelectModuleId] = useState<number>();
  useEffect(() => {
    if (apiCaseTaskId) {
      setShowSearch(false);
    } else {
      queryProjectEnum(setProjectEnumMap).then();
    }
  }, [apiCaseTaskId]);

  useEffect(() => {
    if (selectProjectId) {
      fetchModulesEnum(
        selectProjectId,
        ModuleEnum.API_TASK,
        setModuleEnum,
      ).then();
    }
  }, [selectProjectId]);

  const fetchResults = useCallback(
    async (params: any, sort: any) => {
      const searchData = {
        ...params,
        //只查询公共api
        taskId: apiCaseTaskId,
        sort: { ...sort },
      };
      if (job) {
        searchData.startBy = 3;
        searchData.taskUid = job.job_task_id_list;
      }
      const { code, data } = await pageInterTaskResult(searchData);
      return pageData(code, data);
    },
    [apiCaseTaskId],
  );

  const columns: ProColumns<IInterfaceTaskResult>[] = [
    {
      title: '所属项目',
      dataIndex: 'interfaceProjectId',
      hideInTable: true,
      valueType: 'select',
      valueEnum: projectEnumMap,
      fieldProps: {
        onSelect: (value: number) => {
          setSelectProjectId(value);
          setSelectModuleId(undefined);
        },
      },
    },
    {
      title: '所属模块',
      dataIndex: 'interfaceModuleId',
      hideInTable: true,
      valueType: 'treeSelect',
      fieldProps: {
        onSelect: (value: number) => {
          setSelectModuleId(value);
        },
        treeData: moduleEnum,
        fieldNames: {
          label: 'title',
        },
      },
    },
    {
      title: '任务结果ID',
      dataIndex: 'uid',
      width: '8%',
      fixed: 'left',
      render: (_, record) => <Tag color={'blue'}>{record.uid}</Tag>,
    },
    {
      title: '任务名',
      dataIndex: 'taskName',
      render: (_, record) => <Tag color={'blue'}>{record.taskName}</Tag>,
    },

    {
      title: '测试结果',
      dataIndex: 'result',
      valueType: 'select',
      sorter: true,
      valueEnum: { SUCCESS: { text: '成功' }, ERROR: { text: '失败' } },
      render: (_, record) => (
        <Tag color={record.result === 'SUCCESS' ? 'green' : 'error'}>
          {record.result}
        </Tag>
      ),
    },
    {
      title: '进度',
      key: 'progress',
      hideInSearch: true,
      hideInTable: showSearch,
      dataIndex: 'progress',
      valueType: (item) => ({
        type: 'progress',
        status: item.status !== 'OVER' ? 'active' : 'success',
      }),
    },

    {
      title: '执行时间',
      dataIndex: 'runDay',
      key: 'runDay',
      valueType: 'dateRange',
      sorter: true,
      render: (_, record) => <Tag color={'blue'}>{record.start_time}</Tag>,
    },
    {
      title: '用时',
      dataIndex: 'totalUseTime',
      key: 'totalUseTime',
      hideInSearch: true,
      render: (_, record) => <Tag color={'blue'}>{record.totalUseTime}</Tag>,
    },
    {
      title: '执行人',
      dataIndex: 'starterName',
      key: 'starterName',
      render: (_, record) => <Tag color={'blue'}>{record.starterName}</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueEnum: {
        RUNNING: { text: '运行中', status: 'Processing' },
        OVER: { text: '完成', status: 'Success' },
      },
    },
    {
      title: '操作',
      valueType: 'option',
      fixed: 'right',
      width: '8%',
      render: (_, record) => (
        <Space>
          {record.status === 'OVER' ? (
            <>
              <a
                onClick={() => {
                  window.open(
                    `/interface/task/report/detail/resultId=${record.id}`,
                    '_blank',
                  );
                }}
              >
                详情
              </a>
              <a onClick={async () => await removeTaskResult(record.id)}>
                删除
              </a>
            </>
          ) : null}
        </Space>
      ),
    },
  ];
  const removeTaskResult = async (resultId: number) => {
    const { code, msg } = await removeInterTaskResultDetail(resultId);
    if (code === 0) {
      message.success(msg);
      actionRef.current?.reload();
    }
  };
  const removeTaskResults = async () => {
    if (apiCaseTaskId) {
      const { code, msg } = await removeAllTaskResults(apiCaseTaskId);
      if (code === 0) {
        message.success(msg);
        actionRef.current?.reload();
      }
    }
  };
  const RemoveAllButton = (
    <>
      {showSearch ? (
        <Button type={'primary'} onClick={removeTaskResults}>
          Remove All
        </Button>
      ) : null}
    </>
  );

  return (
    <>
      <MyProTable
        // @ts-ignore
        polling={apiCaseTaskId ? false : 2}
        rowKey={'uid'}
        actionRef={actionRef}
        request={fetchResults}
        search={showSearch}
        toolBarRender={() => [RemoveAllButton]}
        pagination={{
          showQuickJumper: true,
          defaultPageSize: job ? 10 : 6,
          showSizeChanger: true,
        }}
        columns={columns}
        x={1500}
      />
    </>
  );
};

export default InterfaceApiTaskResultTable;

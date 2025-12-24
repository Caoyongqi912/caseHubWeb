import { IModuleEnum, IObjGet } from '@/api';
import {
  clearResultByTaskId,
  pagePlayTaskResult,
  removePlayTaskResultById,
} from '@/api/play/playTask';
import { queryProjectEnum } from '@/components/CommonFunc';
import MyProTable from '@/components/Table/MyProTable';
import { IPlayTaskResult } from '@/pages/Play/componets/uiTypes';
import { IJob } from '@/pages/Project/types';
import { CONFIG, ModuleEnum } from '@/utils/config';
import { fetchModulesEnum, pageData } from '@/utils/somefunc';
import { history } from '@@/core/history';
import { ActionType, ProColumns } from '@ant-design/pro-components';
import { Button, message, Space, Tag } from 'antd';
import dayjs from 'dayjs';
import { FC, useCallback, useEffect, useRef, useState } from 'react';

interface SelfProps {
  taskId?: string;
  job?: IJob;
}

const PlayTaskResultTable: FC<SelfProps> = ({ taskId, job }) => {
  const actionRef = useRef<ActionType>(); //Table action 的引用，便于自定义触发
  const [selectProjectId, setSelectProjectId] = useState<number>();
  const [showSearch, setShowSearch] = useState(true);

  const [projectEnumMap, setProjectEnumMap] = useState<IObjGet>({});
  const [moduleEnum, setModuleEnum] = useState<IModuleEnum[]>([]);
  useEffect(() => {
    if (taskId) {
      setShowSearch(false);
    }
    queryProjectEnum(setProjectEnumMap).then();
  }, []);

  useEffect(() => {
    if (selectProjectId) {
      fetchModulesEnum(
        selectProjectId,
        ModuleEnum.UI_TASK,
        setModuleEnum,
      ).then();
    }
  }, [selectProjectId]);

  const fetchTaskData = useCallback(
    async (params: any, sort: any) => {
      const newParams = {
        ...params,
        ...sort,
        module_type: ModuleEnum.UI_TASK,
        task_id: taskId,
      };
      if (job) {
        newParams.startBy = 3;
        newParams.taskUid = job.job_task_id_list;
      }
      const { code, data } = await pagePlayTaskResult(newParams);
      return pageData(code, data);
    },
    [taskId],
  );
  const columns: ProColumns<IPlayTaskResult>[] = [
    {
      title: '报告ID',
      dataIndex: 'uid',
      fixed: 'left',
      width: '10%',
      renderText: (text, record) => (
        <a
          onClick={() => {
            history.push(`/report/history/uiTask/detail/uid=${record.id}`);
          }}
        >
          {text}
        </a>
      ),
    },
    {
      title: '项目',
      dataIndex: 'project_id',
      hideInTable: true,
      valueType: 'select',
      valueEnum: { ...projectEnumMap },
      fieldProps: {
        onSelect: (value: number) => {
          setSelectProjectId(value);
        },
      },
    },
    {
      title: '所属模块',
      dataIndex: 'module_id',
      hideInTable: true,
      valueType: 'treeSelect',
      fieldProps: {
        // onSelect: (value: number) => {
        //   setSelectModuleId(value);
        // },
        treeData: moduleEnum,
        fieldNames: {
          label: 'title',
        },
      },
    },
    {
      title: '任务名称',
      dataIndex: 'task_name',
      fixed: 'left',
      width: '14%',
      renderText: (text, record) => (
        <a
          onClick={() => {
            history.push(`/ui/task/detail/taskId=${record.task_id}`);
          }}
        >
          {text}
        </a>
      ),
    },
    {
      title: '执行人',
      dataIndex: 'starter_name',
      width: '10%',
      renderText: (text) => <Tag color={'blue'}>{text}</Tag>,
    },
    {
      title: '执行日期',
      dataIndex: 'run_day',
      valueType: 'dateRange',
      ellipsis: true,
      hideInTable: true,
      search: {
        transform: (value) => {
          return {
            run_day: [
              dayjs(value[0]).format('YYYY-MM-DD'),
              dayjs(value[1]).format('YYYY-MM-DD'),
            ],
          };
        },
      },
    },
    {
      title: '运行状态',
      dataIndex: 'status',
      valueType: 'select',
      valueEnum: CONFIG.UI_STATUS_ENUM,
      render: (_, record) => {
        return CONFIG.UI_STATUS_ENUM[record.status]?.tag;
      },
    },
    {
      title: '运行结果',
      dataIndex: 'result',
      valueType: 'select',
      valueEnum: CONFIG.UI_RESULT_ENUM,
      render: (_, record) => {
        return CONFIG.UI_RESULT_ENUM[record.result]?.tag;
      },
    },
    {
      title: '用时',
      dataIndex: 'total_usetime',
      hideInSearch: true,
      renderText: (text) => <Tag color={'blue'}>{text}</Tag>,
    },
    {
      title: '执行时间',
      dataIndex: 'start_time',
      hideInSearch: true,
      render: (_, record) => <Tag color={'blue'}>{record.start_time}</Tag>,
    },
    {
      title: '操作',
      valueType: 'option',
      fixed: 'right',
      width: '10%',
      render: (_, record) => (
        <Space>
          <a
            onClick={() => {
              history.push(`/ui/report/detail/resultId=${record.id}`);
            }}
          >
            详情
          </a>
          <a
            onClick={async () => {
              const { code, msg } = await removePlayTaskResultById({
                resultId: record.uid,
              });
              if (code === 0) {
                message.success(msg);
                actionRef.current?.reload();
              }
            }}
          >
            删除
          </a>
        </Space>
      ),
    },
  ];

  const clearTaskResult = async () => {
    if (taskId) {
      const { code } = await clearResultByTaskId(taskId);
      if (code === 0) {
        actionRef.current?.reload();
      }
    }
  };

  return (
    <MyProTable
      toolBarRender={() => [
        <Button hidden={showSearch} type={'primary'} onClick={clearTaskResult}>
          清空
        </Button>,
      ]}
      search={showSearch}
      actionRef={actionRef}
      rowKey={'id'}
      columns={columns}
      request={fetchTaskData}
      x={1000}
    />
  );
};

export default PlayTaskResultTable;

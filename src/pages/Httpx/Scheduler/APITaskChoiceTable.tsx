import { IModuleEnum } from '@/api';
import { pageApiTask } from '@/api/inter/interTask';
import MyProTable from '@/components/Table/MyProTable';
import { IInterfaceAPI, IInterfaceAPITask } from '@/pages/Httpx/types';
import { ModuleEnum } from '@/utils/config';
import { fetchModulesEnum, pageData } from '@/utils/somefunc';
import { ActionType, ProColumns } from '@ant-design/pro-components';
import { Tag } from 'antd';
import { TableRowSelection } from 'antd/es/table/interface';
import React, { FC, useCallback, useEffect, useRef, useState } from 'react';

interface IProps {
  currentProjectId?: number;
  setJobs: (rowKeys: React.Key[]) => void;
}

const ApiTaskChoiceTable: FC<IProps> = ({ setJobs, currentProjectId }) => {
  const actionRef = useRef<ActionType>(); //Table action 的引用，便于自定义触发
  const [apiModuleEnum, setApiModuleEnum] = useState<IModuleEnum[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  useEffect(() => {
    if (!currentProjectId) return;
    fetchModulesEnum(
      currentProjectId,
      ModuleEnum.API_TASK,
      setApiModuleEnum,
    ).then();
  }, [currentProjectId]);

  const taskColumns: ProColumns<IInterfaceAPITask>[] = [
    {
      title: '所属模块',
      dataIndex: 'module_id',
      hideInTable: true,
      valueType: 'treeSelect',
      fieldProps: {
        treeData: apiModuleEnum,
        fieldNames: {
          label: 'title',
        },
      },
    },
    {
      title: '任务编号',
      dataIndex: 'uid',
      key: 'uid',
    },
    {
      title: '名称',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '创建人',
      dataIndex: 'creatorName',
      render: (_, record) => {
        return <Tag>{record.creatorName}</Tag>;
      },
    },
  ];

  const fetchPageTasks = useCallback(async (params: any, sort: any) => {
    const { code, data } = await pageApiTask({
      ...params,
      module_type: ModuleEnum.API_TASK,
      sort: sort,
    });
    return pageData(code, data);
  }, []);
  const rowSelection: TableRowSelection<IInterfaceAPI> = {
    selectedRowKeys,
    type: 'radio',
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
      setJobs(newSelectedRowKeys);
    },
  };

  return (
    <MyProTable
      x={800}
      pagination={{
        defaultPageSize: 10,
      }}
      actionRef={actionRef}
      rowSelection={rowSelection}
      columns={taskColumns}
      rowKey={'id'}
      request={fetchPageTasks}
    />
  );
};

export default ApiTaskChoiceTable;

import { IModuleEnum, IObjGet } from '@/api';
import {
  selectCommonGroups2Case,
  selectCommonGroups2ConditionAPI,
} from '@/api/inter/interCase';
import { pageInterfaceGroup } from '@/api/inter/interGroup';
import { queryProjectEnum } from '@/components/CommonFunc';
import MyProTable from '@/components/Table/MyProTable';
import { IInterfaceGroup } from '@/pages/Httpx/types';
import { IUICase } from '@/pages/Play/componets/uiTypes';
import { ModuleEnum } from '@/utils/config';
import { fetchModulesEnum, pageData } from '@/utils/somefunc';
import { ActionType, ProColumns } from '@ant-design/pro-components';
import { Button, message, Tag } from 'antd';
import { TableRowSelection } from 'antd/es/table/interface';
import React, { FC, useCallback, useEffect, useRef, useState } from 'react';

interface SelfProps {
  projectId?: number;
  currentCaseId: number;
  condition_api_id?: number;
  refresh?: () => void;
}

const GroupApiChoiceTable: FC<SelfProps> = (props) => {
  const { currentCaseId, refresh, condition_api_id, projectId } = props;
  const actionRef = useRef<ActionType>(); //Table action 的引用，便于自定义触发
  const [selectProjectId, setSelectProjectId] = useState<number | undefined>(
    projectId,
  );
  const [projectEnumMap, setProjectEnumMap] = useState<IObjGet>({});
  const [moduleEnum, setModuleEnum] = useState<IModuleEnum[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const fetchInterfaceGroup = useCallback(
    async (params: any) => {
      const { code, data } = await pageInterfaceGroup({
        ...params,
        project_id: projectId,
        module_type: ModuleEnum.API,
      });
      return pageData(code, data);
    },
    [projectId],
  );
  // 查询所有project 设置枚举
  useEffect(() => {
    queryProjectEnum(setProjectEnumMap).then();
  }, []);
  useEffect(() => {
    if (selectProjectId) {
      fetchModulesEnum(selectProjectId, ModuleEnum.API, setModuleEnum).then();
    }
  }, [selectProjectId]);
  const columns: ProColumns<IInterfaceGroup>[] = [
    {
      title: '项目',
      dataIndex: 'project_id',
      hideInTable: true,
      valueType: 'select',
      valueEnum: projectEnumMap,
      initialValue: selectProjectId?.toString(),
      fieldProps: {
        disabled: true,
      },
    },
    {
      title: '所属模块',
      dataIndex: 'module_id',
      hideInTable: true,
      valueType: 'treeSelect',
      fieldProps: {
        treeData: moduleEnum,
        fieldNames: {
          label: 'title',
        },
      },
    },
    {
      title: 'ID',
      dataIndex: 'uid',
      key: 'uid',
      width: '15%',
      copyable: true,
      fixed: 'left',
      render: (_, record) => {
        return <Tag color={'geekblue'}>{record.uid}</Tag>;
      },
    },
    {
      title: '组名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '接口数',
      dataIndex: 'api_num',
      key: 'api_num',
      render: (_, record) => {
        return <Tag color={'blue-inverse'}>{record.api_num}</Tag>;
      },
    },
    {
      title: '创建人',
      dataIndex: 'creatorName',
      render: (_, record) => {
        return <Tag>{record.creatorName}</Tag>;
      },
    },
  ];
  const rowSelection: TableRowSelection<IUICase> = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
  };

  return (
    <MyProTable
      // @ts-ignore
      tableAlertOptionRender={() => {
        return (
          <Button
            type={'primary'}
            onClick={async () => {
              if (condition_api_id) {
                const { code, msg } = await selectCommonGroups2ConditionAPI({
                  condition_api_id: condition_api_id,
                  group_id_list: selectedRowKeys as number[],
                });
                if (code === 0) {
                  message.success(msg);
                  refresh?.();
                }
                return;
              }
              if (currentCaseId) {
                const { code, msg } = await selectCommonGroups2Case({
                  interface_case_id: currentCaseId,
                  api_group_id_list: selectedRowKeys as number[],
                });
                if (code === 0) {
                  message.success(msg);
                  refresh?.();
                }
              }
            }}
          >
            确认添加
          </Button>
        );
      }}
      rowSelection={rowSelection}
      columns={columns}
      rowKey={'id'}
      x={1000}
      actionRef={actionRef}
      request={fetchInterfaceGroup}
    />
  );
};

export default GroupApiChoiceTable;

import { IModuleEnum, IObjGet } from '@/api';
import { pageInterApi } from '@/api/inter';
import {
  associationApis,
  selectCommonAPI2ConditionAPI,
} from '@/api/inter/interCase';
import { addInterfaceGroupApis } from '@/api/inter/interGroup';
import { associationApisByTaskId } from '@/api/inter/interTask';
import { queryProjectEnum } from '@/components/CommonFunc';
import MyProTable from '@/components/Table/MyProTable';
import { IInterfaceAPI } from '@/pages/Httpx/types';
import { CONFIG, ModuleEnum } from '@/utils/config';
import { fetchModulesEnum, pageData } from '@/utils/somefunc';
import { ActionType, ProColumns } from '@ant-design/pro-components';
import { Button, message, Space, Tag } from 'antd';
import { TableRowSelection } from 'antd/es/table/interface';
import React, { FC, useCallback, useEffect, useRef, useState } from 'react';

interface SelfProps {
  projectId?: number;
  currentCaseApiId?: string;
  currentGroupId?: number;
  currentTaskId?: string;
  currentStepId?: number;
  condition_id?: number;
  refresh?: (value?: number[]) => void;
}

const InterfaceCaseChoiceApiTable: FC<SelfProps> = ({
  projectId,
  currentGroupId,
  currentCaseApiId,
  refresh,
  currentTaskId,
  currentStepId,
  condition_id,
}) => {
  const actionRef = useRef<ActionType>(); //Table action 的引用，便于自定义触发
  const [projectEnumMap, setProjectEnumMap] = useState<IObjGet>({});
  const [moduleEnum, setModuleEnum] = useState<IModuleEnum[]>([]);

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // 查询所有project 设置枚举
  useEffect(() => {
    if (!projectId) return;
    queryProjectEnum(setProjectEnumMap).then(async () => {
      await fetchModulesEnum(projectId, ModuleEnum.API, setModuleEnum).then();
    });
  }, [projectId]);

  const fetchInterface = useCallback(
    async (params: any, sort: any) => {
      const searchData = {
        ...params,
        //只查询公共api
        project_id: projectId,
        module_type: ModuleEnum.API,
        is_common: 1,
        sort: sort,
      };
      const { code, data } = await pageInterApi(searchData);
      return pageData(code, data);
    },
    [projectId],
  );

  const columns: ProColumns<IInterfaceAPI>[] = [
    {
      title: '项目',
      dataIndex: 'project_id',
      hideInTable: true,
      hideInSearch: true,
      valueType: 'select',
      valueEnum: projectEnumMap,
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
      title: '接口编号',
      dataIndex: 'uid',
      key: 'uid',
      copyable: true,
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },

    {
      title: '优先级',
      dataIndex: 'level',
      valueType: 'select',
      valueEnum: CONFIG.API_LEVEL_ENUM,
      width: '10%',
      render: (_, record) => {
        return <Tag color={'blue'}>{record.level}</Tag>;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueType: 'select',
      valueEnum: CONFIG.API_STATUS_ENUM,
      render: (_, record) => {
        return CONFIG.API_STATUS_ENUM[record.status].tag;
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

  const rowSelection: TableRowSelection<IInterfaceAPI> = {
    selectedRowKeys,
    type: currentStepId ? 'radio' : 'checkbox',
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
  };

  return (
    <MyProTable
      // @ts-ignore
      tableAlertOptionRender={() => {
        return (
          <Space>
            <Button
              type={'primary'}
              onClick={async () => {
                if (condition_id) {
                  const { code, msg } = await selectCommonAPI2ConditionAPI({
                    condition_id: condition_id,
                    interface_id_list: selectedRowKeys as number[],
                  });
                  if (code === 0) {
                    message.success(msg);
                    refresh?.();
                  }
                  return;
                }
                if (currentCaseApiId) {
                  const { code, msg } = await associationApis({
                    interface_case_id: currentCaseApiId,
                    interface_id_list: selectedRowKeys as number[],
                  });
                  if (code === 0) {
                    message.success(msg);
                    refresh?.();
                  }
                } else if (currentTaskId) {
                  const { code, msg } = await associationApisByTaskId({
                    taskId: currentTaskId,
                    apiIds: selectedRowKeys as number[],
                  });
                  if (code === 0) {
                    message.success(msg);
                    refresh?.();
                  }
                } else if (currentGroupId) {
                  const { code, msg } = await addInterfaceGroupApis({
                    groupId: currentGroupId,
                    apiIds: selectedRowKeys as number[],
                  });
                  if (code === 0) {
                    message.success(msg);
                    refresh?.();
                  }
                } else if (currentStepId) {
                  refresh?.(selectedRowKeys as number[]);
                }
              }}
            >
              引用添加
            </Button>
            {/*{currentCaseApiId &&*/}
            {/*  currentGroupId === undefined &&*/}
            {/*  currentTaskId === undefined && (*/}
            {/*    <Button*/}
            {/*      type={'primary'}*/}
            {/*      onClick={async () => {*/}
            {/*        const { code, msg } = await selectCommonApisCopy2Case({*/}
            {/*          caseId: currentCaseApiId,*/}
            {/*          commonApis: selectedRowKeys as number[],*/}
            {/*        });*/}
            {/*        if (code === 0) {*/}
            {/*          message.success(msg);*/}
            {/*          refresh?.();*/}
            {/*        }*/}
            {/*      }}*/}
            {/*    >*/}
            {/*      复制添加*/}
            {/*    </Button>*/}
            {/*  )}*/}
          </Space>
        );
      }}
      rowSelection={rowSelection}
      columns={columns}
      rowKey={'id'}
      x={1000}
      actionRef={actionRef}
      request={fetchInterface}
    />
  );
};

export default InterfaceCaseChoiceApiTable;

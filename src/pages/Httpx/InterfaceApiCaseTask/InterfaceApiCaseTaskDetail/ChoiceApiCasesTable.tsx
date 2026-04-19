import { IModuleEnum, IObjGet } from '@/api';
import { pageInterApiCase } from '@/api/inter/interCase';
import { queryProjectEnum } from '@/components/CommonFunc';
import MyProTable from '@/components/Table/MyProTable';
import { IInterfaceAPICase } from '@/pages/Httpx/types';
import { IUICase } from '@/pages/Play/componets/uiTypes';
import { CONFIG, ModuleEnum } from '@/utils/config';
import { fetchModulesEnum, pageData } from '@/utils/somefunc';
import { ProColumns } from '@ant-design/pro-components';
import { Button, Tag } from 'antd';
import { TableRowSelection } from 'antd/es/table/interface';
import React, { FC, useCallback, useEffect, useState } from 'react';

interface IChoiceApiCasesTableProps {
  currentProjectId?: number;
  onCaseSelected: (selectedRowKeys: number[]) => void;
}

const ChoiceApiCasesTable: FC<IChoiceApiCasesTableProps> = ({
  currentProjectId,
  onCaseSelected,
}) => {
  const [selectProjectId, setSelectProjectId] = useState<number | undefined>(
    currentProjectId,
  );
  const [projectEnumMap, setProjectEnumMap] = useState<IObjGet>({});
  const [moduleEnum, setModuleEnum] = useState<IModuleEnum[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  useEffect(() => {
    queryProjectEnum(setProjectEnumMap).then();
  }, []);

  useEffect(() => {
    if (selectProjectId) {
      fetchModulesEnum(
        selectProjectId,
        ModuleEnum.API_CASE,
        setModuleEnum,
      ).then();
    }
  }, [selectProjectId]);
  const pageInterfaceCase = useCallback(async (params: any, sort: any) => {
    const { code, data } = await pageInterApiCase({
      ...params,
      project_id: currentProjectId,
      module_type: ModuleEnum.API_CASE,
      sort: sort,
    });
    return pageData(code, data);
  }, []);

  const rowSelection: TableRowSelection<IUICase> = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
  };

  const columns: ProColumns<IInterfaceAPICase>[] = [
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
      title: '接口编号',
      dataIndex: 'uid',
      key: 'uid',
      copyable: true,
    },
    {
      title: '名称',
      dataIndex: 'case_title',
      key: 'title',
    },
    {
      title: '步骤数量',
      dataIndex: 'case_api_num',
      valueType: 'text',
      hideInSearch: true,
      render: (_, record) => {
        return <Tag color={'blue'}>{record.case_api_num}</Tag>;
      },
    },
    {
      title: '优先级',
      dataIndex: 'case_level',
      valueType: 'select',
      valueEnum: CONFIG.API_LEVEL_ENUM,
      width: '10%',
      render: (_, record) => {
        return <Tag color={'blue'}>{record.case_level}</Tag>;
      },
    },
    {
      title: '状态',
      dataIndex: 'case_status',
      valueType: 'select',
      valueEnum: CONFIG.API_STATUS_ENUM,
      render: (_, record) => {
        return CONFIG.API_STATUS_ENUM[record.case_status].tag;
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

  return (
    <MyProTable
      // @ts-ignore
      tableAlertOptionRender={() => {
        return (
          <Button
            type={'primary'}
            onClick={() => onCaseSelected(selectedRowKeys as number[])}
          >
            确认添加
          </Button>
        );
      }}
      rowSelection={rowSelection}
      columns={columns}
      rowKey={'id'}
      request={pageInterfaceCase}
    />
  );
};

export default ChoiceApiCasesTable;

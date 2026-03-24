import { IModuleEnum, IObjGet } from '@/api';
import { pagePlaySteps } from '@/api/play/playCase';
import { queryProjectEnum } from '@/components/CommonFunc';
import MyProTable from '@/components/Table/MyProTable';
import { IUICaseSteps } from '@/pages/Play/componets/uiTypes';
import { ModuleEnum } from '@/utils/config';
import { fetchModulesEnum, pageData } from '@/utils/somefunc';
import { ProColumns } from '@ant-design/pro-table/lib/typing';
import { Button, Tag } from 'antd';
import { TableRowSelection } from 'antd/es/table/interface';
import React, { FC, useEffect, useState } from 'react';

interface ISelfProps {
  projectId?: string;
  onSelect: (quote: boolean, selectedRowKeys: React.Key[]) => Promise<void>;
}

const Index: FC<ISelfProps> = ({ projectId, onSelect }) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectProjectId, setSelectProjectId] = useState<string | undefined>(
    projectId,
  );
  const [projectEnumMap, setProjectEnumMap] = useState<IObjGet>({});
  const [moduleEnum, setModuleEnum] = useState<IModuleEnum[]>([]);

  const fetchCommonStepPage = async (values: any, sort: any) => {
    const { code, data } = await pagePlaySteps({
      ...values,
      module_type: ModuleEnum.UI_STEP,
      is_common: true,
      sort: sort,
    });
    return pageData(code, data);
  };
  // 查询所有project 设置枚举
  useEffect(() => {
    queryProjectEnum(setProjectEnumMap).then();
  }, []);
  useEffect(() => {
    if (selectProjectId) {
      fetchModulesEnum(
        selectProjectId,
        ModuleEnum.UI_STEP,
        setModuleEnum,
      ).then();
    }
  }, [selectProjectId]);
  const commonColumns: ProColumns<IUICaseSteps>[] = [
    {
      title: '项目',
      dataIndex: 'project_id',
      hideInTable: true,
      valueType: 'select',
      valueEnum: projectEnumMap,
      initialValue: selectProjectId?.toString(),
      fieldProps: {
        onChange: (value: string) => {
          console.log(value);

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
        treeData: moduleEnum,
        fieldNames: {
          label: 'title',
        },
      },
    },
    {
      title: 'uid',
      valueType: 'text',
      dataIndex: 'uid',
      copyable: true,
      fixed: 'left',
      render: (_, record) => <Tag color={'blue'}>{_}</Tag>,
    },
    {
      title: 'name',
      valueType: 'text',
      dataIndex: 'name',
    },
    {
      title: 'desc',
      dataIndex: 'description',
      valueType: 'textarea',
      hideInSearch: true,
    },
    {
      title: 'create time',
      dataIndex: 'create_time',
      valueType: 'date',
      search: false,
      sorter: true,
    },
    {
      title: '创建人',
      dataIndex: 'creatorName',
      valueType: 'text',
    },
  ];

  const rowSelection: TableRowSelection<IUICaseSteps> = {
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
          <>
            <Button
              type={'primary'}
              onClick={() => onSelect(false, selectedRowKeys)}
            >
              复制添加
            </Button>
            <Button
              style={{ marginLeft: 5 }}
              onClick={() => onSelect(true, selectedRowKeys)}
            >
              引用添加
            </Button>
          </>
        );
      }}
      rowSelection={rowSelection}
      headerTitle={'UI Step Common'}
      columns={commonColumns}
      rowKey={'id'}
      request={fetchCommonStepPage}
    />
  );
};

export default Index;

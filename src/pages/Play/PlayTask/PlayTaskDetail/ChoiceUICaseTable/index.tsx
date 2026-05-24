import { IModuleEnum, IObjGet } from '@/api';
import { pagePlayCase } from '@/api/play/playCase';
import { insertAssociationPlayCasesByTaskId } from '@/api/play/playTask';
import { queryProjectEnum } from '@/components/CommonFunc';
import MyProTable from '@/components/Table/MyProTable';
import { IUICase } from '@/pages/Play/componets/uiTypes';
import { CONFIG, ModuleEnum } from '@/utils/config';
import { fetchModulesEnum, pageData } from '@/utils/somefunc';
import { history } from '@@/core/history';
import { ActionType, ProCard, ProColumns } from '@ant-design/pro-components';
import { Button, message, Tag } from 'antd';
import { TableRowSelection } from 'antd/es/table/interface';
import React, { FC, useCallback, useEffect, useRef, useState } from 'react';

interface SelfProps {
  currentTaskId?: string;
  callback: () => void;
}

const Index: FC<SelfProps> = ({ currentTaskId, callback }) => {
  const [selectProjectId, setSelectProjectId] = useState<number>();
  const [selectModuleId, setSelectModuleId] = useState<number>();
  const [projectEnumMap, setProjectEnumMap] = useState<IObjGet>({});
  const [moduleEnum, setModuleEnum] = useState<IModuleEnum[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const actionRef = useRef<ActionType>(); //Table action 的引用，便于自定义触发

  // 查询所有project 设置枚举
  useEffect(() => {
    queryProjectEnum(setProjectEnumMap).then();
  }, []);

  useEffect(() => {
    if (selectProjectId) {
      fetchModulesEnum(
        selectProjectId,
        ModuleEnum.UI_CASE,
        setModuleEnum,
      ).then();
    }
  }, [selectProjectId]);
  const columns: ProColumns<IUICase>[] = [
    {
      title: '项目',
      dataIndex: 'project_id',
      hideInTable: true,
      filters: true,
      onFilter: true,
      valueType: 'select',
      valueEnum: projectEnumMap,
      initialValue: selectProjectId,
      fieldProps: {
        onSelect: (value: number) => {
          setSelectProjectId(value);
          setSelectModuleId(undefined);
        },
      },
    },
    {
      title: '所属模块',
      dataIndex: 'module_id',
      hideInTable: true,
      valueType: 'treeSelect',
      initialValue: selectModuleId,
      fieldProps: {
        value: selectModuleId,
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
      title: '用例编号',
      dataIndex: 'uid',
      key: 'uid',
      width: '10%',
      render: (_, record) => (
        <a
          target="_blank"
          rel="noopener noreferrer"
          key="view"
          onClick={() => {
            history.push(`/ui/case/detail/caseId=${record.id}`);
          }}
        >
          {record.uid}
        </a>
      ),
    },
    {
      title: '名称',
      dataIndex: 'title',
      key: 'title',
      render: (_, record) => {
        return <span>{record.title}</span>;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueType: 'select',
      valueEnum: CONFIG.CASE_STATUS_ENUM,
      render: (_, record) => {
        return (
          <Tag color={CONFIG.RENDER_CASE_STATUS[record.status].color}>
            {CONFIG.RENDER_CASE_STATUS[record.status].text}
          </Tag>
        );
      },
    },
    {
      title: '创建人',
      dataIndex: 'creatorName',
    },
    {
      title: '创建时间',
      dataIndex: 'create_time',
      valueType: 'dateTime',
      sorter: true,
      search: false,
    },
  ];

  const rowSelection: TableRowSelection<IUICase> = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
  };

  const fetchUICases = useCallback(async (params: any, sort: any) => {
    const { code, data } = await pagePlayCase({
      ...params,
      module_type: ModuleEnum.UI_CASE,
      sort: sort,
    });
    return pageData(code, data);
  }, []);

  return (
    <ProCard>
      <MyProTable
        rowSelection={rowSelection}
        headerTitle={'UI用例表'}
        columns={columns}
        actionRef={actionRef}
        rowKey={'id'}
        request={fetchUICases}
        x={1000}
        // @ts-ignore
        tableAlertOptionRender={() => {
          return (
            <Button
              type={'primary'}
              onClick={async () => {
                if (currentTaskId) {
                  const { code, msg } =
                    await insertAssociationPlayCasesByTaskId({
                      taskId: parseInt(currentTaskId),
                      caseIdList: selectedRowKeys as number[],
                    });
                  if (code === 0) {
                    message.success(msg);
                    callback();
                  }
                }
              }}
            >
              确认添加
            </Button>
          );
        }}
      />
    </ProCard>
  );
};

export default Index;

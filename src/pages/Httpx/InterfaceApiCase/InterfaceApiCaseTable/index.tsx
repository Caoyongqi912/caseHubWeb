import {
  copyApiCase,
  pageInterApiCase,
  removeApiCase,
} from '@/api/inter/interCase';
import MyProTable from '@/components/Table/MyProTable';
import { IInterfaceAPICase } from '@/pages/Httpx/types';
import { CONFIG, ModuleEnum } from '@/utils/config';
import { pageData } from '@/utils/somefunc';
import { history } from '@@/core/history';
import { ActionType, ProColumns } from '@ant-design/pro-components';
import { Button, Divider, Popconfirm, Tag } from 'antd';
import { FC, useCallback, useEffect, useRef } from 'react';

interface SelfProps {
  currentProjectId?: number;
  currentModuleId?: number;
  perKey: string;
}

const Index: FC<SelfProps> = ({
  currentModuleId,
  currentProjectId,
  perKey,
}) => {
  const actionRef = useRef<ActionType>(); //Table action 的引用，便于自定义触发

  useEffect(() => {
    actionRef.current?.reload();
  }, [currentModuleId, currentProjectId]);
  const fetchInterfaceCase = useCallback(
    async (params: any, sort: any) => {
      const searchData = {
        ...params,
        module_id: currentModuleId,
        module_type: ModuleEnum.API_CASE,
        sort: sort,
      };
      const { code, data } = await pageInterApiCase(searchData);
      return pageData(code, data);
    },
    [currentModuleId],
  );
  const columns: ProColumns<IInterfaceAPICase>[] = [
    {
      title: '接口编号',
      dataIndex: 'uid',
      key: 'uid',
      fixed: 'left',
      width: '10%',
      copyable: true,
    },
    {
      title: '名称',
      dataIndex: 'title',
      key: 'title',
      fixed: 'left',
    },
    {
      title: '步骤数量',
      dataIndex: 'apiNum',
      valueType: 'text',
      render: (_, record) => {
        return <Tag color={'blue'}>{record.apiNum}</Tag>;
      },
    },
    {
      title: '优先级',
      dataIndex: 'level',
      valueType: 'select',
      valueEnum: CONFIG.API_LEVEL_ENUM,
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
    {
      title: '创建时间',
      dataIndex: 'create_time',
      valueType: 'dateTime',
      sorter: true,
      search: false,
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      fixed: 'right',
      render: (text, record, _) => {
        return (
          <>
            <a
              onClick={() => {
                history.push(
                  `/interface/caseApi/detail/caseApiId=${record.id}`,
                );
              }}
            >
              详情
            </a>
            <Divider type={'vertical'} />
            <a
              onClick={async () => {
                const { code } = await copyApiCase(record.id);
                if (code === 0) {
                  actionRef.current?.reload();
                }
              }}
            >
              复制
            </a>
            <Popconfirm
              title={'确认删除？'}
              okText={'确认'}
              cancelText={'点错了'}
              onConfirm={async () => {
                await removeApiCase(record.id).then(async ({ code }) => {
                  if (code === 0) {
                    actionRef.current?.reload();
                  }
                });
              }}
            >
              <Divider type={'vertical'} />
              <a>删除</a>
            </Popconfirm>
          </>
        );
      },
    },
  ];

  return (
    <MyProTable
      key={perKey}
      rowKey={'id'}
      actionRef={actionRef}
      x={1500}
      columns={columns}
      request={fetchInterfaceCase}
      toolBarRender={() => [
        <Button
          type={'primary'}
          onClick={() => {
            history.push('/interface/caseApi/detail');
          }}
        >
          添加
        </Button>,
      ]}
    />
  );
};
export default Index;

import {
  queryAssociationCasesByTaskId,
  removeAssociationCasesByTaskId,
  reorderAssociationCasesByTaskId,
} from '@/api/inter/interTask';
import MyDrawer from '@/components/MyDrawer';
import ChoiceApiCasesTable from '@/pages/Httpx/InterfaceApiCaseTask/InterfaceApiCaseTaskDetail/ChoiceApiCasesTable';
import { IInterfaceAPICase } from '@/pages/Httpx/types';
import { CONFIG } from '@/utils/config';
import { history } from '@@/core/history';
import {
  ActionType,
  DragSortTable,
  ProColumns,
} from '@ant-design/pro-components';
import { Button, Divider, message, Popconfirm, Tag } from 'antd';
import { FC, useCallback, useRef, useState } from 'react';

interface IInterfaceApiCaseTaskDetailProps {
  currentTaskId?: string;
  reload: () => void;
}

const AssociationCases: FC<IInterfaceApiCaseTaskDetailProps> = ({
  currentTaskId,
  reload,
}) => {
  const actionRef = useRef<ActionType>();
  const [choiceApiCaseOpen, setChoiceApiCaseOpen] = useState<boolean>(false);
  const queryCasesByTask = useCallback(async () => {
    if (currentTaskId) {
      const { code, data } = await queryAssociationCasesByTaskId({
        taskId: currentTaskId,
      });
      if (code === 0) {
        return {
          data: data,
          total: data.length,
          success: true,
        };
      }
      return {
        data: [],
        total: 0,
        success: false,
      };
    }
  }, [currentTaskId]);

  const handleDragSortEnd = async (
    _: number,
    __: number,
    newDataSource: IInterfaceAPICase[],
  ) => {
    const reorderCaseIds: number[] = newDataSource.map((item) => item.id);
    console.log('排序后的数据', newDataSource);
    if (currentTaskId) {
      const { code, msg } = await reorderAssociationCasesByTaskId({
        taskId: currentTaskId,
        caseIds: reorderCaseIds,
      });
      if (code === 0) {
        // 请求成功之后刷新列表
        actionRef.current?.reload();
        message.success(msg);
      }
    }
  };
  const columns: ProColumns<IInterfaceAPICase>[] = [
    {
      title: '排序',
      dataIndex: 'sort',
    },
    {
      title: '接口编号',
      dataIndex: 'uid',
      key: 'uid',
      width: '10%',
      copyable: true,
    },
    {
      title: '名称',
      dataIndex: 'title',
      key: 'title',
      width: '15%',
      render: (_, record) => <Tag color={'success'}>{record.title}</Tag>,
    },
    {
      title: 'API数量',
      dataIndex: 'apiNum',
      valueType: 'text',
      width: '10%',
      render: (_, record) => {
        return <Tag color={'blue'}>{record.apiNum}</Tag>;
      },
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
      width: '10%',
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
      width: '18%',
      render: (_, record) => {
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
            <Popconfirm
              title={'确认删除？'}
              okText={'确认'}
              cancelText={'点错了'}
              onConfirm={async () => {
                if (currentTaskId) {
                  await removeAssociationCasesByTaskId({
                    taskId: currentTaskId,
                    caseId: record.id,
                  }).then(async ({ code }) => {
                    if (code === 0) {
                      actionRef.current?.reload();
                    }
                  });
                }
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
    <>
      <MyDrawer
        name={''}
        open={choiceApiCaseOpen}
        setOpen={setChoiceApiCaseOpen}
      >
        <ChoiceApiCasesTable currentTaskId={currentTaskId} reload={reload} />
      </MyDrawer>
      <DragSortTable
        toolBarRender={() => [
          <Button type={'primary'} onClick={() => setChoiceApiCaseOpen(true)}>
            Choice Api Cases
          </Button>,
        ]}
        actionRef={actionRef}
        columns={columns}
        rowKey="id"
        search={false}
        pagination={false}
        // @ts-ignore
        request={queryCasesByTask}
        dragSortKey="sort"
        onDragSortEnd={handleDragSortEnd}
      />
    </>
  );
};

export default AssociationCases;

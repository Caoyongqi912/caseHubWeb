import {
  queryAssociationApisByTaskId,
  removeAssociationApisByTaskId,
  reorderAssociationApisByTaskId,
} from '@/api/inter/interTask';
import MyDrawer from '@/components/MyDrawer';
import InterfaceApiDetail from '@/pages/Httpx/Interface/InterfaceApiDetail';
import InterfaceCaseChoiceApiTable from '@/pages/Httpx/InterfaceApiCaseResult/InterfaceCaseChoiceApiTable';
import { IInterfaceAPI } from '@/pages/Httpx/types';
import { CONFIG } from '@/utils/config';
import { queryData } from '@/utils/somefunc';
import {
  ActionType,
  DragSortTable,
  ProColumns,
} from '@ant-design/pro-components';
import { Button, Divider, message, Popconfirm, Tag, Typography } from 'antd';
import { FC, useCallback, useRef, useState } from 'react';

interface IAssociationApisProps {
  currentProjectId?: number;
  currentTaskId?: string;
}

const { Text } = Typography;

const AssociationApis: FC<IAssociationApisProps> = ({
  currentTaskId,
  currentProjectId,
}) => {
  const actionRef = useRef<ActionType>();
  const [choiceApiOpen, setChoiceApiOpen] = useState<boolean>(false);
  const [apiLength, setApiLength] = useState(0);
  const queryApisByTask = useCallback(async () => {
    if (currentTaskId) {
      const { code, data } = await queryAssociationApisByTaskId(currentTaskId);
      setApiLength(data.length);
      return queryData(code, data);
    }
  }, [currentTaskId]);
  const [apiDetailDrawer, setApiDetailDrawer] = useState(false);
  const [currentAPIDetail, setCurrentAPIDetail] = useState<IInterfaceAPI>();

  const handleDragSortEnd = async (
    _: number,
    __: number,
    newDataSource: IInterfaceAPI[],
  ) => {
    const reorderIds: number[] = newDataSource.map((item) => item.id);
    if (currentTaskId) {
      const { code, msg } = await reorderAssociationApisByTaskId({
        taskId: currentTaskId,
        apiIds: reorderIds,
      });
      if (code === 0) {
        // 请求成功之后刷新列表
        actionRef.current?.reload();
        message.success(msg);
      }
    }
  };

  const columns: ProColumns<IInterfaceAPI>[] = [
    {
      title: '排序',
      dataIndex: 'sort',
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
      render: (_, record) => <Tag color={'success'}>{record.name}</Tag>,
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
      title: '操作',
      valueType: 'option',
      key: 'option',
      fixed: 'right',
      render: (_, record) => {
        return (
          <>
            <a
              onClick={() => {
                setCurrentAPIDetail(record);
                setApiDetailDrawer(true);
              }}
            >
              详情
            </a>
            <Divider type={'vertical'} />
            <Popconfirm
              title={'确认移除？'}
              okText={'确认'}
              cancelText={'点错了'}
              onConfirm={async () => {
                if (currentTaskId) {
                  const { code } = await removeAssociationApisByTaskId({
                    taskId: currentTaskId,
                    apiId: record.id,
                  });
                  if (code === 0) {
                    actionRef.current?.reload();
                  }
                }
              }}
            >
              <a>移除</a>
            </Popconfirm>
          </>
        );
      },
    },
  ];

  return (
    <>
      <MyDrawer
        name={'API用例选择'}
        open={choiceApiOpen}
        setOpen={setChoiceApiOpen}
      >
        <InterfaceCaseChoiceApiTable
          projectId={currentProjectId}
          currentTaskId={currentTaskId}
          refresh={() => actionRef.current?.reload}
        />
      </MyDrawer>
      <MyDrawer open={apiDetailDrawer} setOpen={setApiDetailDrawer}>
        <InterfaceApiDetail interfaceId={currentAPIDetail?.id} />
      </MyDrawer>
      <DragSortTable
        title={() => {
          return <Text type={'secondary'}>已关联接口：{apiLength}</Text>;
        }}
        toolBarRender={() => [
          <Button type={'primary'} onClick={() => setChoiceApiOpen(true)}>
            Choice Apis
          </Button>,
        ]}
        actionRef={actionRef}
        columns={columns}
        rowKey="id"
        search={false}
        pagination={{
          showQuickJumper: true,
          defaultPageSize: 10,
          showSizeChanger: true,
        }} // @ts-ignore
        request={queryApisByTask}
        dragSortKey="sort"
        onDragSortEnd={handleDragSortEnd}
      />
    </>
  );
};

export default AssociationApis;

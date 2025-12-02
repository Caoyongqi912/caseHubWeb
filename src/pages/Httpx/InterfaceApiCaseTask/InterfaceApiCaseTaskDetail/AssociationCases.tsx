import {
  queryAssociationCasesByTaskId,
  removeAssociationCasesByTaskId,
  reorderAssociationCasesByTaskId,
} from '@/api/inter/interTask';
import MyDrawer from '@/components/MyDrawer';
import InterfaceApiCaseDetail from '@/pages/Httpx/InterfaceApiCase/InterfaceApiCaseDetail';
import ChoiceApiCasesTable from '@/pages/Httpx/InterfaceApiCaseTask/InterfaceApiCaseTaskDetail/ChoiceApiCasesTable';
import { IInterfaceAPICase } from '@/pages/Httpx/types';
import { CONFIG } from '@/utils/config';
import { queryData } from '@/utils/somefunc';
import {
  ActionType,
  DragSortTable,
  ProColumns,
} from '@ant-design/pro-components';
import { Button, Divider, message, Popconfirm, Tag, Typography } from 'antd';
import { FC, useCallback, useRef, useState } from 'react';

const { Text } = Typography;

interface IInterfaceApiCaseTaskDetailProps {
  currentTaskId?: string;
  currentProjectId?: number;
}

const AssociationCases: FC<IInterfaceApiCaseTaskDetailProps> = ({
  currentProjectId,
  currentTaskId,
}) => {
  const actionRef = useRef<ActionType>();
  const [choiceApiCaseOpen, setChoiceApiCaseOpen] = useState<boolean>(false);
  const [caseDetailDrawerOpen, setCaseDetailDrawerOpen] = useState(false);
  const [currentCase, setCurrentCase] = useState<IInterfaceAPICase>();
  const [caseLength, setCaseLength] = useState(0);
  const queryCasesByTask = useCallback(async () => {
    if (currentTaskId) {
      const { code, data } = await queryAssociationCasesByTaskId({
        taskId: currentTaskId,
      });
      setCaseLength(data.length);
      return queryData(code, data);
    }
  }, [currentTaskId]);

  const handleDragSortEnd = async (
    _: number,
    __: number,
    newDataSource: IInterfaceAPICase[],
  ) => {
    const reorderCaseIds: number[] = newDataSource.map((item) => item.id);
    if (currentTaskId) {
      const { code, msg } = await reorderAssociationCasesByTaskId({
        taskId: currentTaskId,
        caseIds: reorderCaseIds,
      });
      if (code === 0) {
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
      copyable: true,
    },
    {
      title: '名称',
      dataIndex: 'title',
      key: 'title',
      render: (_, record) => <Tag color={'success'}>{record.title}</Tag>,
    },
    {
      title: 'API数量',
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
      title: '操作',
      valueType: 'option',
      key: 'option',
      fixed: 'right',
      render: (_, record) => {
        return (
          <>
            <a
              onClick={() => {
                setCurrentCase(record);
                setCaseDetailDrawerOpen(true);
              }}
            >
              详情
            </a>
            <Popconfirm
              title={'确认解除？'}
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
        width={'75%'}
        open={choiceApiCaseOpen}
        setOpen={setChoiceApiCaseOpen}
      >
        <ChoiceApiCasesTable
          currentProjectId={currentProjectId}
          currentTaskId={currentTaskId}
          reload={actionRef.current?.reload}
        />
      </MyDrawer>
      <MyDrawer
        name={currentCase?.title || ''}
        open={caseDetailDrawerOpen}
        setOpen={setCaseDetailDrawerOpen}
        width={'80%'}
      >
        <InterfaceApiCaseDetail
          interfaceCase={currentCase}
          hiddenRunButton={true}
        />
      </MyDrawer>
      <DragSortTable
        title={() => {
          return <Text type={'secondary'}>已关联业务流：{caseLength}</Text>;
        }}
        toolBarRender={() => [
          <Button type={'primary'} onClick={() => setChoiceApiCaseOpen(true)}>
            Choice Cases
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
        }}
        // @ts-ignore
        request={queryCasesByTask}
        dragSortKey="sort"
        onDragSortEnd={handleDragSortEnd}
      />
    </>
  );
};

export default AssociationCases;

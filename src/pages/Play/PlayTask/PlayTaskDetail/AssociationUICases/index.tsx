import {
  queryAssociationPlayCasesByTaskId,
  removeAssociationPlayCasesByTaskId,
  reorderAssociationPlayCasesByTaskId,
} from '@/api/play/playTask';
import MyDrawer from '@/components/MyDrawer';
import { IUICase } from '@/pages/Play/componets/uiTypes';
import ChoiceUICaseTable from '@/pages/Play/PlayTask/PlayTaskDetail/ChoiceUICaseTable';
import { CONFIG } from '@/utils/config';
import { queryData } from '@/utils/somefunc';
import { history } from '@@/core/history';
import {
  ActionType,
  DragSortTable,
  ProCard,
  ProColumns,
} from '@ant-design/pro-components';
import { Button, message, Tag } from 'antd';
import { FC, useCallback, useRef, useState } from 'react';

interface ISelfProps {
  currentTaskId?: string;
}

const Index: FC<ISelfProps> = ({ currentTaskId }) => {
  const [choiceUICaseOpen, setChoiceUICaseOpen] = useState<boolean>(false);
  const actionRef = useRef<ActionType>();
  const [refresh, setRefresh] = useState<number>(0);

  const queryUICasesByTask = useCallback(async () => {
    if (currentTaskId) {
      const { code, data } = await queryAssociationPlayCasesByTaskId({
        taskId: currentTaskId,
      });
      return queryData(code, data);
    }
  }, [currentTaskId]);

  const removeCase = async (id: number) => {
    if (currentTaskId) {
      const { code, msg } = await removeAssociationPlayCasesByTaskId({
        taskId: currentTaskId,
        caseId: id,
      });
      if (code === 0) {
        // 请求成功之后刷新列表
        actionRef.current?.reload();
        message.success(msg);
      }
    }
  };

  const handleDragSortEnd = async (
    _: number,
    __: number,
    newDataSource: IUICase[],
  ) => {
    const reorderCaseIds: number[] = newDataSource.map((item) => item.id);
    console.log('排序后的数据', newDataSource);
    if (currentTaskId) {
      const { code, msg } = await reorderAssociationPlayCasesByTaskId({
        taskId: parseInt(currentTaskId),
        caseIdList: reorderCaseIds,
      });
      if (code === 0) {
        // 请求成功之后刷新列表
        actionRef.current?.reload();
        message.success(msg);
      }
    }
  };
  const columns: ProColumns<IUICase>[] = [
    {
      title: '排序',
      dataIndex: 'sort',
    },
    {
      title: '用例编号',
      dataIndex: 'uid',
      key: 'uid',
      width: '10%',
      copyable: true,
      render: (_, record) => (
        <a
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
      copyable: true,
      render: (_, record) => {
        return <span>{record.title}</span>;
      },
    },
    {
      title: '优先级',
      dataIndex: 'level',
      valueType: 'select',
      valueEnum: CONFIG.API_LEVEL_ENUM,
      render: (_, record) => {
        return (
          <Tag color={CONFIG.RENDER_CASE_LEVEL[record.level].color}>
            {CONFIG.RENDER_CASE_LEVEL[record.level].text}
          </Tag>
        );
      },
    },
    {
      title: '步骤',
      dataIndex: 'step_num',
      valueType: 'text',
      render: (_, record) => {
        return <Tag>{record.step_num}</Tag>;
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
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      render: (_, record) => {
        return <a onClick={async () => await removeCase(record.id)}>移除</a>;
      },
    },
  ];

  const handelRefresh = () => {
    setChoiceUICaseOpen(false);
    actionRef.current?.reload();
    setRefresh(refresh + 1);
  };
  return (
    <ProCard style={{ padding: 0 }}>
      <MyDrawer
        name={'UI Cases'}
        open={choiceUICaseOpen}
        setOpen={setChoiceUICaseOpen}
      >
        <ChoiceUICaseTable
          currentTaskId={currentTaskId}
          callback={handelRefresh}
        />
      </MyDrawer>
      <DragSortTable
        toolBarRender={() => [
          <Button type={'primary'} onClick={() => setChoiceUICaseOpen(true)}>
            Choice UI Cases
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
        request={queryUICasesByTask}
        dragSortKey="sort"
        onDragSortEnd={handleDragSortEnd}
      />
    </ProCard>
  );
};

export default Index;

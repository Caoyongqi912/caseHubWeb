import {
  getAPILoop,
  queryLoopAPI,
  removerLoopAssociationAPI,
  reorderLoopAssociationAPI,
} from '@/api/inter/interCase';
import MyDrawer from '@/components/MyDrawer';
import InterfaceApiDetail from '@/pages/Httpx/Interface/InterfaceApiDetail';
import LoopForm from '@/pages/Httpx/InterfaceApiCase/InterfaceApiCaseDetail/contents/LoopProCard/LoopForm';
import InterfaceCaseChoiceApiTable from '@/pages/Httpx/InterfaceApiCaseResult/InterfaceCaseChoiceApiTable';
import {
  IInterfaceAPI,
  IInterfaceCaseContent,
  LoopContent,
} from '@/pages/Httpx/types';
import { CONFIG } from '@/utils/config';
import { queryData } from '@/utils/somefunc';
import { SelectOutlined } from '@ant-design/icons';
import {
  ActionType,
  DragSortTable,
  ProCard,
  ProColumns,
} from '@ant-design/pro-components';
import { Button, Dropdown, message, Space, Tag, Typography } from 'antd';
import { FC, useCallback, useEffect, useRef, useState } from 'react';

const LoopType: { [key: number]: string } = {
  1: '次数循环',
  2: '对象遍历',
  3: '条件循环',
};

const LoopSteps: FC<{
  caseContent: IInterfaceCaseContent;
  callback?: () => void;
  case_id: number;
  projectId?: number;
}> = ({ callback, caseContent, case_id, projectId }) => {
  const actionRef = useRef<ActionType>(); //Table action 的引用，便于自定义触发
  const [showAPIDetail, setShowAPIDetail] = useState(false);
  const [currentApiId, setCurrentApiId] = useState<number>();
  const [loopAPI, setLoopAPI] = useState<IInterfaceAPI[]>([]);
  const [choiceOpen, setChoiceOpen] = useState(false);
  const [openLoopModal, setOpenLoopModal] = useState(false);
  const [loop, setLoop] = useState<LoopContent>();
  useEffect(() => {
    if (!caseContent.target_id) return;
    getAPILoop(caseContent.target_id).then(async ({ code, data }) => {
      if (code === 0) setLoop(data);
    });
  }, [caseContent]);

  const columns: ProColumns<IInterfaceAPI>[] = [
    {
      title: '排序',
      dataIndex: 'sort',
      className: 'drag-visible',
      width: '5%',
    },
    {
      title: '接口编号',
      dataIndex: 'uid',
      key: 'uid',
      width: '10%',
      render: (_, record) => {
        return (
          <a
            onClick={() => {
              setCurrentApiId(record.id);
              setShowAPIDetail(true);
            }}
          >
            {record.uid}
          </a>
        );
      },
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: '15%',
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
      width: '10%',
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
      title: '操作',
      valueType: 'option',
      key: 'option',
      width: '10%',
      render: (_, record) => {
        return (
          <a onClick={async () => await removeAssociation(record.id)}>移除</a>
        );
      },
    },
  ];

  const reloadTable = () => {
    actionRef.current?.reload();
  };
  const fetchLoopAPIS = useCallback(async () => {
    const { code, data } = await queryLoopAPI(caseContent.target_id);
    return queryData(code, data, setLoopAPI);
  }, [caseContent]);

  const handleDragSortEnd = async (
    _: number,
    __: number,
    newDataSource: IInterfaceAPI[],
  ) => {
    setLoopAPI(newDataSource);
    const reorderIds: number[] = newDataSource.map((item) => item.id);
    await reorderLoopAssociationAPI({
      interface_id_list: reorderIds,
      loop_id: caseContent.target_id,
    });
  };

  const removeAssociation = async (apiId: number) => {
    const { code, msg } = await removerLoopAssociationAPI({
      interface_id: apiId,
      loop_id: caseContent.target_id,
    });
    if (code === 0) {
      message.success(msg);
      reloadTable();
    }
  };

  const TitleRender = (
    <Space>
      <Typography.Link strong onClick={() => setOpenLoopModal(true)}>
        {LoopType[loop?.loop_type!]}
      </Typography.Link>
      {loop?.loop_type === 1 ? (
        <Typography.Text type={'secondary'}>
          x {loop.loop_times} 次
        </Typography.Text>
      ) : loop?.loop_type === 2 ? (
        <Space>
          <Typography.Text code={true}>{loop.loop_item_key}</Typography.Text>
          <Typography.Text type={'secondary'} ellipsis={true}>
            {loop.loop_items}
          </Typography.Text>
        </Space>
      ) : (
        <Typography.Text>条件循环</Typography.Text>
      )}
    </Space>
  );

  return (
    <>
      <LoopForm
        case_id={case_id}
        loop_info={loop}
        open={openLoopModal}
        setOpen={setOpenLoopModal}
        callback={reloadTable}
      />
      <MyDrawer width={'75%'} open={showAPIDetail} setOpen={setShowAPIDetail}>
        <InterfaceApiDetail interfaceId={currentApiId} callback={reloadTable} />
        ;
      </MyDrawer>
      <MyDrawer open={choiceOpen} setOpen={setChoiceOpen}>
        <InterfaceCaseChoiceApiTable
          projectId={projectId}
          currentCaseApiId={case_id}
          loop_id={caseContent.target_id}
          refresh={() => {
            setChoiceOpen(false);
            reloadTable();
          }}
        />
      </MyDrawer>
      <ProCard
        style={{ padding: 8 }}
        actions={
          <Dropdown
            arrow
            menu={{
              items: [
                {
                  key: 'choice_common',
                  label: '选择公共API',
                  icon: <SelectOutlined style={{ color: 'blue' }} />,
                  onClick: () => setChoiceOpen(true),
                },
              ],
            }}
            placement="top"
          >
            <Button>添加</Button>
          </Dropdown>
        }
      >
        <DragSortTable
          headerTitle={TitleRender}
          actionRef={actionRef}
          columns={columns}
          options={false}
          rowKey="id"
          request={fetchLoopAPIS}
          search={false}
          pagination={false}
          dataSource={loopAPI}
          dragSortKey="sort"
          onDragSortEnd={handleDragSortEnd}
        />
      </ProCard>
    </>
  );
};

export default LoopSteps;

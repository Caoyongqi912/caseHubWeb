import {
  getAPILoop,
  queryLoopAPI,
  removerLoopAssociationAPI,
  reorderLoopAssociationAPI,
  selectCommonAPI2LoopAPI,
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
import { PlusOutlined, SelectOutlined } from '@ant-design/icons';
import {
  ActionType,
  DragSortTable,
  ProCard,
  ProColumns,
} from '@ant-design/pro-components';
import { Button, Dropdown, message, Space, Tag, theme, Typography } from 'antd';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';

const { useToken } = theme;

const LoopType: { [key: number]: string } = {
  1: '次数循环',
  2: '对象遍历',
  3: '条件循环',
};

interface LoopStepsProps {
  caseContent: IInterfaceCaseContent;
  callback?: () => void;
  case_id: number;
  projectId?: number;
  isExpanded?: boolean;
}

/**
 * 循环步骤组件
 * 展示和管理循环内的接口列表，支持拖拽排序和条件循环配置
 */
const LoopSteps: FC<LoopStepsProps> = ({
  callback,
  caseContent,
  case_id,
  projectId,
  isExpanded,
}) => {
  const { token } = useToken();
  const actionRef = useRef<ActionType>();
  const [showAPIDetail, setShowAPIDetail] = useState(false);
  const [currentApiId, setCurrentApiId] = useState<number>();
  const [loopAPI, setLoopAPI] = useState<IInterfaceAPI[]>([]);
  const [choiceOpen, setChoiceOpen] = useState(false);
  const [openLoopModal, setOpenLoopModal] = useState(false);
  const [loop, setLoop] = useState<LoopContent>();
  const hasLoadedRef = useRef(false);

  /**
   * 根据 isExpanded 状态加载循环详情
   * @description 只有在卡片展开且数据未加载时才获取循环详情
   */
  useEffect(() => {
    if (!isExpanded || !caseContent.target_id || hasLoadedRef.current) return;
    hasLoadedRef.current = true;
    getAPILoop(caseContent.target_id).then(({ code, data }) => {
      if (code === 0) setLoop(data);
    });
  }, [isExpanded, caseContent.target_id]);

  /**
   * 重新加载表格数据
   * @description 刷新表格数据并更新循环详情
   */
  const reloadTable = useCallback(() => {
    actionRef.current?.reload();
    if (caseContent.target_id) {
      getAPILoop(caseContent.target_id).then(({ code, data }) => {
        if (code === 0) setLoop(data);
      });
    }
  }, [caseContent.target_id]);

  /**
   * 获取循环内的接口列表
   * @description 从服务端获取循环关联的接口列表
   */
  const fetchLoopAPIS = useCallback(async () => {
    const { code, data } = await queryLoopAPI(caseContent.target_id);
    return queryData(code, data, setLoopAPI);
  }, [caseContent.target_id]);

  /**
   * 拖拽排序结束处理
   * @description 更新本地状态并同步排序结果到服务器
   * @param _draggedId - 拖拽行的索引
   * @param _targetIndex - 目标位置的索引
   * @param newDataSource - 排序后的新数据源
   */
  const handleDragSortEnd = useCallback(
    async (
      _draggedId: number,
      _targetIndex: number,
      newDataSource: IInterfaceAPI[],
    ) => {
      setLoopAPI(newDataSource);
      const reorderIds: number[] = newDataSource.map((item) => item.id);
      await reorderLoopAssociationAPI({
        interface_id_list: reorderIds,
        loop_id: caseContent.target_id,
      });
    },
    [caseContent.target_id],
  );

  /**
   * 移除接口与循环的关联
   * @description 从循环中移除指定的接口关联
   * @param apiId - 要移除的接口ID
   */
  const handleRemoveAssociation = useCallback(
    async (apiId: number) => {
      const { code, msg } = await removerLoopAssociationAPI({
        interface_id: apiId,
        loop_id: caseContent.target_id,
      });
      if (code === 0) {
        message.success(msg);
        reloadTable();
      }
    },
    [caseContent.target_id, reloadTable],
  );

  /**
   * 选择接口添加到循环
   * @description 将选中的接口关联到当前循环
   * @param values - 选中的接口ID列表
   * @param copy - 是否复制模式
   */
  const handleSelectInterface2Loop = useCallback(
    async (values: number[], copy: boolean) => {
      const { code, msg } = await selectCommonAPI2LoopAPI({
        loop_id: caseContent.target_id,
        copy,
        interface_id_list: values,
      });
      if (code === 0) {
        message.success(msg);
        setChoiceOpen(false);
        reloadTable();
      }
    },
    [caseContent.target_id, reloadTable],
  );

  /**
   * 表格列配置
   * @description 定义接口列表表格的列信息
   */
  const columns: ProColumns<IInterfaceAPI>[] = useMemo(
    () => [
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
        render: (_, record) => (
          <a
            onClick={() => {
              setCurrentApiId(record.id);
              setShowAPIDetail(true);
            }}
            style={{ color: '#ca8a04', fontWeight: 500 }}
          >
            {record.uid}
          </a>
        ),
      },
      {
        title: '名称',
        dataIndex: 'interface_name',
        key: 'interface_name',
        ellipsis: true,
      },
      {
        title: '优先级',
        dataIndex: 'interface_level',
        valueType: 'select',
        valueEnum: CONFIG.API_LEVEL_ENUM,
        render: (_, record) => (
          <Tag
            style={{
              background: 'rgba(202, 138, 4, 0.1)',
              color: '#ca8a04',
              border: '1px solid rgba(202, 138, 4, 0.2)',
              borderRadius: '4px',
            }}
          >
            {record.interface_level}
          </Tag>
        ),
      },
      {
        title: '标签',
        dataIndex: 'is_common',
        key: 'is_common',
        render: (_, record) =>
          record.is_common ? (
            <Tag color="green">公共</Tag>
          ) : (
            <Tag color="red">私有</Tag>
          ),
      },
      {
        title: '创建人',
        dataIndex: 'creatorName',
        render: (_, record) => (
          <Tag style={{ borderRadius: '4px' }}>{record.creatorName}</Tag>
        ),
      },
      {
        title: '操作',
        valueType: 'option',
        key: 'option',
        width: '10%',
        render: (_, record) => (
          <a
            onClick={async () => await handleRemoveAssociation(record.id)}
            style={{ color: '#ef4444' }}
          >
            移除
          </a>
        ),
      },
    ],
    [handleRemoveAssociation],
  );

  /**
   * 表格标题渲染
   * @description 根据循环类型展示不同的配置信息
   */
  const titleRender = useMemo(
    () => (
      <Space>
        <Typography.Link
          strong
          onClick={() => setOpenLoopModal(true)}
          style={{
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          {LoopType[loop?.loop_type!]}
        </Typography.Link>
        {loop?.loop_type === 1 && (
          <Space size="small" style={{ marginLeft: '8px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 8px',
                background:
                  'linear-gradient(135deg, rgba(202, 138, 4, 0.12) 0%, rgba(161, 98, 7, 0.08) 100%)',
                border: '1px solid rgba(202, 138, 4, 0.25)',
                borderRadius: '6px',
                fontSize: '12px',
                color: '#ca8a04',
                fontWeight: 600,
              }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                <polyline points="17 6 23 6 23 12"></polyline>
              </svg>
              ×{loop.loop_times}
            </span>
            <span
              style={{
                fontSize: '12px',
                color: 'rgba(0, 0, 0, 0.45)',
                fontWeight: 400,
              }}
            >
              次
            </span>
          </Space>
        )}
        {loop?.loop_type === 2 && (
          <Space size="small" style={{ marginLeft: '8px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 8px',
                background:
                  'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(22, 163, 74, 0.08) 100%)',
                border: '1px solid rgba(34, 197, 94, 0.2)',
                borderRadius: '6px',
                fontSize: '11px',
                color: '#16a34a',
                fontWeight: 600,
                fontFamily: 'Monaco, "Courier New", monospace',
              }}
            >
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              </svg>
              {loop.loop_item_key}
            </span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(0, 0, 0, 0.3)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
            <span
              style={{
                fontSize: '12px',
                color: 'rgba(0, 0, 0, 0.55)',
                maxWidth: '120px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                display: 'inline-block',
                fontFamily: 'Monaco, "Courier New", monospace',
              }}
            >
              {loop.loop_items}
            </span>
          </Space>
        )}
        {loop?.loop_type === 3 && (
          <Space size="small" style={{ marginLeft: '8px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 8px',
                background:
                  'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(147, 51, 234, 0.08) 100%)',
                border: '1px solid rgba(168, 85, 247, 0.2)',
                borderRadius: '6px',
                fontSize: '12px',
                color: '#9333ea',
                fontWeight: 600,
              }}
            >
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
              条件循环
            </span>
          </Space>
        )}
      </Space>
    ),
    [loop],
  );

  /**
   * 下拉菜单配置
   * @description 提供添加接口的下拉菜单选项
   */
  const dropdownItems = useMemo(
    () => [
      {
        key: 'choice_common',
        label: '选择公共API',
        icon: <SelectOutlined style={{ color: '#ca8a04' }} />,
        onClick: () => setChoiceOpen(true),
      },
    ],
    [],
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
      </MyDrawer>
      <MyDrawer open={choiceOpen} setOpen={setChoiceOpen}>
        <InterfaceCaseChoiceApiTable
          projectId={projectId}
          onSelect={handleSelectInterface2Loop}
        />
      </MyDrawer>
      <ProCard
        style={{
          padding: '16px 20px',
          background: token.colorBgContainer,
          borderRadius: '0 0 16px 16px',
        }}
        extra={
          <Dropdown
            arrow
            menu={{ items: dropdownItems }}
            placement="bottomRight"
          >
            <Button
              type="primary"
              icon={<PlusOutlined />}
              style={{
                background: 'linear-gradient(135deg, #ca8a04 0%, #a16207 100%)',
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(202, 138, 4, 0.35)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              添加接口
            </Button>
          </Dropdown>
        }
      >
        <DragSortTable
          headerTitle={titleRender}
          actionRef={actionRef}
          columns={columns}
          rowKey="id"
          request={fetchLoopAPIS}
          search={false}
          pagination={false}
          dataSource={loopAPI}
          dragSortKey="sort"
          onDragSortEnd={handleDragSortEnd}
          style={{
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        />
      </ProCard>
    </>
  );
};

export default LoopSteps;

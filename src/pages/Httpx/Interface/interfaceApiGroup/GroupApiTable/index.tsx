import {
  insertInterfaceGroup,
  pageInterfaceGroup,
  removeInterfaceGroup,
  updateInterfaceGroup,
} from '@/api/inter/interGroup';
import { useGlassStyles } from '@/components/Glass';
import MyDrawer from '@/components/MyDrawer';
import GroupApiDetail from '@/pages/Httpx/Interface/interfaceApiGroup/GroupApiDetail';
import { IInterfaceGroup } from '@/pages/Httpx/types';
import { ModuleEnum } from '@/utils/config';
import { pageData } from '@/utils/somefunc';
import { useModel } from '@@/exports';
import { ActionType, ProCard, ProTable } from '@ant-design/pro-components';
import { Form, message } from 'antd';
import { FC, useCallback, useEffect, useRef, useState } from 'react';
import AddGroupButton from './AddGroupButton';
import MoveGroupModal from './MoveGroupModal';
import { useColumns } from './useColumns';

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
  const styles = useGlassStyles();
  const actionRef = useRef<ActionType>();
  const [currentGroupId, setCurrentGroupId] = useState<number>();
  const [openModal, setOpenModal] = useState(false);
  const [groupForm] = Form.useForm<IInterfaceGroup>();
  const { initialState } = useModel('@@initialState');
  const projects = initialState?.projects || [];
  const [openGroupAssociation, setOpenGroupAssociation] = useState(false);

  useEffect(() => {
    actionRef.current?.reload();
    groupForm.setFieldsValue({
      project_id: currentProjectId,
      module_id: currentModuleId,
    });
  }, [currentModuleId, currentProjectId, groupForm]);

  /**
   * 保存接口组基本信息（新增/编辑）
   */
  const saveBaseInfo = useCallback(
    async (values: IInterfaceGroup) => {
      const api = currentGroupId
        ? updateInterfaceGroup({ ...values, id: currentGroupId })
        : insertInterfaceGroup(values);
      const { code, msg } = await api;
      if (code === 0) {
        actionRef.current?.reload();
        message.success(msg);
      }
      return true;
    },
    [currentGroupId],
  );

  /**
   * 删除接口组
   */
  const handleDeleteGroup = useCallback(async (id: number) => {
    const { code, msg } = await removeInterfaceGroup(id);
    if (code === 0) {
      message.success(msg || '删除成功');
      actionRef.current?.reload();
    }
  }, []);

  /**
   * 获取接口组列表数据
   */
  const fetchInterfaceGroup = useCallback(
    async (params: any) => {
      try {
        const { code, data } = await pageInterfaceGroup({
          ...params,
          module_id: currentModuleId,
          module_type: ModuleEnum.API,
        });
        return pageData(code, data);
      } catch {
        return { success: false, data: [] };
      }
    },
    [currentModuleId],
  );

  /**
   * 查看接口组详情
   */
  const handleViewDetail = useCallback((record: IInterfaceGroup) => {
    setCurrentGroupId(record.id);
    setOpenGroupAssociation(true);
  }, []);

  /**
   * 打开移动接口组弹窗
   */
  const handleMoveGroup = useCallback((record: IInterfaceGroup) => {
    setCurrentGroupId(record.id);
    setOpenModal(true);
  }, []);

  /**
   * 移动成功后的回调
   */
  const handleMoveSuccess = useCallback(() => {
    setOpenModal(false);
    actionRef.current?.reload();
  }, []);

  const columns = useColumns({
    styles,
    groupForm,
    actionRef,
    onSaveBaseInfo: saveBaseInfo,
    onViewDetail: handleViewDetail,
    onMoveGroup: handleMoveGroup,
    onDeleteGroup: handleDeleteGroup,
  });

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <MyDrawer
        open={openGroupAssociation}
        setOpen={setOpenGroupAssociation}
        width="80%"
      >
        <GroupApiDetail groupId={currentGroupId} projectId={currentProjectId} />
      </MyDrawer>

      <MoveGroupModal
        open={openModal}
        groupId={currentGroupId}
        projects={projects}
        onCancel={() => setOpenModal(false)}
        onSuccess={handleMoveSuccess}
      />

      <ProCard
        headerBordered
        bordered
        style={{
          flex: 1,
          minHeight: 'calc(100vh - 200px)', // 占满父容器
          height: 'calc(100vh - 200px)', // 占满父容器

          display: 'flex',
          flexDirection: 'column',
        }}
        styles={{
          body: {
            padding: '12px',
            height: '100%',
          },
        }}
      >
        <ProTable
          persistenceKey={perKey}
          columns={columns}
          rowKey="id"
          // 🔥 核心：高度填充满父容器，表格内部滚动
          style={{ height: '100%' }}
          scroll={{
            x: 1200,
            y: 'calc(100vh - 450px)', // 🔥 自适应屏幕高度，表格内部滚动
          }}
          actionRef={actionRef}
          request={fetchInterfaceGroup}
          pagination={{
            showQuickJumper: true,
            defaultPageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
          search={{ defaultCollapsed: true, labelWidth: 'auto' }}
          toolBarRender={() => [
            <AddGroupButton
              key="add"
              form={groupForm}
              currentModuleId={currentModuleId}
              onFinish={saveBaseInfo}
              onClick={() => setCurrentGroupId(undefined)}
            />,
          ]}
        />
      </ProCard>
    </div>
  );
};

export default Index;

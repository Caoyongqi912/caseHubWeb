import { IModuleEnum } from '@/api';
import { updateInterfaceGroup } from '@/api/inter/interGroup';
import { ModuleEnum } from '@/utils/config';
import { fetchModulesEnum } from '@/utils/somefunc';
import {
  ProForm,
  ProFormSelect,
  ProFormTreeSelect,
} from '@ant-design/pro-components';
import { Form, message, Modal } from 'antd';
import { FC, useCallback, useEffect, useState } from 'react';

interface MoveGroupModalProps {
  open: boolean;
  groupId?: number;
  projects: { label: string; value: number }[];
  onCancel: () => void;
  onSuccess: () => void;
}

const MoveGroupModal: FC<MoveGroupModalProps> = ({
  open,
  groupId,
  projects,
  onCancel,
  onSuccess,
}) => {
  const [moveForm] = Form.useForm();
  const [moduleEnum, setModuleEnum] = useState<IModuleEnum[]>([]);
  const [copyProjectId, setCopyProjectId] = useState<number>();

  useEffect(() => {
    if (copyProjectId) {
      fetchModulesEnum(copyProjectId, ModuleEnum.API, setModuleEnum).then();
    }
  }, [copyProjectId]);

  useEffect(() => {
    if (!open) {
      moveForm.resetFields();
      setModuleEnum([]);
      setCopyProjectId(undefined);
    }
  }, [open, moveForm]);

  const handleOk = useCallback(async () => {
    if (!groupId) return;
    const values = await moveForm.validateFields();
    const { code, msg } = await updateInterfaceGroup({
      id: groupId,
      ...values,
    });
    if (code === 0) {
      message.success(msg);
      onSuccess();
    }
  }, [groupId, moveForm, onSuccess]);

  return (
    <Modal
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      title={<span style={{ fontWeight: 600 }}>移动接口组</span>}
    >
      <ProForm submitter={false} form={moveForm}>
        <ProFormSelect
          width="md"
          options={projects}
          label="项目"
          name="project_id"
          required
          onChange={(value) => setCopyProjectId(value as number)}
        />
        <ProFormTreeSelect
          required
          name="module_id"
          label="模块"
          rules={[{ required: true, message: '所属模块必选' }]}
          fieldProps={{
            treeData: moduleEnum,
            fieldNames: { label: 'title' },
            filterTreeNode: true,
          }}
          width="md"
        />
      </ProForm>
    </Modal>
  );
};

export default MoveGroupModal;

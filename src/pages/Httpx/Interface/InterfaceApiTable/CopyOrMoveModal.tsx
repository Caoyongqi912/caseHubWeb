import { IModuleEnum } from '@/api';
import { copyApiTo, updateInterApiById } from '@/api/inter';
import { ModuleEnum } from '@/utils/config';
import { fetchModulesEnum } from '@/utils/somefunc';
import { useModel } from '@@/exports';
import {
  ActionType,
  ProForm,
  ProFormSelect,
  ProFormTreeSelect,
} from '@ant-design/pro-components';
import { Form, message, Modal } from 'antd';
import { useCallback, useEffect, useState } from 'react';

interface CopyOrMoveModalProps {
  open: boolean;
  currentApiId: number | undefined;
  copyOrMove: number;
  actionRef: React.RefObject<ActionType | undefined>;
  onCancel: () => void;
}

const CopyOrMoveModal: React.FC<CopyOrMoveModalProps> = ({
  open,
  currentApiId,
  copyOrMove,
  actionRef,
  onCancel,
}) => {
  const [copyForm] = Form.useForm();
  const [copyProjectId, setCopyProjectId] = useState<number>();
  const [moduleEnum, setModuleEnum] = useState<IModuleEnum[]>([]);
  const { initialState } = useModel('@@initialState');
  const projects = initialState?.projects || [];

  useEffect(() => {
    if (copyProjectId) {
      fetchModulesEnum(copyProjectId, ModuleEnum.API, setModuleEnum).then();
    }
  }, [copyProjectId]);

  const handleOk = useCallback(async () => {
    try {
      const values = await copyForm.validateFields();
      if (!currentApiId) return;
      const response =
        copyOrMove === 1
          ? await copyApiTo({
              interface_id: currentApiId,
              project_id: values.project_id,
              module_id: values.module_id,
            })
          : await updateInterApiById({
              id: currentApiId,
              project_id: values.project_id,
              module_id: values.module_id,
            });
      if (response?.code === 0) {
        message.success(response.msg);
        copyForm.resetFields();
        onCancel();
        actionRef.current?.reload();
      }
    } catch (error) {
      console.error('操作失败:', error);
    }
  }, [copyForm, currentApiId, copyOrMove, actionRef, onCancel]);

  return (
    <Modal
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      title={
        <span style={{ fontWeight: 600 }}>
          {copyOrMove === 1 ? '复制接口' : '移动接口'}
        </span>
      }
      width={600}
    >
      <ProForm submitter={false} form={copyForm} layout="vertical">
        <ProFormSelect
          width="md"
          options={projects}
          label="项目"
          name="project_id"
          required
          onChange={(value) => setCopyProjectId(value as number)}
          fieldProps={{ placeholder: '请选择目标项目' }}
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
            placeholder: '请选择目标模块',
          }}
          width="md"
        />
      </ProForm>
    </Modal>
  );
};

export default CopyOrMoveModal;

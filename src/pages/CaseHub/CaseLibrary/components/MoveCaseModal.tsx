import { updateTestCase } from '@/api/case/testCase';
import { ITestCase } from '@/pages/CaseHub/types';
import {
  ProForm,
  ProFormSelect,
  ProFormTreeSelect,
} from '@ant-design/pro-components';
import { Form, message, Modal } from 'antd';
import { FC } from 'react';

interface Props {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  currentCaseId?: number;
  projects: { label: string; value: number }[];
  moduleEnum: { title: string; value: number; children?: any[] }[];
  onProjectChange: (projectId: number) => void;
}

const MoveCaseModal: FC<Props> = ({
  open,
  onCancel,
  onSuccess,
  currentCaseId,
  projects,
  moduleEnum,
  onProjectChange,
}) => {
  const [moveForm] = Form.useForm();

  const handleOk = async () => {
    try {
      const values = await moveForm.validateFields();
      if (!currentCaseId) return;
      const response = await updateTestCase({
        id: currentCaseId,
        project_id: values.project_id,
        module_id: values.module_id,
      } as ITestCase);
      if (response?.code === 0) {
        message.success(response.msg);
        moveForm.resetFields();
        onSuccess();
      }
    } catch (error) {
      console.error('操作失败:', error);
    }
  };

  return (
    <Modal
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      title={<span style={{ fontWeight: 600 }}>{'移动用例'}</span>}
      width={600}
    >
      <ProForm submitter={false} form={moveForm} layout="vertical">
        <ProFormSelect
          width="md"
          options={projects}
          label="项目"
          name="project_id"
          required
          onChange={(value) => onProjectChange(value as number)}
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

export default MoveCaseModal;

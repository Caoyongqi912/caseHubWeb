import { uploadTestCase } from '@/api/case/testCase';
import {
  ModalForm,
  ProCard,
  ProFormUploadDragger,
} from '@ant-design/pro-components';
import { Form } from 'antd';
import { FC, useCallback } from 'react';

interface UploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  uploadProps?: {
    reqId?: string;
    moduleId?: string;
    projectId?: string;
  };
  onUploadFinish: () => void;
}

const UploadModal: FC<UploadModalProps> = ({
  open,
  onOpenChange,
  uploadProps,
  onUploadFinish,
}) => {
  const [form] = Form.useForm();

  const handleUploadCase = useCallback(
    async (values: any) => {
      const formData = new FormData();
      const fileValue = values.file;
      formData.append('file', fileValue[0].originFileObj);
      formData.append('module_id', uploadProps?.moduleId || '');
      formData.append('requirement_id', uploadProps?.reqId || '');
      formData.append('project_id', uploadProps?.projectId || '');

      const { code } = await uploadTestCase(formData);
      if (code === 0) {
        onUploadFinish();
      }
      form.resetFields();
      return true;
    },
    [uploadProps, onUploadFinish, form],
  );

  return (
    <ModalForm
      form={form}
      modalProps={{ destroyOnClose: true }}
      open={open}
      onOpenChange={onOpenChange}
      title="上传用例附件"
      onFinish={handleUploadCase}
    >
      <ProCard>
        <ProFormUploadDragger
          title={false}
          max={1}
          description="上传文件"
          accept=".xlsx,.xls"
          name="file"
        />
      </ProCard>
    </ModalForm>
  );
};

export default UploadModal;

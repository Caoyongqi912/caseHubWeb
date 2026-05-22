/**
 * 用例附件上传弹窗组件
 */
import { uploadTestCase } from '@/api/case/testCase';
import {
  ModalForm,
  ProCard,
  ProFormUploadDragger,
} from '@ant-design/pro-components';
import { Form } from 'antd';
import { FC, useCallback } from 'react';

/**
 * UploadModal 组件属性
 */
interface UploadModalProps {
  /** 是否打开弹窗 */
  open: boolean;
  /** 弹窗状态变更回调 */
  onOpenChange: (open: boolean) => void;
  /** 上传相关参数 */
  uploadProps?: {
    reqId?: string;
    moduleId?: string;
    projectId?: string;
  };
  /** 上传完成回调 */
  onUploadFinish: () => void;
}

/**
 * 用例附件上传弹窗组件
 * @param props - 组件属性
 */
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
      modalProps={{ destroyOnHidden: true }}
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

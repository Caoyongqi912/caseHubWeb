import { IModuleEnum } from '@/api';
import { uploadTestCase } from '@/api/case/testCase';
import { UploadOutlined } from '@ant-design/icons';
import {
  ModalForm,
  ProForm,
  ProFormSelect,
  ProFormTreeSelect,
  ProFormUploadDragger,
} from '@ant-design/pro-components';
import { Button, Form, message } from 'antd';
import { FC } from 'react';

interface Props {
  projects: { label: string; value: number }[];
  moduleEnum: IModuleEnum[];
  onProjectChange: (projectId: number) => void;
  currentProjectId?: number;
  onSuccess: () => void;
}

const UploadCaseModal: FC<Props> = ({
  projects,
  moduleEnum,
  onProjectChange,
  currentProjectId,
  onSuccess,
}) => {
  const [uploadForm] = Form.useForm();

  const uploadCase = async (values: any) => {
    const formData = new FormData();
    const fileValue = values.file;
    formData.append('file', fileValue[0].originFileObj);
    formData.append('project_id', values.project_id);
    formData.append('module_id', values.module_id);
    formData.append('is_common', true.toString());
    const { code } = await uploadTestCase(formData);
    if (code === 0) {
      message.success('上传成功');
    }
    uploadForm.resetFields();
    onSuccess();
    return true;
  };

  return (
    <ModalForm
      form={uploadForm}
      trigger={
        <Button key="upload" type="primary">
          <UploadOutlined />
          上传
        </Button>
      }
      title={'上传用例'}
      onFinish={uploadCase}
    >
      <ProForm.Group>
        <ProFormSelect
          label={'所属项目'}
          options={projects}
          name={'project_id'}
          width={'md'}
          required={true}
          rules={[{ required: true, message: '请选择项目' }]}
          fieldProps={{
            variant: 'filled',
            onChange: (value) => {
              onProjectChange(value as number);
            },
          }}
        />
        <ProFormTreeSelect
          required
          name="module_id"
          label="所属模块"
          width={'md'}
          rules={[{ required: true, message: '所属模块必选' }]}
          fieldProps={{
            variant: 'filled',
            treeData: moduleEnum,
            fieldNames: {
              label: 'title',
              value: 'value',
            },
            filterTreeNode: true,
          }}
        />
      </ProForm.Group>
      <ProFormUploadDragger
        title={false}
        max={1}
        description="上传文件"
        width={'md'}
        accept=".xlsx,.xls"
        name="file"
      />
    </ModalForm>
  );
};

export default UploadCaseModal;

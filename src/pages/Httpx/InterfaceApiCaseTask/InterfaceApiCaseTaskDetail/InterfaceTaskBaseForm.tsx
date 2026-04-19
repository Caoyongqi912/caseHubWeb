import {
  ProForm,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';

import { CONFIG } from '@/utils/config';

const InterfaceTaskBaseForm = () => {
  const { API_LEVEL_SELECT } = CONFIG;

  return (
    <>
      <ProFormText hidden width={'md'} label={'所属项目'} name={'project_id'} />
      <ProFormText hidden required name="module_id" label="所属模块" />
      <ProForm.Group>
        <ProFormText
          width={'md'}
          name="interface_task_title"
          label="任务标题"
          required={true}
          rules={[{ required: true, message: '用例标题必填' }]}
        />
        <ProFormSelect
          name="interface_task_level"
          label="优先级"
          width={'md'}
          initialValue={'P1'}
          options={API_LEVEL_SELECT}
          required={true}
          rules={[{ required: true, message: '用例优先级必选' }]}
        />
      </ProForm.Group>

      <ProForm.Group>
        <ProFormTextArea
          width={'lg'}
          name="interface_task_desc"
          label="用例描述"
          required={true}
          rules={[{ required: true, message: '用例描述必填' }]}
        />
      </ProForm.Group>
    </>
  );
};

export default InterfaceTaskBaseForm;

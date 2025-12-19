import { CONFIG } from '@/utils/config';
import {
  ProForm,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';

const PlayBaseForm = () => {
  const { API_LEVEL_SELECT, API_STATUS_SELECT } = CONFIG;
  return (
    <>
      <ProFormText
        width={'lg'}
        name="title"
        label="用例标题"
        required={true}
        rules={[{ required: true, message: '用例标题必填' }]}
      />
      <ProForm.Group>
        <ProFormSelect
          name="level"
          label="优先级"
          width={'md'}
          initialValue={'P1'}
          options={API_LEVEL_SELECT}
          required={true}
          rules={[{ required: true, message: '用例优先级必选' }]}
        />
        <ProFormSelect
          name="status"
          label="用例状态"
          initialValue={'DEBUG'}
          width={'md'}
          options={API_STATUS_SELECT}
          required={true}
          rules={[{ required: true, message: '用例状态必须选' }]}
        />
      </ProForm.Group>
      <ProForm.Group>
        <ProFormText
          hidden={true}
          width={'lg'}
          label={'所属项目'}
          name={'project_id'}
        />
        <ProFormText hidden={true} required name="module_id" label="所属模块" />
      </ProForm.Group>
      <ProForm.Group>
        <ProFormTextArea
          width={'md'}
          name="description"
          label="用例描述"
          required={true}
          rules={[{ required: true, message: '用例描述必填' }]}
        />
      </ProForm.Group>
    </>
  );
};

export default PlayBaseForm;

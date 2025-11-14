import { CONFIG } from '@/utils/config';
import {
  ProCard,
  ProForm,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { FC } from 'react';

const ApiBaseForm: FC = () => {
  const { API_LEVEL_SELECT, API_STATUS_SELECT } = CONFIG;

  return (
    <ProCard hidden={true}>
      <ProForm.Group>
        <ProFormText width={'md'} label={'所属项目'} name={'project_id'} />
        <ProFormText required name="module_id" label="所属模块" />
      </ProForm.Group>
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
    </ProCard>
  );
};

export default ApiBaseForm;

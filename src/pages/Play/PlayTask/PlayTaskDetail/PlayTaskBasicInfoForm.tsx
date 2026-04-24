import { CONFIG } from '@/utils/config';
import {
  ProCard,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';

const PlayTaskBasicInfoForm = () => {
  const { API_LEVEL_SELECT } = CONFIG;

  return (
    <ProCard>
      <ProFormText required name="project_id" hidden={true} />
      <ProFormText required name="module_id" hidden={true} />
      <ProFormText
        width={'lg'}
        name="title"
        label="任务标题"
        required={true}
        rules={[{ required: true, message: '任务标题必填' }]}
      />
      <ProFormSelect
        name="level"
        label="优先级"
        width={'lg'}
        initialValue={'P1'}
        options={API_LEVEL_SELECT}
        required={true}
        rules={[{ required: true, message: '任务优先级必选' }]}
      />

      <ProFormTextArea
        name="description"
        label="任务描述"
        width={'lg'}
        required={true}
        rules={[{ required: true, message: '任务描述必填' }]}
      />
    </ProCard>
  );
};

export default PlayTaskBasicInfoForm;

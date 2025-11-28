import {
  ProForm,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { FC } from 'react';

const GroupBaseInfo: FC = () => {
  return (
    <>
      <ProForm.Group>
        <ProFormText
          hidden={true}
          width={'md'}
          label={'所属项目'}
          name={'project_id'}
        />
        <ProFormText
          hidden={true}
          width={'md'}
          name="module_id"
          label="所属模块"
        />
      </ProForm.Group>

      <ProFormText
        width={'md'}
        name={'name'}
        label={'组名'}
        required={true}
        rules={[{ required: true, message: '组名必填' }]}
      />
      <ProFormTextArea
        width={'md'}
        name={'description'}
        label={'描述'}
        required={true}
        rules={[{ required: true, message: '组描述必填' }]}
      />
    </>
  );
};

export default GroupBaseInfo;

import {
  getInterfaceGroup,
  insertInterfaceGroup,
  updateInterfaceGroup,
} from '@/api/inter/interGroup';
import { IInterfaceGroup } from '@/pages/Httpx/types';
import {
  ProCard,
  ProForm,
  ProFormGroup,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { Button, Form, message } from 'antd';
import { FC, useEffect } from 'react';

interface Props {
  groupId?: number;
  currentProjectId?: number;
  currentModuleId?: number;
  callback?: () => void;
}

const GroupBaseInfo: FC<Props> = (props) => {
  const { groupId, currentModuleId, currentProjectId, callback } = props;
  const [groupForm] = Form.useForm<IInterfaceGroup>();

  useEffect(() => {
    if (currentProjectId && currentModuleId) {
      groupForm.setFieldsValue({
        project_id: currentProjectId,
        module_id: currentModuleId,
      });
    }
  }, [currentProjectId, currentModuleId]);

  useEffect(() => {
    if (groupId) {
      getInterfaceGroup(groupId).then(async ({ code, data }) => {
        if (code === 0) {
          groupForm.setFieldsValue(data);
        }
      });
    }
  }, [groupId]);

  const saveBaseInfo = async () => {
    const values = await groupForm.validateFields();
    if (groupId) {
      const { code, msg } = await updateInterfaceGroup({
        ...values,
        id: groupId,
      });
      if (code === 0) {
        message.success(msg);
      }
    } else {
      const { code, data } = await insertInterfaceGroup(values);
      if (code === 0) {
        callback?.();
      }
    }
  };
  return (
    <ProCard
      extra={
        <Button onClick={saveBaseInfo} type={'primary'}>
          Save
        </Button>
      }
    >
      <ProForm layout={'vertical'} submitter={false} form={groupForm}>
        <ProFormGroup title={'基础信息'}>
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
        </ProFormGroup>
      </ProForm>
    </ProCard>
  );
};

export default GroupBaseInfo;

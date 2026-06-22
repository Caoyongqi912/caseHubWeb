import { updateInterApiById } from '@/api/inter';
import { IInterfaceAPI } from '@/pages/Httpx/types';
import { FormInstance, message } from 'antd';

export const FormEditableOnValueChange = async (
  form: FormInstance<IInterfaceAPI>,
  field: string,
  no_message: boolean = true,
) => {
  const InterfaceId = form.getFieldValue('id');
  if (InterfaceId) {
    const fieldValues = await form.validateFields([field]);
    console.log('====', InterfaceId, fieldValues);
    const { code, msg } = await updateInterApiById({
      interface_id: InterfaceId,
      // @ts-ignore
      [field]: fieldValues[field],
    });
    if (code === 0 && no_message) {
      message.success(msg);
    }
  }
};

export const FormEditableOnValueRemove = async (
  form: FormInstance<IInterfaceAPI>,
  field: string,
  key: any,
) => {
  const InterfaceId = form.getFieldValue('id');
  await form.validateFields([field]);
  // @ts-ignore
  const currentData = form.getFieldValue(field) || [];
  const updatedData = currentData.filter((item: any) => item.id !== key);
  form.setFieldsValue({
    [field]: updatedData,
  });
  const { code, msg } = await updateInterApiById({
    id: InterfaceId,
    // @ts-ignore
    [field]: updatedData,
  });
  if (code === 0) {
    message.success(msg);
  }
};

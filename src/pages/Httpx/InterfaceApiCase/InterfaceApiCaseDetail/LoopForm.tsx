import MyModal from '@/components/MyModal';
import {
  ProForm,
  ProFormDependency,
  ProFormDigit,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { Form } from 'antd';
import React, { FC } from 'react';

const LoopForm: FC<{
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  case_id: number;
}> = (props) => {
  const [form] = Form.useForm();
  return (
    <MyModal
      open={props.open}
      setOpen={props.setOpen}
      title={'循环步骤'}
      onFinish={async (values) => {
        console.log(values);
      }}
      form={form}
    >
      <ProFormRadio.Group
        label="循环类型"
        width={'lg'}
        initialValue={1}
        name="loop_type"
        options={[
          {
            label: '次数循环',
            value: 1,
          },
          {
            label: '数组遍历',
            value: 2,
          },
          {
            label: '条件循环',
            value: 3,
          },
        ]}
        required={true}
        fieldProps={{
          onChange: (e) => {
            form.resetFields();
            form.setFieldsValue({ loop_type: e.target.value });
          },
        }}
        rules={[{ required: true, message: '选择循环类型' }]}
      />
      <ProForm.Group>
        <ProFormDependency name={['loop_type']}>
          {({ loop_type }) => {
            if (loop_type === 1) {
              return (
                <>
                  <ProFormDigit
                    width={'lg'}
                    label={'循环次数'}
                    min={1}
                    max={10}
                    required={true}
                    rules={[{ required: true, message: '选择循环次数' }]}
                    name={'loop_times'}
                  />
                </>
              );
            } else if (loop_type === 2) {
              return (
                <>
                  <ProFormText
                    width={'lg'}
                    placeholder={
                      '输入循环对象 例如 1,2,abc  或者 {{name}},{{xxx}},3,xxx  变量名 '
                    }
                    name={'loop_items'}
                    required={true}
                    rules={[{ required: true, message: '输入循环对象' }]}
                    label={'循环对象'}
                  />
                  <ProFormText
                    width={'lg'}
                    name={'loop_item_key'}
                    label={'循环对象变量名'}
                    required={true}
                    rules={[{ required: true, message: '输入循环对象变量名' }]}
                  />
                </>
              );
            } else {
              return (
                <>
                  <ProFormDigit
                    name={'max_loop'}
                    label={'最大循环次数'}
                    max={1}
                    min={10}
                  />
                  <ProForm.Group>
                    <ProFormText
                      name={['condition', 'key']}
                      label="变量"
                      placeholder="字符串 或者 变量 {{xx}}"
                      required={true}
                      rules={[{ required: true, message: '输入循环变量' }]}
                    />
                    <ProFormSelect
                      name={['condition', 'operate']}
                      label="条件"
                      options={[
                        {
                          label: '相等',
                          value: 0,
                        },
                        {
                          label: '不相等',
                          value: 1,
                        },
                      ]}
                      required={true}
                      rules={[{ required: true, message: '选择条件' }]}
                    />
                    <ProFormText
                      name={['condition', 'value']}
                      label="结束值"
                      placeholder="字符串 或者 变量 {{xx}}"
                      required={true}
                      rules={[{ required: true, message: '输入循环结束值' }]}
                    />
                  </ProForm.Group>
                </>
              );
            }
          }}
        </ProFormDependency>
      </ProForm.Group>
      <ProFormDigit
        width={'md'}
        required={true}
        rules={[{ required: true, message: '选择间隔时间' }]}
        initialValue={0}
        name={'loop_interval'}
        label={'间隔时间'}
        min={0}
        max={10}
        addonAfter={'s'}
      />
    </MyModal>
  );
};

export default LoopForm;

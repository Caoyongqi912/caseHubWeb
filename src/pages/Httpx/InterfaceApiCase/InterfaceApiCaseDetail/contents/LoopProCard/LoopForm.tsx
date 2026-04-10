import { addAPILoop, updateAPILoop } from '@/api/inter/interCase';
import MyModal from '@/components/MyModal';
import { LoopContent } from '@/pages/Httpx/types';
import {
  ProForm,
  ProFormDependency,
  ProFormDigit,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { Form, RadioChangeEvent, theme } from 'antd';
import React, { FC, useCallback, useEffect } from 'react';

const { useToken } = theme;

/**
 * 循环表单组件
 * 用于创建或编辑循环步骤配置
 */
const LoopForm: FC<{
  loop_info?: LoopContent;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  case_id?: number;
  callback?: () => void;
}> = (props) => {
  const { token } = useToken();
  const [form] = Form.useForm();

  /**
   * 当 loop_info 变化时，同步表单数据
   * @description 当外部传入的 loop_info 变化时，更新表单值
   */
  useEffect(() => {
    if (props.loop_info) {
      form.setFieldsValue(props.loop_info);
    }
  }, [props.loop_info, form]);

  /**
   * 表单提交处理函数
   * @description 根据是否存在 loop_info 决定是更新还是新建
   * @param values - 表单提交的值
   */
  const handleFormFinish = useCallback(
    async (values: Record<string, unknown>) => {
      if (!props.case_id) return false;

      const apiFn = props.loop_info
        ? updateAPILoop({ ...values, id: props.loop_info.id } as LoopContent)
        : addAPILoop({ ...values, case_id: props.case_id } as LoopContent);

      const { code } = await apiFn;
      if (code === 0) {
        props.callback?.();
        return true;
      }
      return false;
    },
    [props.case_id, props.loop_info, props.callback],
  );

  /**
   * 循环类型切换时的处理
   * @description 重置表单并设置新的循环类型
   * @param e - 单选框变化事件
   */
  const handleLoopTypeChange = useCallback(
    (e: RadioChangeEvent) => {
      if (!props.loop_info) {
        form.resetFields();
      }
      form.setFieldsValue({ loop_type: e.target.value });
    },
    [form, props.loop_info],
  );

  return (
    <MyModal
      open={props.open}
      setOpen={props.setOpen}
      title={'循环步骤配置'}
      onFinish={handleFormFinish}
      form={form}
    >
      <ProFormRadio.Group
        label="循环类型"
        width={'lg'}
        initialValue={1}
        name="loop_type"
        options={[
          { label: '次数循环', value: 1 },
          { label: '数组遍历', value: 2 },
          { label: '条件循环', value: 3 },
        ]}
        required={true}
        fieldProps={{ onChange: handleLoopTypeChange }}
        rules={[{ required: true, message: '选择循环类型' }]}
        formItemProps={{
          style: {
            marginBottom: '16px',
          },
        }}
      />
      <ProForm.Group>
        <ProFormDependency name={['loop_type']}>
          {({ loop_type }) => {
            if (loop_type === 1) {
              return (
                <ProFormDigit
                  width={'lg'}
                  label={'循环次数'}
                  min={1}
                  max={10}
                  required={true}
                  rules={[{ required: true, message: '选择循环次数' }]}
                  name={'loop_times'}
                  fieldProps={{
                    style: {
                      width: '100%',
                    },
                  }}
                />
              );
            }
            if (loop_type === 2) {
              return (
                <>
                  <ProFormText
                    width={'lg'}
                    placeholder="输入循环对象 例如 1,2,abc 或者 {{name}},{{xxx}},3,xxx 变量名"
                    name={'loop_items'}
                    required={true}
                    rules={[{ required: true, message: '输入循环对象' }]}
                    label={'循环对象'}
                    fieldProps={{
                      style: {
                        width: '100%',
                      },
                    }}
                  />
                  <ProFormText
                    width={'lg'}
                    name={'loop_item_key'}
                    label={'循环对象变量名'}
                    required={true}
                    rules={[{ required: true, message: '输入循环对象变量名' }]}
                    fieldProps={{
                      style: {
                        width: '100%',
                      },
                    }}
                  />
                </>
              );
            }
            return (
              <>
                <ProFormDigit
                  name={'max_loop'}
                  label={'最大循环次数'}
                  max={10}
                  min={1}
                  fieldProps={{
                    style: {
                      width: '100%',
                    },
                  }}
                />
                <ProForm.Group>
                  <ProFormText
                    name={['loop_condition', 'key']}
                    label="变量"
                    placeholder="字符串 或者 变量 {{xx}}"
                    required={true}
                    rules={[{ required: true, message: '输入循环变量' }]}
                    fieldProps={{
                      style: {
                        width: '100%',
                      },
                    }}
                  />
                  <ProFormSelect
                    name={['loop_condition', 'operate']}
                    label="条件"
                    options={[
                      { label: '相等', value: 0 },
                      { label: '不相等', value: 1 },
                    ]}
                    required={true}
                    rules={[{ required: true, message: '选择条件' }]}
                    fieldProps={{
                      style: {
                        width: '100%',
                      },
                    }}
                  />
                  <ProFormText
                    name={['loop_condition', 'value']}
                    label="结束值"
                    placeholder="字符串 或者 变量 {{xx}}"
                    required={true}
                    rules={[{ required: true, message: '输入循环结束值' }]}
                    fieldProps={{
                      style: {
                        width: '100%',
                      },
                    }}
                  />
                </ProForm.Group>
              </>
            );
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
        fieldProps={{
          style: {
            width: '100%',
          },
        }}
      />
    </MyModal>
  );
};

export default LoopForm;

import { queryMethods } from '@/api/play/method';
import { updateSubStep } from '@/api/play/step';
import { methodToEnum } from '@/pages/Play/componets/methodToEnum';
import {
  IUICaseSteps,
  IUICaseSubStep,
  IUIMethod,
} from '@/pages/Play/componets/uiTypes';
import {
  ProCard,
  ProForm,
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { Button, Form } from 'antd';
import { FC, useEffect, useState } from 'react';

interface ISelfProps {
  subStep?: IUICaseSubStep;
  func: () => void;
}

const SubStepDetail: FC<ISelfProps> = ({ subStep, func }) => {
  const [form] = Form.useForm<IUICaseSteps>();
  const [methods, setMethods] = useState<IUIMethod[]>([]);
  const [methodEnum, setMethodEnum] = useState<any>();
  const [currentMethod, setCurrentMethod] = useState<IUIMethod>();
  const [readOnly, setReadOnly] = useState(false);
  //1 详情  2 编辑
  const [mode, setMode] = useState<number>(1);

  useEffect(() => {
    queryMethods().then(async ({ code, data }) => {
      if (code === 0) {
        setMethods(data);
        const result = methodToEnum(data);
        setMethodEnum(result);
      }
    });
  }, []);
  useEffect(() => {
    // 详情模式
    if (subStep) {
      setMode(1);
      form.setFieldsValue(subStep);
    } else {
      setMode(2);
    }
    return;
  }, [subStep]);

  const UpdateStep = async () => {
    const values = form.getFieldsValue(true);
    const { code } = await updateSubStep(values);
    if (code === 0) {
      func();
    }
  };
  const DetailExtra: FC<{ currentMode: number }> = ({ currentMode }) => {
    switch (currentMode) {
      case 1:
        return (
          <Button type={'primary'} onClick={() => setMode(2)}>
            Edit
          </Button>
        );
      case 2:
        return (
          <>
            {subStep && (
              <Button type={'primary'} onClick={() => setMode(1)}>
                Cancel
              </Button>
            )}
            <Button
              onClick={UpdateStep}
              style={{ marginLeft: 10 }}
              type={'primary'}
            >
              Save
            </Button>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <ProCard extra={<DetailExtra currentMode={mode} />}>
      <ProForm
        disabled={mode === 1}
        layout={'vertical'}
        form={form}
        submitter={false}
        rowProps={{
          gutter: [0, 16],
        }}
      >
        <ProForm.Group>
          <ProFormText
            width={'lg'}
            name="name"
            label="步骤名称"
            required={true}
            rules={[{ required: true, message: '步骤名称必填' }]}
          />
        </ProForm.Group>
        <ProForm.Group>
          <ProFormTextArea
            width={'lg'}
            name="description"
            label="步骤描述"
            required={true}
            rules={[{ required: true, message: '步骤描述必填' }]}
          />
        </ProForm.Group>
        <ProForm.Group>
          <ProFormSelect
            width={'lg'}
            name="method"
            showSearch={true}
            label="元素操作"
            options={methodEnum}
            rules={[{ required: true, message: '步骤方法必选' }]}
            fieldProps={{
              onSelect: (value: string) => {
                if (value) {
                  const currentMethod = methods.find(
                    (item) => item.value === value,
                  );
                  console.log('==', currentMethod);
                  setCurrentMethod(currentMethod);
                }
              },
            }}
          />
        </ProForm.Group>
        {currentMethod && currentMethod.value.toLowerCase().startsWith('on') ? (
          <ProForm.Group>
            <ProFormTextArea
              width={'lg'}
              label={'监听接口'}
              name={'once_url'}
              required={currentMethod.need_value === 1}
              placeholder={'/xx/xx/xxx'}
            />
          </ProForm.Group>
        ) : null}
        {currentMethod && currentMethod.need_locator === 1 ? (
          <ProForm.Group>
            <ProFormTextArea
              width={'lg'}
              name="locator"
              label="步骤目标元素定位"
              required={true}
              readonly={readOnly}
              tooltip={'当方法选择不需要目标元素定位，可写入null'}
              placeholder={'#...'}
              rules={[{ required: true, message: '目标元素必填' }]}
            />
          </ProForm.Group>
        ) : (
          <ProForm.Group>
            <ProFormTextArea
              width={'lg'}
              name="locator"
              label="步骤目标元素定位"
              required={false}
              disabled={true}
              tooltip={'当方法选择不需要目标元素定位，可写入null'}
            />
          </ProForm.Group>
        )}
        {currentMethod && currentMethod.need_value === 2 ? (
          <ProForm.Group>
            <ProFormTextArea
              width={'lg'}
              tooltip={'用于输入值，或者用于expect校验的预期值'}
              name="value"
              label="输入值"
              disabled={true}
              required={false}
            />
          </ProForm.Group>
        ) : (
          <ProForm.Group>
            <ProFormTextArea
              width={'lg'}
              tooltip={'用于输入值，或者用于expect校验的预期值'}
              name="value"
              label="输入值"
              required={true}
              rules={[{ required: true, message: '输入值必填' }]}
            />
          </ProForm.Group>
        )}

        <ProForm.Group>
          <ProFormTextArea
            width={'lg'}
            name="iframeName"
            label="IFrame"
            tooltip={'如果是iframe上操作、请输入iframe 元素'}
          />
        </ProForm.Group>
        <ProForm.Group>
          <ProFormSwitch
            width={'lg'}
            name={'new_page'}
            label={'操作是否打开新页面'}
          />
          <ProFormSwitch
            width={'lg'}
            name={'is_ignore'}
            label={'是否忽略异常'}
          />
        </ProForm.Group>
      </ProForm>
    </ProCard>
  );
};

export default SubStepDetail;

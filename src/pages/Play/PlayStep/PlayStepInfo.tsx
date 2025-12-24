import { IResponse } from '@/api';
import {
  insertPlayGroupSubSteps,
  insertPlayStep,
  queryPlayMethods,
  updatePlayStep,
} from '@/api/play/playCase';
import { methodToEnum } from '@/pages/Play/componets/methodToEnum';
import { IUICaseSteps, IUIMethod } from '@/pages/Play/componets/uiTypes';
import {
  ProCard,
  ProForm,
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { Button, Form, message } from 'antd';
import { FC, useEffect, useState } from 'react';

interface Self {
  currentProjectId?: number;
  currentModuleId?: number;
  stepInfo?: IUICaseSteps;
  readonly: boolean; //非创建人无权限、Case下的个公共STEP 不可修改
  callback?: () => void;
  is_common_step?: boolean;
  play_case_id?: string;
  play_group_id?: number;
}

const PlayStepInfo: FC<Self> = (props) => {
  const {
    currentProjectId,
    play_case_id,
    play_group_id,
    is_common_step,
    callback,
    readonly,
    stepInfo,
    currentModuleId,
  } = props;
  const [stepForm] = Form.useForm<IUICaseSteps>();
  const [methods, setMethods] = useState<IUIMethod[]>([]);
  const [methodEnum, setMethodEnum] = useState<any>();
  const [currentMethod, setCurrentMethod] = useState<IUIMethod>();

  useEffect(() => {
    queryPlayMethods().then(async ({ code, data }) => {
      if (code === 0) {
        setMethods(data);
        const result = methodToEnum(data);
        setMethodEnum(result);
      }
    });
  }, []);
  useEffect(() => {
    if (currentProjectId && currentModuleId) {
      stepForm.setFieldsValue({
        project_id: currentProjectId,
        module_id: currentModuleId,
      });
    }
  }, [currentProjectId, currentModuleId]);
  useEffect(() => {
    if (play_group_id) {
      console.log('===play_group_id', play_group_id);
      stepForm.setFieldsValue({
        group_id: play_group_id,
      });
    }
    if (play_case_id) {
      console.log('==play_case_id=g', play_group_id);

      stepForm.setFieldsValue({
        caseId: play_case_id,
      });
    }
  }, [play_group_id, play_case_id]);

  useEffect(() => {
    if (!stepInfo) return;
    stepForm.setFieldsValue(stepInfo);
    setCurrentMethod(
      methods.find((item: any) => item.value === stepInfo.method),
    );
  }, [stepInfo]);

  const onFetchFinish = async (response: IResponse<null>) => {
    const { code, msg } = response;
    if (code === 0) {
      message.success(msg);
      stepForm.resetFields();
      callback?.();
    }
  };

  const save = async () => {
    try {
      await stepForm.validateFields();
    } catch (e) {
      console.log(e);
      return;
    }
    const values = stepForm.getFieldsValue(true);
    values.is_common_step = is_common_step;
    //新增修改
    if (values.id) {
      updatePlayStep(values).then(onFetchFinish);
    } else {
      if (play_case_id) {
        values.caseId = play_case_id;
        insertPlayStep(values).then(onFetchFinish);
      }
      if (play_group_id) {
        values.group_id = play_group_id;
        insertPlayGroupSubSteps(values).then(onFetchFinish);
      }
    }
  };
  return (
    <>
      <ProCard
        extra={
          !readonly && (
            <Button type={'primary'} onClick={save}>
              保存
            </Button>
          )
        }
      >
        <ProForm form={stepForm} submitter={false}>
          <ProFormText name={'project_id'} hidden />
          <ProFormText name={'module_id'} hidden />
          <ProFormText
            width={'lg'}
            name="name"
            label="步骤名称"
            required={true}
            rules={[{ required: true, message: '步骤名称必填' }]}
          />
          <ProFormTextArea
            width={'lg'}
            name="description"
            label="步骤描述"
            required={true}
            rules={[{ required: true, message: '步骤描述必填' }]}
          />
          <ProFormSelect
            width={'lg'}
            name="method"
            showSearch={true}
            label="操作"
            options={methodEnum}
            rules={[{ required: true, message: '步骤方法必选' }]}
            fieldProps={{
              onSelect: (value: string) => {
                if (value) {
                  const currentMethod = methods.find(
                    (item) => item.value === value,
                  );
                  console.log(currentMethod);
                  setCurrentMethod(currentMethod);
                }
              },
            }}
          />
          <ProFormTextArea
            width={'lg'}
            name="locator"
            label="步骤目标元素定位"
            placeholder={'#...'}
            required={currentMethod && currentMethod.need_locator === 1}
            disabled={currentMethod && currentMethod.need_locator !== 1}
            tooltip={'当方法选择不需要目标元素定位，可写入null'}
          />
          <ProFormTextArea
            width={'lg'}
            tooltip={'用于输入值，或者用于expect校验的预期值'}
            name="fill_value"
            label="输入值"
            disabled={currentMethod && currentMethod.need_value !== 1}
            required={currentMethod && currentMethod.need_value === 1}
          />
          <ProFormTextArea
            width={'lg'}
            name="iframe_name"
            label="IFrame"
            tooltip={'如果是iframe上操作、请输入iframe 元素'}
          />
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
    </>
  );
};

export default PlayStepInfo;

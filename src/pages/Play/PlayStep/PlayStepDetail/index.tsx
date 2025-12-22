import { IModuleEnum, IResponse } from '@/api';
import {
  insertPlayConditionSubSteps,
  insertPlayGroupSubSteps,
  insertPlayStep,
  queryPlayMethods,
  updatePlayStep,
} from '@/api/play/playCase';
import { methodToEnum } from '@/pages/Play/componets/methodToEnum';
import { IUICaseSteps, IUIMethod } from '@/pages/Play/componets/uiTypes';
import { ModuleEnum } from '@/utils/config';
import { fetchModulesEnum } from '@/utils/somefunc';
import { useModel } from '@@/exports';
import {
  ProCard,
  ProForm,
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
  ProFormTreeSelect,
} from '@ant-design/pro-components';
import { Button, Form, message } from 'antd';
import { FC, useEffect, useState } from 'react';

interface SelfProps {
  callBack: () => void;
  isCommonStep?: boolean;
  caseId?: number;
  stepInfo?: IUICaseSteps;
  caseProjectId?: number;
  caseModuleId?: number;
  groupId?: number;
  conditionStepId?: number;
  readOnly?: boolean;
}

/**\
 * 增加公共步骤
 * 增加case私有步骤
 * 与其修改
 * @param callBack
 * @param isCommonStep
 * @param caseId
 * @param groupId
 * @param stepInfo
 * @param caseProjectId
 * @param caseModuleId
 * @param readOnly
 * @param conditionStepId
 * @constructor
 */
const Index: FC<SelfProps> = ({
  caseProjectId,
  caseModuleId,
  callBack,
  isCommonStep = false,
  caseId,
  stepInfo,
  groupId,
  readOnly = false,
  conditionStepId,
}) => {
  const { initialState } = useModel('@@initialState');
  const [stepForm] = Form.useForm<IUICaseSteps>();
  const [methods, setMethods] = useState<IUIMethod[]>([]);
  const [methodEnum, setMethodEnum] = useState<any>();
  const [currentMethod, setCurrentMethod] = useState<IUIMethod>();
  const projects = initialState?.projects || [];
  const [currentProjectId, setCurrentProjectId] = useState<number>();
  const [moduleEnum, setModuleEnum] = useState<IModuleEnum[]>([]);
  //1 详情  2 编辑
  const [mode, setMode] = useState<number>(1);

  // 根据当前项目ID获取环境和用例部分
  useEffect(() => {
    if (currentProjectId) {
      fetchModulesEnum(
        currentProjectId,
        ModuleEnum.UI_STEP,
        setModuleEnum,
      ).then();
    }
  }, [currentProjectId]);
  useEffect(() => {
    //查看详情
    if (stepInfo) {
      stepForm.setFieldsValue(stepInfo);
      setCurrentProjectId(stepInfo.project_id);
      setCurrentMethod(
        methods.find((item: any) => item.value === stepInfo.method),
      );
    }
  }, [stepInfo]);

  useEffect(() => {
    queryPlayMethods().then(async ({ code, data }) => {
      if (code === 0) {
        setMethods(data);
        const result = methodToEnum(data);
        setMethodEnum(result);
      }
    });
  }, []);

  /**
   * 修改与保存
   */
  const save_updateStep = async () => {
    // caseId && stepId && !is_common_step 修改case私有步骤
    // groupId && stepId && !is_common_step 修改group私有步骤

    // caseId && !is_common_step 新增case私有步骤
    // groupId && !is_common_step 新增group私有步骤
    try {
      await stepForm.validateFields();
    } catch (e) {}
    const values = stepForm.getFieldsValue(true);
    //  公共步骤的新增与修改
    if (isCommonStep) {
      if (values.id) {
        updatePlayStep(values).then(onFetchFinish);
      } else {
        //  只有  is_common_step  新增公共用例
        values.is_common_step = true;
        insertPlayStep(values).then(onFetchFinish);
      }
      return;
    }
    // case 步骤的修改与新增
    if (!isCommonStep && caseId) {
      //修改
      if (values.id) {
        updatePlayStep(values).then(onFetchFinish);
      } else {
        values.project_id = caseProjectId;
        values.module_id = caseModuleId;
        values.caseId = caseId;
        insertPlayStep(values).then(onFetchFinish);
      }
      return;
    }
    // group 步骤新增与修改
    if (!isCommonStep && groupId) {
      if (values.id) {
        updatePlayStep(values).then(onFetchFinish);
      } else {
        values.project_id = caseProjectId;
        values.module_id = caseModuleId;
        values.group_id = groupId;
        insertPlayGroupSubSteps(values).then(onFetchFinish);
      }
      return;
    }

    if (conditionStepId) {
      values.stepId = conditionStepId;
      insertPlayConditionSubSteps(values).then(onFetchFinish);
      return;
    }
    if (values.id) {
      updatePlayStep(values).then(onFetchFinish);
      return;
    }
  };

  const onFetchFinish = async (response: IResponse<null>) => {
    const { code, msg } = response;
    if (code === 0) {
      message.success(msg);
      stepForm.resetFields();
      callBack();
    }
  };

  return (
    <ProCard
      extra={
        !readOnly && (
          <Button onClick={save_updateStep} type={'primary'}>
            保存
          </Button>
        )
      }
    >
      <ProForm
        disabled={readOnly}
        layout={'vertical'}
        form={stepForm}
        submitter={false}
        rowProps={{
          gutter: [0, 16],
        }}
      >
        {isCommonStep && (
          <>
            <ProFormSelect
              width={'lg'}
              options={projects}
              label={'所属项目'}
              name={'project_id'}
              required={true}
              onChange={(value) => {
                setCurrentProjectId(value as number);
              }}
            />
            <ProFormTreeSelect
              required
              width={'lg'}
              name="module_id"
              label="所属模块"
              rules={[{ required: true, message: '所属模块必选' }]}
              fieldProps={{
                treeData: moduleEnum,
                fieldNames: {
                  label: 'title',
                },
                filterTreeNode: true,
              }}
            />
          </>
        )}
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
              name="fill_value"
              label="输入值"
              required={true}
              rules={[{ required: true, message: '输入值必填' }]}
            />
          </ProForm.Group>
        )}

        <ProForm.Group>
          <ProFormTextArea
            width={'lg'}
            name="iframe_name"
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

export default Index;

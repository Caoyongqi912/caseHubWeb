import { IResponse } from '@/api';
import {
  insertPlayCaseStep,
  insertPlayGroupStep,
  playStepDetailById,
  queryPlayLocators,
  queryPlayMethods,
  savePlayStep,
  updatePlayStep,
} from '@/api/play/playCase';
import { methodToEnum } from '@/pages/Play/componets/methodToEnum';
import {
  ILocator,
  IPlayStepDetail,
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
import { Button, Divider, Form, message, Tooltip } from 'antd';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';

interface Props {
  play_step_id?: number;
  play_case_id?: number;
  play_group_id?: number;
  step_detail?: IPlayStepDetail;
  currentProjectId?: number;
  currentModuleId?: number;
  callback: () => void;
}

const PlayStepDetail: FC<Props> = (props) => {
  const {
    callback,
    step_detail,
    play_step_id,
    currentProjectId,
    currentModuleId,
    play_case_id,
    play_group_id,
  } = props;
  const [methods, setMethods] = useState<IUIMethod[]>([]);
  const [locators, setLocators] = useState<ILocator[]>([]);
  const [loading, setLoading] = useState(false);
  const [stepForm] = Form.useForm<IPlayStepDetail>();
  const methodValue = Form.useWatch('method', stepForm);

  const methodEnum = useMemo(() => {
    return methodToEnum(methods);
  }, [methods]);

  const locatorOptions = useMemo(() => {
    return locators.map((item) => ({
      label: <Tooltip title={item.getter_desc}>{item.getter_name}</Tooltip>,
      value: item.getter_name,
    }));
  }, [locators]);

  const currentMethod = useMemo(() => {
    return methods.find((item) => item.value === methodValue);
  }, [methods, methodValue]);

  // 加载步骤详情
  useEffect(() => {
    if (play_step_id) {
      playStepDetailById(play_step_id).then(async ({ code, data }) => {
        if (code === 0) {
          stepForm.setFieldsValue(data);
        }
      });
    }
  }, [play_step_id, stepForm]);

  // 设置步骤详情
  useEffect(() => {
    if (step_detail) {
      stepForm.setFieldsValue(step_detail);
    }
  }, [step_detail, stepForm]);

  // 设置项目和模块ID
  useEffect(() => {
    if (currentProjectId && currentModuleId) {
      stepForm.setFieldsValue({
        project_id: currentProjectId,
        module_id: currentModuleId,
      });
    }
  }, [currentProjectId, currentModuleId, stepForm]);

  // 加载方法和定位器
  useEffect(() => {
    Promise.all([queryPlayMethods(), queryPlayLocators()]).then(
      ([methods, locators]) => {
        if (methods.code === 0) {
          setMethods(methods.data);
        }
        if (locators.code === 0) {
          setLocators(locators.data);
        }
      },
    );
  }, []);

  // 根据方法类型清空不需要的字段
  useEffect(() => {
    if (currentMethod) {
      if (currentMethod.need_locator === 0) {
        stepForm.setFieldsValue({
          locator: undefined,
          selector: undefined,
        });
      }
      if (currentMethod.need_value === 0) {
        stepForm.setFieldValue('value', undefined);
      }
      if (currentMethod.need_key === 0) {
        stepForm.setFieldValue('key', undefined);
      }
    }
  }, [currentMethod, stepForm]);

  const onFetchFinish = useCallback(
    async (response: IResponse<IPlayStepDetail>) => {
      const { code, msg } = response;
      setLoading(false);
      if (code === 0) {
        message.success(msg);
        stepForm.resetFields();
        callback?.();
      }
    },
    [callback, stepForm],
  );

  const save = useCallback(async () => {
    try {
      await stepForm.validateFields();
    } catch (e) {
      console.log(e);
      return;
    }

    setLoading(true);
    const values = stepForm.getFieldsValue(true);

    if (values.id) {
      // 更新步骤
      return updatePlayStep(values).then(onFetchFinish);
    }

    // 添加私有步骤到用例
    if (play_case_id) {
      values.case_id = play_case_id;
      values.is_common = false;
      return insertPlayCaseStep(values).then(onFetchFinish);
    }

    // 添加私有步骤到步骤组
    if (play_group_id) {
      values.group_id = play_group_id;
      values.is_common = false;
      return insertPlayGroupStep(values).then(onFetchFinish);
    }

    // 新增公共步骤
    return savePlayStep(values).then(onFetchFinish);
  }, [stepForm, play_case_id, play_group_id, onFetchFinish]);
  return (
    <ProCard
      title="步骤详情"
      extra={
        <Button type="primary" onClick={save} loading={loading}>
          保存
        </Button>
      }
      style={{ marginBottom: 16 }}
    >
      <ProForm form={stepForm} submitter={false}>
        <ProFormText name="project_id" hidden />
        <ProFormText name="module_id" hidden />

        {/* 基本信息 */}
        <ProFormText
          width="lg"
          name="name"
          label="步骤名称"
          placeholder="请输入步骤名称"
          required
          rules={[{ required: true, message: '步骤名称必填' }]}
        />
        <ProFormTextArea
          width="lg"
          name="description"
          label="步骤描述"
          placeholder="请输入步骤描述"
          fieldProps={{
            rows: 3,
            showCount: true,
            maxLength: 500,
          }}
        />

        <Divider orientation="left" style={{ margin: '24px 0' }}>
          元素定位
        </Divider>

        <ProFormSelect
          name="locator"
          label="定位器"
          width="lg"
          tooltip="内置定位器，可选"
          placeholder="可不选，直接使用 selector 定位"
          options={locatorOptions}
          disabled={currentMethod && currentMethod.need_locator === 0}
          fieldProps={{
            showSearch: true,
            allowClear: true,
          }}
        />
        <ProFormTextArea
          width="lg"
          name="selector"
          label="元素选择器"
          placeholder="例如：#id、.class、xpath=//div[@id='test']"
          disabled={currentMethod && currentMethod.need_locator === 0}
          required={currentMethod && currentMethod.need_locator === 1}
          rules={[
            {
              required: currentMethod && currentMethod.need_locator === 1,
              message: '该操作需要元素选择器',
            },
          ]}
          fieldProps={{
            rows: 2,
            showCount: true,
          }}
        />

        <Divider orientation="left" style={{ margin: '24px 0' }}>
          操作配置
        </Divider>

        <ProFormSelect
          width="lg"
          name="method"
          label="操作方法"
          placeholder="请选择操作方法"
          options={methodEnum}
          required
          rules={[{ required: true, message: '步骤方法必选' }]}
          fieldProps={{
            showSearch: true,
          }}
        />

        <ProFormTextArea
          width="lg"
          name="value"
          label="输入值"
          tooltip="用于输入值，或者用于 expect 校验的预期值"
          placeholder="请输入值"
          disabled={currentMethod && currentMethod.need_value === 0}
          required={currentMethod && currentMethod.need_value === 1}
          rules={[
            {
              required: currentMethod && currentMethod.need_value === 1,
              message: '该操作需要输入值',
            },
          ]}
          fieldProps={{
            rows: 2,
            showCount: true,
          }}
        />
        <ProFormTextArea
          width="lg"
          name="key"
          label="变量名"
          tooltip="用于存储操作结果的变量名"
          placeholder="请输入变量名"
          disabled={currentMethod && currentMethod.need_key === 0}
          required={currentMethod && currentMethod.need_key === 1}
          rules={[
            {
              required: currentMethod && currentMethod.need_key === 1,
              message: '该操作需要变量名',
            },
          ]}
          fieldProps={{
            rows: 1,
          }}
        />

        <Divider orientation="left" style={{ margin: '24px 0' }}>
          高级选项
        </Divider>

        <ProFormTextArea
          width="lg"
          name="iframe_name"
          label="IFrame 定位"
          tooltip="如果目标元素在 iframe 中，请输入 iframe 的定位信息"
          placeholder="例如：#iframe-id 或 iframe[name='frameName']"
          disabled={currentMethod && currentMethod.need_locator === 0}
          fieldProps={{
            rows: 2,
          }}
        />

        <ProForm.Group>
          <ProFormSwitch
            name="new_page"
            label="打开新页面"
            tooltip="操作是否会打开新的浏览器页面"
          />
          <ProFormSwitch
            name="is_ignore"
            label="忽略异常"
            tooltip="执行失败时是否继续执行后续步骤"
          />
        </ProForm.Group>
      </ProForm>
    </ProCard>
  );
};

export default PlayStepDetail;

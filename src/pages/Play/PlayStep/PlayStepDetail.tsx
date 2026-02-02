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
  ProForm,
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { Button, Form, message, theme, Tooltip } from 'antd';
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
  const { token } = theme.useToken();
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

  const loadMethods = useCallback(() => {
    return queryPlayMethods();
  }, []);

  const loadLocators = useCallback(() => {
    return queryPlayLocators();
  }, []);

  useEffect(() => {
    if (play_step_id) {
      playStepDetailById(play_step_id).then(async ({ code, data }) => {
        if (code === 0) {
          stepForm.setFieldsValue(data);
        }
      });
    }
  }, [play_step_id, stepForm]);

  useEffect(() => {
    if (step_detail) {
      stepForm.setFieldsValue(step_detail);
    }
  }, [step_detail, stepForm]);

  useEffect(() => {
    if (currentProjectId && currentModuleId) {
      stepForm.setFieldsValue({
        project_id: currentProjectId,
        module_id: currentModuleId,
      });
    }
  }, [currentProjectId, currentModuleId, stepForm]);

  useEffect(() => {
    Promise.all([loadMethods(), loadLocators()]).then(([methods, locators]) => {
      if (methods.code === 0) {
        setMethods(methods.data);
      }
      if (locators.code === 0) {
        setLocators(locators.data);
      }
    });
  }, [loadMethods, loadLocators]);

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
      return updatePlayStep(values).then(onFetchFinish);
    }

    if (play_case_id) {
      values.case_id = play_case_id;
      values.is_common = false;
      return insertPlayCaseStep(values).then(onFetchFinish);
    }

    if (play_group_id) {
      values.group_id = play_group_id;
      values.is_common = false;
      return insertPlayGroupStep(values).then(onFetchFinish);
    }
    values.is_common = true;
    return savePlayStep(values).then(onFetchFinish);
  }, [stepForm, play_case_id, play_group_id, onFetchFinish]);

  const sectionTitleStyle = {
    fontSize: 14,
    fontWeight: 600,
    color: token.colorTextHeading,
    margin: '24px 0 16px 0',
    paddingBottom: 8,
    borderBottom: `1px solid ${token.colorBorderSecondary}`,
  };

  return (
    <div style={{ padding: '24px', backgroundColor: token.colorBgContainer }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: 18,
            fontWeight: 600,
            color: token.colorTextHeading,
          }}
        >
          步骤详情
        </h2>
        <Button
          type="primary"
          onClick={save}
          loading={loading}
          style={{
            height: 36,
            paddingLeft: 24,
            paddingRight: 24,
            borderRadius: 6,
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          保存
        </Button>
      </div>

      <ProForm form={stepForm} submitter={false}>
        <ProFormText name="project_id" hidden />
        <ProFormText name="module_id" hidden />

        <div style={{ marginBottom: 20 }}>
          <ProFormText
            width="lg"
            name="name"
            label={
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: token.colorTextHeading,
                }}
              >
                步骤名称
              </span>
            }
            placeholder="请输入步骤名称"
            required
            rules={[{ required: true, message: '步骤名称必填' }]}
            fieldProps={{
              style: { fontSize: 14, height: 36 },
            }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <ProFormTextArea
            width="lg"
            name="description"
            label={
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: token.colorTextHeading,
                }}
              >
                步骤描述
              </span>
            }
            placeholder="请输入步骤描述"
            fieldProps={{
              rows: 3,
              showCount: true,
              maxLength: 500,
              style: { fontSize: 14 },
            }}
          />
        </div>

        <div style={sectionTitleStyle}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 4,
                height: 16,
                backgroundColor: token.colorPrimary,
                borderRadius: 2,
              }}
            />
            元素定位
          </span>
        </div>

        <div style={{ marginBottom: 20 }}>
          <ProFormSelect
            name="locator"
            label={
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: token.colorTextHeading,
                }}
              >
                定位器
              </span>
            }
            width="lg"
            tooltip="内置定位器，可选"
            placeholder="可不选，直接使用 selector 定位"
            options={locatorOptions}
            disabled={currentMethod && currentMethod.need_locator === 0}
            fieldProps={{
              showSearch: true,
              allowClear: true,
              style: { fontSize: 14 },
            }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <ProFormTextArea
            width="lg"
            name="selector"
            label={
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: token.colorTextHeading,
                }}
              >
                元素选择器
              </span>
            }
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
              rows: 3,
              showCount: true,
              style: { fontSize: 14 },
            }}
          />
        </div>

        <div style={sectionTitleStyle}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 4,
                height: 16,
                backgroundColor: token.colorPrimary,
                borderRadius: 2,
              }}
            />
            操作配置
          </span>
        </div>

        <div style={{ marginBottom: 20 }}>
          <ProFormSelect
            width="lg"
            name="method"
            label={
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: token.colorTextHeading,
                }}
              >
                操作方法
              </span>
            }
            placeholder="请选择操作方法"
            options={methodEnum}
            required
            rules={[{ required: true, message: '步骤方法必选' }]}
            fieldProps={{
              showSearch: true,
              style: { fontSize: 14 },
            }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <ProFormTextArea
            width="lg"
            name="value"
            label={
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: token.colorTextHeading,
                }}
              >
                输入值
              </span>
            }
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
              rows: 3,
              showCount: true,
              style: { fontSize: 14 },
            }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <ProFormTextArea
            width="lg"
            name="key"
            label={
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: token.colorTextHeading,
                }}
              >
                变量名
              </span>
            }
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
              rows: 2,
              style: { fontSize: 14 },
            }}
          />
        </div>

        <div style={sectionTitleStyle}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 4,
                height: 16,
                backgroundColor: token.colorPrimary,
                borderRadius: 2,
              }}
            />
            高级选项
          </span>
        </div>

        <div style={{ marginBottom: 20 }}>
          <ProFormTextArea
            width="lg"
            name="iframe_name"
            label={
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: token.colorTextHeading,
                }}
              >
                IFrame 定位
              </span>
            }
            tooltip="如果目标元素在 iframe 中，请输入 iframe 的定位信息"
            placeholder="例如：#iframe-id 或 iframe[name='frameName']"
            disabled={currentMethod && currentMethod.need_locator === 0}
            fieldProps={{
              rows: 3,
              style: { fontSize: 14 },
            }}
          />
        </div>

        <div style={sectionTitleStyle}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 4,
                height: 16,
                backgroundColor: token.colorPrimary,
                borderRadius: 2,
              }}
            />
            其他
          </span>
        </div>

        <div style={{ marginBottom: 20 }}>
          <ProForm.Group>
            <ProFormSwitch
              name="new_page"
              label={
                <span style={{ fontSize: 14, color: token.colorTextHeading }}>
                  打开新页面
                </span>
              }
              tooltip="操作是否会打开新的浏览器页面"
              fieldProps={{
                style: { fontSize: 14 },
              }}
            />
            <ProFormSwitch
              name="is_ignore"
              label={
                <span style={{ fontSize: 14, color: token.colorTextHeading }}>
                  忽略异常
                </span>
              }
              tooltip="执行失败时是否继续执行后续步骤"
              fieldProps={{
                style: { fontSize: 14 },
              }}
            />
          </ProForm.Group>
        </div>
      </ProForm>
    </div>
  );
};

export default PlayStepDetail;

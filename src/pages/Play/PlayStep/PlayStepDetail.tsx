import { IResponse } from '@/api';
import {
  insertPlayCaseConditionContentStep,
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
  play_condition_content_id?: number;
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
    play_condition_content_id,
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

      // 条件内容
      if (play_condition_content_id) {
        values.content_id = play_condition_content_id;
        return insertPlayCaseConditionContentStep(values).then(onFetchFinish);
      }

      return insertPlayCaseStep(values).then(onFetchFinish);
    }

    if (play_group_id) {
      values.group_id = play_group_id;
      values.is_common = false;
      return insertPlayGroupStep(values).then(onFetchFinish);
    }
    values.is_common = true;
    return savePlayStep(values).then(onFetchFinish);
  }, [stepForm, play_case_id, play_group_id, play_condition_content_id]);

  const styles = {
    container: {
      padding: '28px 32px',
      backgroundColor: token.colorBgContainer,
      minHeight: '100%',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 28,
      paddingBottom: 20,
      borderBottom: `1px solid ${token.colorBorderSecondary}`,
    },
    title: {
      margin: 0,
      fontSize: 20,
      fontWeight: 600,
      color: token.colorTextHeading,
      letterSpacing: '-0.02em',
    },
    saveButton: {
      height: 40,
      paddingLeft: 28,
      paddingRight: 28,
      borderRadius: 8,
      fontSize: 14,
      fontWeight: 500,
      boxShadow: `0 2px 8px ${token.colorPrimaryBg}`,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    section: {
      marginBottom: 32,
    },
    sectionHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginBottom: 20,
      paddingBottom: 12,
      borderBottom: `1px solid ${token.colorBorderSecondary}`,
    },
    sectionIcon: {
      width: 4,
      height: 18,
      backgroundColor: token.colorPrimary,
      borderRadius: 2,
      boxShadow: `0 0 8px ${token.colorPrimary}40`,
    },
    sectionTitle: {
      fontSize: 15,
      fontWeight: 600,
      color: token.colorTextHeading,
      letterSpacing: '-0.01em',
    },
    formItem: {
      marginBottom: 24,
    },
    label: {
      fontSize: 14,
      fontWeight: 500,
      color: token.colorTextHeading,
    },
    fieldStyle: {
      fontSize: 14,
      height: 40,
      borderRadius: 8,
      transition: 'all 0.3s ease',
    },
    textareaStyle: {
      fontSize: 14,
      borderRadius: 8,
      transition: 'all 0.3s ease',
    },
    switchGroup: {
      display: 'flex',
      gap: 48,
      padding: '16px 20px',
      backgroundColor: token.colorBgLayout,
      borderRadius: 12,
      border: `1px solid ${token.colorBorderSecondary}`,
    },
  };

  const SectionTitle: FC<{ title: string }> = ({ title }) => (
    <div style={styles.sectionHeader}>
      <div style={styles.sectionIcon} />
      <span style={styles.sectionTitle}>{title}</span>
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>步骤详情</h2>
        <Button
          type="primary"
          onClick={save}
          loading={loading}
          style={styles.saveButton}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = `0 4px 16px ${token.colorPrimaryBg}`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = `0 2px 8px ${token.colorPrimaryBg}`;
          }}
        >
          保存
        </Button>
      </div>

      <ProForm form={stepForm} submitter={false}>
        <ProFormText name="project_id" hidden />
        <ProFormText name="module_id" hidden />

        <div style={styles.section}>
          <SectionTitle title="基本信息" />
          <div style={styles.formItem}>
            <ProFormText
              width="lg"
              name="name"
              label={<span style={styles.label}>步骤名称</span>}
              placeholder="请输入步骤名称"
              required
              rules={[{ required: true, message: '步骤名称必填' }]}
              fieldProps={{
                style: styles.fieldStyle,
              }}
            />
          </div>
          <div style={styles.formItem}>
            <ProFormTextArea
              width="lg"
              name="description"
              label={<span style={styles.label}>步骤描述</span>}
              placeholder="请输入步骤描述"
              fieldProps={{
                rows: 3,
                showCount: true,
                maxLength: 500,
                style: styles.textareaStyle,
              }}
            />
          </div>
        </div>

        <div style={styles.section}>
          <SectionTitle title="元素定位" />
          <div style={styles.formItem}>
            <ProFormSelect
              name="locator"
              label={<span style={styles.label}>定位器</span>}
              width="lg"
              tooltip="内置定位器，可选"
              placeholder="可不选，直接使用 selector 定位"
              options={locatorOptions}
              disabled={currentMethod && currentMethod.need_locator === 0}
              fieldProps={{
                showSearch: true,
                allowClear: true,
                style: styles.fieldStyle,
              }}
            />
          </div>
          <div style={styles.formItem}>
            <ProFormTextArea
              width="lg"
              name="selector"
              label={<span style={styles.label}>元素选择器</span>}
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
                style: styles.textareaStyle,
              }}
            />
          </div>
        </div>

        <div style={styles.section}>
          <SectionTitle title="操作配置" />
          <div style={styles.formItem}>
            <ProFormSelect
              width="lg"
              name="method"
              label={<span style={styles.label}>操作方法</span>}
              placeholder="请选择操作方法"
              options={methodEnum}
              required
              rules={[{ required: true, message: '步骤方法必选' }]}
              fieldProps={{
                showSearch: true,
                style: styles.fieldStyle,
              }}
            />
          </div>
          <div style={styles.formItem}>
            <ProFormTextArea
              width="lg"
              name="value"
              label={<span style={styles.label}>输入值</span>}
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
                style: styles.textareaStyle,
              }}
            />
          </div>
          <div style={styles.formItem}>
            <ProFormTextArea
              width="lg"
              name="key"
              label={<span style={styles.label}>变量名</span>}
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
                style: styles.textareaStyle,
              }}
            />
          </div>
        </div>

        <div style={styles.section}>
          <SectionTitle title="高级选项" />
          <div style={styles.formItem}>
            <ProFormTextArea
              width="lg"
              name="iframe_name"
              label={<span style={styles.label}>IFrame 定位</span>}
              tooltip="如果目标元素在 iframe 中，请输入 iframe 的定位信息"
              placeholder="例如：#iframe-id 或 iframe[name='frameName']"
              disabled={currentMethod && currentMethod.need_locator === 0}
              fieldProps={{
                rows: 3,
                style: styles.textareaStyle,
              }}
            />
          </div>
        </div>

        <div style={styles.section}>
          <SectionTitle title="其他设置" />
          <div style={styles.switchGroup}>
            <ProFormSwitch
              name="new_page"
              label={
                <span style={{ ...styles.label, fontSize: 13 }}>
                  打开新页面
                </span>
              }
              tooltip="操作是否会打开新的浏览器页面"
            />
            <ProFormSwitch
              name="is_ignore"
              label={
                <span style={{ ...styles.label, fontSize: 13 }}>忽略异常</span>
              }
              tooltip="执行失败时是否继续执行后续步骤"
            />
          </div>
        </div>
      </ProForm>
    </div>
  );
};

export default PlayStepDetail;

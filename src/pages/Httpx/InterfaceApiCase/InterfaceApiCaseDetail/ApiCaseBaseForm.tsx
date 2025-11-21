import {
  baseInfoApiCase,
  insertApiCase,
  setApiCase,
} from '@/api/inter/interCase';
import { CONFIG } from '@/utils/config';
import { history } from '@@/core/history';
import {
  ProCard,
  ProForm,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { Button, Form, message } from 'antd';
import { FC, useEffect } from 'react';

interface SelfProps {
  case_id?: number;
  currentProjectId?: number;
  currentModuleId?: number;
  callback?: () => void;
}

const ApiCaseBaseForm: FC<SelfProps> = (props) => {
  const { case_id, currentProjectId, callback, currentModuleId } = props;
  const [baseForm] = Form.useForm();
  const { API_STATUS_SELECT, API_LEVEL_SELECT } = CONFIG;

  //路由进入。空白页
  useEffect(() => {
    if (currentProjectId && currentModuleId) {
      baseForm.setFieldsValue({
        project_id: currentProjectId,
        module_id: currentModuleId,
      });
    }
  }, [currentProjectId, currentModuleId]);

  useEffect(() => {
    if (case_id) {
      Promise.all([baseInfoApiCase(case_id)]).then(([baseInfo]) => {
        if (baseInfo.code === 0) {
          baseForm.setFieldsValue(baseInfo.data);
        }
      });
    }
  }, [case_id]);

  /**
   * 保存基本信息
   */
  const saveBaseInfo = async () => {
    const values = await baseForm.getFieldsValue(true);
    if (case_id) {
      await setApiCase(values).then(async ({ code, msg }) => {
        if (code === 0) {
          await message.success(msg);
        }
      });
    } else {
      await insertApiCase(values).then(async ({ code, data }) => {
        if (code === 0) {
          history.push(
            `/interface/caseApi/detail/caseApiId=${data.id}&projectId=${currentProjectId}&moduleId=${currentModuleId}`,
          );
          message.success('添加成功');
        }
      });
    }
    callback?.();
  };
  return (
    <ProCard
      extra={
        <Button onClick={saveBaseInfo} type={'primary'}>
          Save
        </Button>
      }
    >
      <ProForm submitter={false} form={baseForm}>
        <ProFormText
          hidden={true}
          width={'lg'}
          label={'所属项目'}
          name={'project_id'}
        />
        <ProFormText hidden={true} required name="module_id" label="所属模块" />
        <ProFormText
          width={'lg'}
          name="title"
          label="用例标题"
          required={true}
          rules={[{ required: true, message: '用例标题必填' }]}
        />

        <ProForm.Group>
          <ProFormSelect
            name="level"
            label="优先级"
            width={'lg'}
            initialValue={'P1'}
            options={API_LEVEL_SELECT}
            required={true}
            rules={[{ required: true, message: '用例优先级必选' }]}
          />
          <ProFormSelect
            name="status"
            label="用例状态"
            initialValue={'DEBUG'}
            width={'lg'}
            options={API_STATUS_SELECT}
            required={true}
            rules={[{ required: true, message: '用例状态必须选' }]}
          />
        </ProForm.Group>
        <ProFormTextArea
          width={'lg'}
          name="desc"
          label="用例描述"
          required={true}
          fieldProps={{
            rows: 2,
          }}
          rules={[{ required: true, message: '用例描述必填' }]}
        />
      </ProForm>
    </ProCard>
  );
};

export default ApiCaseBaseForm;

import { IModuleEnum } from '@/api';
import { queryProject, queryUser } from '@/api/base';
import { getRequirement, updateRequirement } from '@/api/case/requirement';
import { CaseHubConfig } from '@/pages/CaseHub/CaseConfig';
import { IRequirement } from '@/pages/CaseHub/type';
import { ModuleEnum } from '@/utils/config';
import { fetchModulesEnum } from '@/utils/somefunc';
import {
  ProCard,
  ProForm,
  ProFormSelect,
  ProFormText,
  ProFormTreeSelect,
} from '@ant-design/pro-components';
import { Form } from 'antd';
import { FC, useEffect, useState } from 'react';

interface Props {
  callback: () => void;
  requirementId?: number;
}

const RequirementDetail: FC<Props> = ({ callback, requirementId }) => {
  const [reqForm] = Form.useForm<IRequirement>();
  const [moduleEnum, setModuleEnum] = useState<IModuleEnum[]>([]);

  const { CASE_LEVEL_OPTION } = CaseHubConfig;
  const [selectProjectId, setSelectProjectId] = useState<number>();
  const [users, setUsers] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  useEffect(() => {
    queryProject().then(async ({ code, data }) => {
      if (code === 0) {
        setProjects(
          data.map((item) => ({ label: item.title, value: item.id })),
        );
      }
    });
  }, []);

  useEffect(() => {
    if (selectProjectId) {
      setSelectProjectId(selectProjectId);
      fetchModulesEnum(selectProjectId, ModuleEnum.CASE, setModuleEnum).then();
    } else {
      setModuleEnum([]);
    }
  }, [selectProjectId]);
  useEffect(() => {
    if (requirementId) {
      getRequirement(requirementId).then(async ({ code, data }) => {
        if (code === 0) {
          queryUser().then(({ code, data }) => {
            if (code === 0) {
              setUsers(
                data.map((item) => {
                  return {
                    label: item.username,
                    value: item.id,
                  };
                }),
              );
            }
          });
          reqForm.setFieldsValue(data);
          setSelectProjectId(data.project_id);
        }
      });
    }
  }, [requirementId]);

  return (
    <ProCard>
      <ProForm
        form={reqForm}
        onFinish={async (values) => {
          if (requirementId) {
            const { code } = await updateRequirement({
              ...values,
              id: requirementId,
            });
            if (code === 0) {
              callback();
            }
          }
        }}
      >
        <ProForm.Group>
          <ProFormSelect
            options={projects}
            label={'所属项目'}
            name={'project_id'}
            width={'md'}
            required={true}
            onChange={(value) => {
              setSelectProjectId(value as number);
              reqForm.setFieldValue('module_id', undefined);
            }}
          />
          <ProFormTreeSelect
            required
            width={'md'}
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
        </ProForm.Group>
        <ProFormText name={'requirement_url'} label={'需求连接'} />
        <ProForm.Group>
          <ProFormText
            name={'requirement_name'}
            label={'需求名'}
            required={true}
            width={'lg'}
            rules={[{ required: true, message: '请填写需求名' }]}
          />
          <ProFormSelect
            name={'requirement_level'}
            label={'需求等级'}
            required={true}
            width={'sm'}
            initialValue={'P2'}
            options={CASE_LEVEL_OPTION}
          />
        </ProForm.Group>
        <ProFormSelect
          showSearch
          name={'maintainer'}
          label={'维护人'}
          required={true}
          options={users}
          fieldProps={{
            optionFilterProp: 'label', // 确保搜索是基于 label(chargeName) 而不是 value(chargeId)
            labelInValue: false, // 确保只提交 value 而不是 {value,label} 对象
          }}
        />
        <ProFormSelect
          showSearch
          mode="multiple"
          name={'develops'}
          label={'开发'}
          debounceTime={1000}
          options={users}
          fieldProps={{
            optionFilterProp: 'label', // 确保搜索是基于 label(chargeName) 而不是 value(chargeId)
            labelInValue: false, // 确保只提交 value 而不是 {value,label} 对象
          }}
        />
      </ProForm>
    </ProCard>
  );
};

export default RequirementDetail;

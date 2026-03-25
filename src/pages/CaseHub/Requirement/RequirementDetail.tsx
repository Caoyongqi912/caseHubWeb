import { IModuleEnum } from '@/api';
import { queryProject, queryUser } from '@/api/base';
import { getRequirement, updateRequirement } from '@/api/case/requirement';
import { CaseHubConfig } from '@/pages/CaseHub/CaseConfig';
import { useCaseHubTheme } from '@/pages/CaseHub/styles';
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
import { Form, Tag } from 'antd';
import { FC, useEffect, useMemo, useState } from 'react';

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
  const { token, colors, spacing, borderRadius } = useCaseHubTheme();

  const cardStyle = useMemo(
    () => ({
      borderRadius: borderRadius.xl,
      border: `1px solid ${colors.border}`,
      boxShadow: `0 2px 8px ${colors.bgContainer}20`,
      overflow: 'hidden' as const,
    }),
    [borderRadius, colors],
  );

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

  const formItemStyle = useMemo(
    () => ({
      marginBottom: spacing.lg,
    }),
    [spacing],
  );

  return (
    <ProCard style={cardStyle}>
      <ProForm
        form={reqForm}
        layout="horizontal"
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 16 }}
        //@ts-ignore
        formItemProps={{ style: formItemStyle }}
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
        submitter={{
          render: (_, dom) => (
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginTop: spacing.lg,
              }}
            >
              {dom}
            </div>
          ),
        }}
      >
        <ProCard
          title={
            <Tag
              style={{
                background: colors.primaryBg,
                borderColor: colors.primary,
                color: colors.primary,
              }}
            >
              基本信息
            </Tag>
          }
          style={{ marginBottom: spacing.md }}
          bordered={false}
        >
          <ProForm.Group>
            <ProFormSelect
              options={projects}
              label={'所属项目'}
              name={'project_id'}
              width={'md'}
              required={true}
              rules={[{ required: true, message: '请选择项目' }]}
              fieldProps={{
                onChange: (value) => {
                  setSelectProjectId(value as number);
                  reqForm.setFieldValue('module_id', undefined);
                },
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
          <ProFormText
            name={'requirement_url'}
            label={'需求连接'}
            placeholder={'请输入需求链接'}
            fieldProps={{
              variant: 'filled',
            }}
          />
        </ProCard>

        <ProCard
          title={
            <Tag
              style={{
                background: colors.infoBg,
                borderColor: colors.info,
                color: colors.info,
              }}
            >
              需求详情
            </Tag>
          }
          style={{ marginBottom: spacing.md }}
          bordered={false}
        >
          <ProFormText
            name={'requirement_name'}
            label={'需求名'}
            required={true}
            width={'lg'}
            rules={[{ required: true, message: '请填写需求名' }]}
            fieldProps={{
              variant: 'filled',
              placeholder: '请输入需求名称',
            }}
          />
          <ProFormSelect
            name={'requirement_level'}
            label={'需求等级'}
            required={true}
            width={'sm'}
            initialValue={'P2'}
            options={CASE_LEVEL_OPTION}
            fieldProps={{
              variant: 'filled',
            }}
          />
        </ProCard>

        <ProCard
          title={
            <Tag
              style={{
                background: colors.warningBg,
                borderColor: colors.warning,
                color: colors.warning,
              }}
            >
              维护人员
            </Tag>
          }
          bordered={false}
        >
          <ProFormSelect
            showSearch
            name={'maintainer'}
            label={'维护人'}
            required={true}
            options={users}
            rules={[{ required: true, message: '请选择维护人' }]}
            fieldProps={{
              variant: 'filled',
              optionFilterProp: 'label',
              labelInValue: false,
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
              variant: 'filled',
              optionFilterProp: 'label',
              labelInValue: false,
            }}
          />
        </ProCard>
      </ProForm>
    </ProCard>
  );
};

export default RequirementDetail;

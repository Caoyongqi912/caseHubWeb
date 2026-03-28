import { IModuleEnum } from '@/api';
import { queryUser } from '@/api/base';
import { getRequirement, updateRequirement } from '@/api/case/requirement';
import { CaseHubConfig } from '@/pages/CaseHub/CaseConfig';
import { useCaseHubTheme } from '@/pages/CaseHub/styles';
import { IRequirement } from '@/pages/CaseHub/type';
import { ModuleEnum } from '@/utils/config';
import { fetchModulesEnum } from '@/utils/somefunc';
import {
  ApartmentOutlined,
  FileTextOutlined,
  LinkOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import {
  ProCard,
  ProForm,
  ProFormSelect,
  ProFormText,
  ProFormTreeSelect,
} from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import { Form } from 'antd';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';

interface Props {
  callback: () => void;
  requirementId?: number;
}

const RequirementDetail: FC<Props> = ({ callback, requirementId }) => {
  const [reqForm] = Form.useForm<IRequirement>();
  const { initialState } = useModel('@@initialState');

  const [moduleEnum, setModuleEnum] = useState<IModuleEnum[]>([]);
  const { CASE_LEVEL_OPTION } = CaseHubConfig;
  const [selectProjectId, setSelectProjectId] = useState<number>();
  const [users, setUsers] = useState<any[]>([]);
  const { colors, spacing, borderRadius } = useCaseHubTheme();
  const projects = initialState?.projects || [];

  const cardStyle = useMemo(
    () => ({
      borderRadius: borderRadius.xl,
      border: `1px solid ${colors.border}`,
      boxShadow: `0 2px 8px ${colors.bgContainer}20`,
      overflow: 'hidden' as const,
    }),
    [borderRadius, colors],
  );

  const formItemStyle = useMemo(
    () => ({
      marginBottom: spacing.lg,
    }),
    [spacing],
  );

  useEffect(() => {
    let isMounted = true;
    queryUser().then(({ code, data }) => {
      if (isMounted && code === 0) {
        setUsers(
          data.map((item) => ({
            label: item.username,
            value: item.id,
          })),
        );
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    if (selectProjectId) {
      fetchModulesEnum(
        selectProjectId,
        ModuleEnum.REQUIREMENT,
        setModuleEnum,
      ).then();
    } else if (isMounted) {
      setModuleEnum([]);
    }
    return () => {
      isMounted = false;
    };
  }, [selectProjectId]);

  useEffect(() => {
    let isMounted = true;
    if (requirementId) {
      getRequirement(requirementId).then(({ code, data }) => {
        if (isMounted && code === 0) {
          reqForm.setFieldsValue(data);
          setSelectProjectId(data.project_id);
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [requirementId, reqForm]);

  const handleProjectChange = useCallback(
    (value: number) => {
      setSelectProjectId(value);
      reqForm.setFieldValue('module_id', undefined);
    },
    [reqForm],
  );

  const handleFinish = useCallback(
    async (values: IRequirement) => {
      if (requirementId) {
        const { code } = await updateRequirement({
          ...values,
          id: requirementId,
        });
        if (code === 0) {
          callback();
        }
      }
    },
    [requirementId, callback],
  );

  const sectionTitleStyle = useMemo(
    () => ({
      display: 'flex',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.md,
    }),
    [spacing],
  );

  return (
    <ProCard style={cardStyle} bodyStyle={{ padding: spacing.lg }}>
      <ProForm
        form={reqForm}
        layout="horizontal"
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 16 }}
        //@ts-ignore
        formItemProps={{ style: formItemStyle }}
        onFinish={handleFinish}
        submitter={{
          render: (_, dom) => (
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginTop: spacing.xl,
                paddingTop: spacing.lg,
                borderTop: `1px dashed ${colors.border}`,
              }}
            >
              {dom}
            </div>
          ),
        }}
      >
        <ProCard
          title={
            <div style={sectionTitleStyle}>
              <ApartmentOutlined style={{ color: colors.primary }} />
              <span>基本信息</span>
            </div>
          }
          style={{
            marginBottom: spacing.lg,
            background: colors.primaryBg,
            borderRadius: borderRadius.lg,
          }}
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
                variant: 'filled',

                onChange: handleProjectChange,
              }}
            />
            <ProFormTreeSelect
              required
              width={'md'}
              name="module_id"
              label="所属模块"
              rules={[{ required: true, message: '所属模块必选' }]}
              fieldProps={{
                variant: 'filled',

                treeData: moduleEnum,
                fieldNames: {
                  label: 'title',
                  value: 'value',
                },
                filterTreeNode: true,
              }}
            />
          </ProForm.Group>
          <ProFormText
            name={'requirement_url'}
            label={'需求连接'}
            placeholder={'请输入需求链接'}
            width={'lg'}
            fieldProps={{
              variant: 'filled',
              prefix: <LinkOutlined style={{ color: colors.textSecondary }} />,
            }}
          />
        </ProCard>

        <ProCard
          title={
            <div style={sectionTitleStyle}>
              <FileTextOutlined style={{ color: colors.info }} />
              <span>需求详情</span>
            </div>
          }
          style={{
            marginBottom: spacing.lg,
            background: colors.infoBg,
            borderRadius: borderRadius.lg,
          }}
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
            width={'lg'}
            initialValue={'P2'}
            options={CASE_LEVEL_OPTION}
            fieldProps={{
              variant: 'filled',
            }}
          />
        </ProCard>

        <ProCard
          title={
            <div style={sectionTitleStyle}>
              <TeamOutlined style={{ color: colors.warning }} />
              <span>维护人员</span>
            </div>
          }
          style={{
            background: colors.warningBg,
            borderRadius: borderRadius.lg,
          }}
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

import { IModuleEnum } from '@/api';
import { searchUser } from '@/api/base';
import { insertRequirement } from '@/api/case/requirement';
import MyDrawer from '@/components/MyDrawer';
import { CaseHubConfig } from '@/pages/CaseHub/config/constants';
import { useCaseHubTheme } from '@/pages/CaseHub/styles';
import { IRequirement } from '@/pages/CaseHub/types';
import { ModuleEnum } from '@/utils/config';
import { fetchModulesEnum } from '@/utils/somefunc';
import { useModel } from '@@/exports';
import { PlusOutlined } from '@ant-design/icons';
import {
  ProCard,
  ProFormInstance,
  ProFormSelect,
  ProFormText,
  ProFormTreeSelect,
  StepsForm,
} from '@ant-design/pro-components';

import { Button, message } from 'antd';
import { FC, useEffect, useMemo, useRef, useState } from 'react';
import ChoiceCaseTable from './ChoiceCaseTable';

interface Props {
  currentProjectId?: number;
  currentModuleId?: number;
  callback: () => void;
}

const RequirementForm: FC<Props> = ({
  currentProjectId,
  currentModuleId,
  callback,
}) => {
  const formRef = useRef<ProFormInstance>();
  const [moduleEnum, setModuleEnum] = useState<IModuleEnum[]>([]);
  const [selectProjectId, setSelectProjectId] = useState<number>();
  const [drawerVisible, setDrawerVisible] = useState<boolean>(false);
  const { initialState } = useModel('@@initialState');
  const projects = initialState?.projects || [];
  const currentUser = initialState?.currentUser;
  const { CASE_LEVEL_OPTION } = CaseHubConfig;
  const { colors, spacing, borderRadius } = useCaseHubTheme();

  useEffect(() => {
    if (currentProjectId) {
      setSelectProjectId(currentProjectId);
    }
  }, [currentProjectId]);

  useEffect(() => {
    let isMounted = true;
    if (selectProjectId && drawerVisible) {
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
  }, [selectProjectId, drawerVisible]);

  const queryUser: any = async (value: any) => {
    const { keyWords } = value;
    if (keyWords) {
      const { code, data } = await searchUser({ username: keyWords });
      if (code === 0) {
        return data.map((item) => ({
          label: item.username,
          value: item.id,
        }));
      }
    }
  };

  const cardStyle = useMemo(
    () => ({
      borderRadius: borderRadius.xl,
      border: `1px solid ${colors.border}`,
      boxShadow: `0 2px 8px ${colors.bgContainer}20`,
      overflow: 'hidden' as const,
    }),
    [borderRadius, colors],
  );

  const RequirementsForm = (
    <StepsForm.StepForm
      name="base"
      title="需求信息"
      initialValues={{
        project_id: currentProjectId || selectProjectId,
        module_id: currentModuleId,
      }}
      stepProps={{
        description: '填写需求相关信息',
      }}
    >
      <ProFormSelect
        options={projects}
        label={'所属项目'}
        name={'project_id'}
        required={true}
        rules={[{ required: true, message: '请选择项目' }]}
        fieldProps={{
          variant: 'filled',
          onChange: (value) => {
            setSelectProjectId(value as number);
            formRef.current?.setFieldValue('module_id', undefined);
          },
        }}
      />
      <ProFormTreeSelect
        required
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
      <ProFormText
        name={'requirement_url'}
        label={'需求连接'}
        placeholder={'请输入需求链接'}
        fieldProps={{
          variant: 'filled',
        }}
      />
      <ProFormText
        name={'requirement_name'}
        label={'需求名'}
        required={true}
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
        initialValue={'P2'}
        options={CASE_LEVEL_OPTION}
        fieldProps={{
          variant: 'filled',
        }}
      />
    </StepsForm.StepForm>
  );

  const MaintainerInfoForm = (
    <StepsForm.StepForm
      name="user"
      title="维护人"
      stepProps={{
        description: '填写测试参与人',
      }}
    >
      <ProFormSelect
        showSearch
        name={'maintainer'}
        label={'维护人'}
        required={true}
        request={queryUser}
        debounceTime={1000}
        initialValue={currentUser?.id}
        fieldProps={{
          variant: 'filled',
          value: { value: currentUser?.id, label: currentUser?.username },
          optionFilterProp: 'label',
          labelInValue: false,
        }}
      />
      <ProFormSelect
        showSearch
        mode="multiple"
        name={'develops'}
        label={'开发'}
        request={queryUser}
        debounceTime={1000}
        fieldProps={{
          variant: 'filled',
          optionFilterProp: 'label',
          labelInValue: false,
        }}
      />
    </StepsForm.StepForm>
  );

  const [selectedCaseIds, setSelectedCaseIds] = useState<number[]>([]);

  const onCaseSelect = (caseIds: number[]) => {
    setSelectedCaseIds(caseIds);
  };

  const CaseHubChoiceForm = (
    <StepsForm.StepForm name="case" title="模块用例关联">
      <ProFormText name="case_ids" hidden initialValue={[]} />
      <ChoiceCaseTable
        onCaseSelect={onCaseSelect}
        projectId={selectProjectId}
      />
    </StepsForm.StepForm>
  );

  const save = async (values: IRequirement) => {
    const submitData = {
      ...values,
      case_ids: selectedCaseIds,
    };
    const { code, msg } = await insertRequirement(submitData);
    if (code === 0) {
      message.success(msg);
      setDrawerVisible(false);
      setSelectedCaseIds([]);
      callback();
    }
  };

  return (
    <>
      <MyDrawer
        name={'添加需求'}
        width={'70%'}
        open={drawerVisible}
        setOpen={setDrawerVisible}
      >
        <ProCard style={cardStyle}>
          <StepsForm<IRequirement>
            formRef={formRef}
            onFinish={save}
            stepsProps={{ direction: 'vertical' }}
            formProps={{
              validateMessages: {
                required: '此项为必填项',
              },
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
            {RequirementsForm}
            {MaintainerInfoForm}
            {CaseHubChoiceForm}
          </StepsForm>
        </ProCard>
      </MyDrawer>
      <Button
        type="primary"
        onClick={() => setDrawerVisible(true)}
        icon={<PlusOutlined />}
        style={{
          fontWeight: 500,
          borderRadius: borderRadius.md,
        }}
      >
        添加需求
      </Button>
    </>
  );
};

export default RequirementForm;

import { IModuleEnum } from '@/api';
import { queryProject } from '@/api/base';
import { moveTestCase2Common, setAllTestCaseStatus } from '@/api/case/testCase';
import { useCaseHubTheme } from '@/pages/CaseHub/styles';
import { ITestCase } from '@/pages/CaseHub/type';
import { ModuleEnum } from '@/utils/config';
import { fetchModulesEnum } from '@/utils/somefunc';
import {
  ModalForm,
  ProCard,
  ProFormSelect,
  ProFormTreeSelect,
} from '@ant-design/pro-components';
import { Button, Divider, Form, message, Space, Typography } from 'antd';
import React, { FC, useEffect, useMemo, useState } from 'react';

const { Text, Link } = Typography;

interface Props {
  showCheckButton: boolean;
  callback: () => void;
  selectedCase: number[];
  setSelectedCase: React.Dispatch<React.SetStateAction<number[]>>;
  allTestCase: ITestCase[];
}

const ChoiceSettingArea: FC<Props> = ({
  showCheckButton,
  allTestCase,
  selectedCase,
  setSelectedCase,
  callback,
}) => {
  const [form] = Form.useForm();
  const [selectProjectId, setSelectProjectId] = useState<number>();
  const [moduleEnum, setModuleEnum] = useState<IModuleEnum[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const { colors, spacing, borderRadius } = useCaseHubTheme();

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

  const setAllSuccess = async () => {
    const values = {
      caseIds: selectedCase,
      status: 1,
    };
    const { code, msg } = await setAllTestCaseStatus(values);
    if (code === 0) {
      message.success(msg);
      callback();
    }
  };

  const setAllFail = async () => {
    const values = {
      caseIds: selectedCase,
      status: 2,
    };
    const { code, msg } = await setAllTestCaseStatus(values);
    if (code === 0) {
      message.success(msg);
      callback();
    }
  };

  const moveToCaseLib = async () => {
    const v = await form.validateFields();
    const values = {
      ...v,
      caseIds: selectedCase,
    };
    const { code, msg } = await moveTestCase2Common(values);
    if (code === 0) {
      message.success(msg);
      return true;
    }
  };

  const cardStyle = useMemo(
    () => ({
      borderRadius: borderRadius.lg,
      background: `linear-gradient(135deg, ${colors.warningBg}20 0%, ${colors.bgContainer} 100%)`,
      border: `1px solid ${colors.border}`,
      transition: `all ${colors.primary}`,
    }),
    [borderRadius, colors],
  );

  return (
    <>
      {showCheckButton && (
        <ProCard
          collapsed
          style={cardStyle}
          headStyle={{
            background: `linear-gradient(135deg, ${colors.primaryBg} 0%, ${colors.bgContainer} 100%)`,
            borderBottom: `1px solid ${colors.border}`,
            padding: `${spacing.sm}px ${spacing.md}px`,
          }}
          bodyStyle={{
            padding: `${spacing.sm}px ${spacing.md}px`,
          }}
          title={
            <div
              style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}
            >
              <Text strong style={{ color: colors.primary }}>
                已选择 {selectedCase.length} 项
              </Text>
              <Space size="small">
                <Link
                  style={{ color: colors.primary }}
                  onClick={() => {
                    if (allTestCase) {
                      setSelectedCase(allTestCase.map((tc) => tc.id!));
                    }
                  }}
                >
                  全选
                </Link>
                <Link
                  style={{ color: colors.textSecondary }}
                  onClick={() => setSelectedCase([])}
                >
                  取消选择
                </Link>
              </Space>
            </div>
          }
          extra={
            <Space size="small">
              <Link style={{ color: colors.success }} onClick={setAllSuccess}>
                全部成功
              </Link>
              <Divider />
              <Link style={{ color: colors.error }} onClick={setAllFail}>
                全部失败
              </Link>
              <Divider />
              <ModalForm
                form={form}
                onFinish={moveToCaseLib}
                trigger={
                  <Button type="link" style={{ color: colors.primary }}>
                    移动到用例库
                  </Button>
                }
              >
                <ProFormSelect
                  options={projects}
                  label={'所属项目'}
                  name={'project_id'}
                  width={'md'}
                  required={true}
                  rules={[{ required: true, message: '请选择项目' }]}
                  fieldProps={{
                    variant: 'filled',
                    onChange: (value) => {
                      setSelectProjectId(value as number);
                      form.setFieldValue('module_id', undefined);
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
                    variant: 'filled',
                    treeData: moduleEnum,
                    fieldNames: {
                      label: 'title',
                    },
                    filterTreeNode: true,
                  }}
                />
              </ModalForm>
            </Space>
          }
        />
      )}
    </>
  );
};

export default ChoiceSettingArea;

/**
 * 批量设置区域组件
 * 提供批量设置用例状态、评审状态、移动用例库等功能
 */
import { IModuleEnum } from '@/api';
import { queryProject } from '@/api/base';
import {
  moveTestCase2Common,
  setAllTestCaseReview,
  setAllTestCaseStatus,
} from '@/api/case/testCase';
import { useCaseHubTheme } from '@/pages/CaseHub/styles';
import { useChoiceSettingAreaStyles } from '@/pages/CaseHub/styles/ChoiceSettingAreaStyles';
import { ITestCase } from '@/pages/CaseHub/types';
import { ModuleEnum } from '@/utils/config';
import { fetchModulesEnum } from '@/utils/somefunc';
import {
  CheckCircleFilled,
  CheckSquareOutlined,
  CloseCircleFilled,
  FileProtectOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import {
  ModalForm,
  ProFormSelect,
  ProFormTreeSelect,
} from '@ant-design/pro-components';
import { Button, Form, message, Space, Typography } from 'antd';
import React, { FC, useEffect, useState } from 'react';

const { Text } = Typography;

/**
 * ChoiceSettingArea 组件属性
 */
interface Props {
  /** 需求ID */
  requirementId: number;
  /** 是否显示批量设置区域 */
  showCheckButton: boolean;
  /** 刷新回调 */
  callback: () => void;
  /** 已选择的用例ID列表 */
  selectedCase: number[];
  /** 设置选中用例回调 */
  setSelectedCase: React.Dispatch<React.SetStateAction<number[]>>;
  /** 所有用例列表 */
  allTestCase: ITestCase[];
}

/**
 * 批量设置区域组件
 * 提供批量设置用例状态、评审状态、移动用例库等功能
 * @param props - 组件属性
 */
const ChoiceSettingArea: FC<Props> = ({
  showCheckButton,
  allTestCase,
  selectedCase,
  setSelectedCase,
  callback,
  requirementId,
}) => {
  const [form] = Form.useForm();
  const [selectProjectId, setSelectProjectId] = useState<number>();
  const [moduleEnum, setModuleEnum] = useState<IModuleEnum[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const { colors, spacing } = useCaseHubTheme();
  const styles = useChoiceSettingAreaStyles();

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
    const { code, msg } = await setAllTestCaseStatus({
      requirement_id: requirementId,
      case_ids: selectedCase,
      case_status: 1,
    });
    if (code === 0) {
      message.success(msg);
      callback();
    }
  };

  const setAllReview = async () => {
    const { code, msg } = await setAllTestCaseReview({
      requirement_id: requirementId,
      case_ids: selectedCase,
      is_review: true,
    });
    if (code === 0) {
      message.success(msg);
      callback();
    }
  };

  const setAllFail = async () => {
    const { code, msg } = await setAllTestCaseStatus({
      requirement_id: requirementId,
      case_ids: selectedCase,
      case_status: 2,
    });
    if (code === 0) {
      message.success(msg);
      callback();
    }
  };

  const moveToCaseLib = async () => {
    const v = await form.validateFields();
    const values = { ...v, case_ids: selectedCase };
    const { code, msg } = await moveTestCase2Common(values);
    if (code === 0) {
      message.success(msg);
      setMoveModalOpen(false);
      return true;
    }
  };

  if (!showCheckButton) {
    return null;
  }

  return (
    <>
      <ModalForm
        form={form}
        onFinish={moveToCaseLib}
        open={moveModalOpen}
        onOpenChange={setMoveModalOpen}
        title="移动到用例库"
        submitter={{
          searchConfig: { submitText: '确认移动', resetText: '重置' },
        }}
      >
        <ProFormSelect
          options={projects}
          label="所属项目"
          name="project_id"
          width="md"
          required
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
          width="md"
          name="module_id"
          label="所属模块"
          rules={[{ required: true, message: '所属模块必选' }]}
          fieldProps={{
            variant: 'filled',
            treeData: moduleEnum,
            fieldNames: { label: 'title' },
            filterTreeNode: true,
          }}
        />
      </ModalForm>

      <div style={styles.container()}>
        <div style={styles.selectionInfo()}>
          <div style={styles.countBadge()}>
            <CheckSquareOutlined
              style={{ color: colors.primary, fontSize: 14 }}
            />
            <Text style={styles.countValue()}>{selectedCase.length}</Text>
            <Text style={styles.countLabel()}>项已选</Text>
          </div>

          <Text
            style={{
              ...styles.linkText(colors.primary),
              marginLeft: spacing.sm,
            }}
            onClick={() =>
              allTestCase && setSelectedCase(allTestCase.map((tc) => tc.id!))
            }
          >
            全选
          </Text>

          <Text
            style={{
              ...styles.linkText(colors.textSecondary),
              cursor: 'default',
            }}
          >
            |
          </Text>

          <Text
            style={styles.linkText(colors.textSecondary)}
            onClick={() => setSelectedCase([])}
          >
            取消
          </Text>
        </div>

        <Space size="small" separator={<span style={styles.divider()} />}>
          <Button
            type="text"
            size="small"
            icon={
              <CheckCircleFilled
                style={{ color: colors.success, fontSize: 13 }}
              />
            }
            onClick={setAllSuccess}
            style={styles.actionBtn('success')}
          >
            全部成功
          </Button>

          <Button
            type="text"
            size="small"
            icon={
              <CloseCircleFilled
                style={{ color: colors.error, fontSize: 13 }}
              />
            }
            onClick={setAllFail}
            style={styles.actionBtn('error')}
          >
            全部失败
          </Button>

          <Button
            type="text"
            size="small"
            icon={
              <FileProtectOutlined
                style={{ color: colors.success, fontSize: 13 }}
              />
            }
            onClick={setAllReview}
            style={styles.actionBtn('warning')}
          >
            完成评审
          </Button>

          <Button
            type="text"
            size="small"
            icon={
              <SwapOutlined style={{ color: colors.primary, fontSize: 13 }} />
            }
            onClick={() => setMoveModalOpen(true)}
            style={styles.actionBtn('default')}
          >
            移动到用例库
          </Button>
        </Space>
      </div>
    </>
  );
};

export default ChoiceSettingArea;

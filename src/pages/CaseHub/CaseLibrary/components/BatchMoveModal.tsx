import { IModuleEnum } from '@/api';
import { useBatchMove } from '@/pages/CaseHub/CaseLibrary/components/hooks';
import { CaseHubConfig } from '@/pages/CaseHub/config/constants';
import { useCaseHubTheme } from '@/pages/CaseHub/styles';
import { ModuleEnum } from '@/utils/config';
import { fetchModulesEnum } from '@/utils/somefunc';
import {
  ProForm,
  ProFormSelect,
  ProFormTreeSelect,
} from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import { Form, Modal } from 'antd';
import { FC, useCallback, useEffect, useState } from 'react';

export interface BatchMoveModalProps {
  open: boolean;
  selectedCaseIds: number[];
  onCancel: () => void;
  onSuccess?: () => void;
}

const BatchMoveModal: FC<BatchMoveModalProps> = ({
  open,
  selectedCaseIds,
  onCancel,
  onSuccess,
}) => {
  const [moveForm] = Form.useForm();
  const { initialState } = useModel('@@initialState');
  const [selectProjectId, setSelectProjectId] = useState<number>();
  const [moduleEnum, setModuleEnum] = useState<IModuleEnum[]>([]);
  const { colors, token } = useCaseHubTheme();
  const { CASE_LEVEL_OPTION, CASE_TYPE_OPTION } = CaseHubConfig;

  const projects = initialState?.projects || [];
  const { moveCases, loading } = useBatchMove({ onSuccess });

  useEffect(() => {
    if (selectProjectId) {
      fetchModulesEnum(
        selectProjectId,
        ModuleEnum.CASE,
        setModuleEnum,
        true,
      ).then();
    }
  }, [selectProjectId]);

  useEffect(() => {
    if (!open) {
      moveForm.resetFields();
      setSelectProjectId(undefined);
    }
  }, [open, moveForm]);

  const handleOk = useCallback(async () => {
    try {
      const values = await moveForm.validateFields();
      if (selectedCaseIds.length === 0) return;
      await moveCases(selectedCaseIds, values.project_id, values.module_id);
      onCancel();
    } catch (error) {
      console.error('操作失败:', error);
    }
  }, [moveForm, selectedCaseIds, moveCases, onCancel]);

  return (
    <Modal
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      title={<span style={{ fontWeight: 600 }}>批量移动用例</span>}
      width={600}
      confirmLoading={loading}
    >
      <div
        style={{
          color: colors.textTertiary,
          marginBottom: 16,
          fontSize: token.fontSizeSM,
        }}
      >
        已选择 {selectedCaseIds.length} 项用例
      </div>
      <ProForm submitter={false} form={moveForm} layout="vertical">
        <ProFormSelect
          width="md"
          options={projects}
          label="项目"
          name="project_id"
          required
          onChange={(value) => setSelectProjectId(value as number)}
          fieldProps={{ placeholder: '请选择目标项目' }}
        />
        <ProFormTreeSelect
          required
          name="module_id"
          label="模块"
          rules={[{ required: true, message: '所属模块必选' }]}
          fieldProps={{
            treeData: moduleEnum,
            fieldNames: { label: 'title' },
            filterTreeNode: true,
            placeholder: '请选择目标模块',
          }}
          width="md"
        />
      </ProForm>
    </Modal>
  );
};

export default BatchMoveModal;

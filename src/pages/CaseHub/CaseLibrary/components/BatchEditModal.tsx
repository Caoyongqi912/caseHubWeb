import {
  BatchEditValues,
  useBatchEdit,
} from '@/pages/CaseHub/CaseLibrary/components/hooks';
import { toSelectOptions } from '@/pages/CaseHub/hooks/caseEnumOption';
import { useCaseEnumConfig } from '@/pages/CaseHub/hooks/useCaseEnumConfig';
import { useCaseHubTheme } from '@/pages/CaseHub/styles';
import { Checkbox, Input, Modal, Select } from 'antd';
import { FC, useCallback, useMemo, useState } from 'react';

export interface BatchEditModalProps {
  open: boolean;
  selectedCaseIds: number[];
  onCancel: () => void;
  onSuccess?: () => void;
}

const BatchEditModal: FC<BatchEditModalProps> = ({
  open,
  selectedCaseIds,
  onCancel,
  onSuccess,
}) => {
  // 用例类型从后端枚举配置拉取（管理员在配置中心增删后自动生效）
  const { options: typeOptions } = useCaseEnumConfig('CASE_TYPE');
  const typeSelectOptions = useMemo(
    () => toSelectOptions(typeOptions),
    [typeOptions],
  );

  const { colors, spacing, token } = useCaseHubTheme();

  // 用例等级从后端枚举配置拉取（管理员在配置中心增删后自动生效）
  const { options: levelOptions } = useCaseEnumConfig('CASE_LEVEL');
  const levelSelectOptions = useMemo(
    () => toSelectOptions(levelOptions),
    [levelOptions],
  );

  const [caseTag, setCaseTag] = useState<string>('');
  const [caseLevel, setCaseLevel] = useState<string | undefined>(undefined);
  const [caseType, setCaseType] = useState<number | undefined>(undefined);
  const [changeLevel, setChangeLevel] = useState(false);
  const [changeType, setChangeType] = useState(false);

  const { editCases, loading } = useBatchEdit({ onSuccess });

  const handleModalClose = useCallback(() => {
    setCaseTag('');
    setCaseLevel(undefined);
    setCaseType(undefined);
    setChangeLevel(false);
    setChangeType(false);
    onCancel();
  }, [onCancel]);

  const handleSubmit = useCallback(async () => {
    const values: BatchEditValues = {};
    if (caseTag) values.case_tag = caseTag;
    if (changeLevel && caseLevel) values.case_level = caseLevel;
    if (changeType && caseType) values.case_type = caseType;

    if (!values.case_tag && !values.case_level && !values.case_type) return;

    await editCases(selectedCaseIds, values);
    handleModalClose();
  }, [
    caseTag,
    changeLevel,
    caseLevel,
    changeType,
    caseType,
    selectedCaseIds,
    editCases,
    handleModalClose,
  ]);

  const hasSelection =
    caseTag || (changeLevel && caseLevel) || (changeType && caseType);

  return (
    <Modal
      title="批量修改用例"
      open={open}
      onCancel={handleModalClose}
      onOk={handleSubmit}
      cancelText="取消"
      okText="确定"
      okButtonProps={{ disabled: !hasSelection }}
      confirmLoading={loading}
    >
      <div style={{ padding: `${spacing.md}px 0` }}>
        <div
          style={{
            color: colors.textTertiary,
            marginBottom: spacing.md,
            fontSize: token.fontSizeSM,
          }}
        >
          已选择 {selectedCaseIds.length} 项用例
        </div>

        <div style={{ marginBottom: spacing.md }}>
          <label
            style={{
              display: 'block',
              marginBottom: spacing.xs,
              color: colors.text,
              fontSize: token.fontSize,
            }}
          >
            用例标签
          </label>
          <Input
            value={caseTag}
            onChange={(e) => setCaseTag(e.target.value)}
            placeholder="输入用例标签，多个标签用逗号分隔"
            style={{ width: '100%' }}
          />
          <div
            style={{ color: colors.textTertiary, fontSize: 12, marginTop: 4 }}
          >
            将替换原有标签
          </div>
        </div>

        <div style={{ marginBottom: spacing.md }}>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: spacing.xs,
              color: colors.text,
              fontSize: token.fontSize,
            }}
          >
            <Checkbox
              checked={changeLevel}
              onChange={(e) => {
                setChangeLevel(e.target.checked);
                if (!e.target.checked) setCaseLevel(undefined);
              }}
              style={{ marginRight: 8 }}
            />
            用例等级
          </label>
          {changeLevel && (
            <Select
              style={{ width: '100%' }}
              placeholder="选择用例等级"
              value={caseLevel}
              onChange={setCaseLevel}
              options={levelSelectOptions}
              allowClear
            />
          )}
        </div>

        <div>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: spacing.xs,
              color: colors.text,
              fontSize: token.fontSize,
            }}
          >
            <Checkbox
              checked={changeType}
              onChange={(e) => {
                setChangeType(e.target.checked);
                if (!e.target.checked) setCaseType(undefined);
              }}
              style={{ marginRight: 8 }}
            />
            用例类型
          </label>
          {changeType && (
            <Select
              style={{ width: '100%' }}
              placeholder="选择用例类型"
              value={caseType}
              onChange={setCaseType}
              options={typeSelectOptions}
              allowClear
            />
          )}
        </div>
      </div>
    </Modal>
  );
};

export default BatchEditModal;

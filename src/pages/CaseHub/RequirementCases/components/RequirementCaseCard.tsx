import { copyTestCase, removeTestCase } from '@/api/case/testCase';
import MyDrawer from '@/components/MyDrawer';
import CaseLevelSelect from '@/pages/CaseHub/components/CaseLevelSelect';
import CaseTagSelect from '@/pages/CaseHub/components/CaseTagSelect';
import CaseTypeSelect from '@/pages/CaseHub/components/CaseTypeSelect';
import { useTestCaseStyles } from '@/pages/CaseHub/components/TestCaseCard/styles';
import { caseStatusColors } from '@/pages/CaseHub/styles';
import { ITestCase } from '@/pages/CaseHub/types';
import {
  CheckCircleFilled,
  ClockCircleFilled,
  CloseCircleFilled,
  CopyOutlined,
  DeleteOutlined,
  ExpandOutlined,
  FileProtectOutlined,
  MessageOutlined,
  MoreOutlined,
  StarFilled,
} from '@ant-design/icons';
import { ProForm } from '@ant-design/pro-components';
import {
  Button,
  Checkbox,
  Dropdown,
  Form,
  Input,
  MenuProps,
  message,
  Tag,
} from 'antd';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import CaseSubSteps from '../../components/CaseSubSteps';
import DynamicInfo from '../../components/DynamicInfo';
import { useCaseSelection, useCaseUpdate } from '../contexts';

interface Props {
  testcaseData: ITestCase;
}

const RequirementCaseCard: React.FC<Props> = memo(({ testcaseData }) => {
  const [form] = Form.useForm<ITestCase>();
  const [openDynamic, setOpenDynamic] = useState(false);
  const [openCaseSteps, setOpenCaseSteps] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [titleValue, setTitleValue] = useState('');

  const styles = useTestCaseStyles();
  const { isSelected, toggleCase } = useCaseSelection();
  const {
    reqId,
    tags,
    setTags,
    updateCaseField,
    updateCaseReview,
    updateCaseLevel,
    updateCaseType,
    refreshCases,
  } = useCaseUpdate();

  const caseId = testcaseData?.id;
  const selected = caseId ? isSelected(caseId) : false;

  useEffect(() => {
    if (testcaseData) {
      form.setFieldsValue(testcaseData);
      setTitleValue(testcaseData.case_name || '');
    }
  }, [testcaseData, form]);

  const statusConfig = useMemo(
    () =>
      caseStatusColors[testcaseData?.case_status || 0] || caseStatusColors[0],
    [testcaseData?.case_status],
  );

  const statusText = useMemo(() => {
    const statusTextMap = ['', '通过', '失败', '待开始'];
    return statusTextMap[testcaseData?.case_status || 0] || '待开始';
  }, [testcaseData?.case_status]);

  const StatusIcon = useMemo(() => {
    if (testcaseData?.case_status === 1) {
      return <CheckCircleFilled style={{ color: '#52c41a' }} />;
    }
    if (testcaseData?.case_status === 2) {
      return <CloseCircleFilled style={{ color: '#ff4d4f' }} />;
    }
    return <ClockCircleFilled style={{ color: '#8c8c8c' }} />;
  }, [testcaseData?.case_status]);

  const menuItems: MenuProps['items'] = useMemo(
    () => [
      { label: '查看动态', key: '1', icon: <MessageOutlined /> },
      { label: '复制用例', key: '2', icon: <CopyOutlined /> },
      { type: 'divider' },
      { label: '删除用例', key: '3', icon: <DeleteOutlined />, danger: true },
    ],
    [],
  );

  const copyStepCase = useCallback(async () => {
    if (!caseId) return;
    const { code, msg } = await copyTestCase({
      requirement_id: reqId ? parseInt(reqId) : undefined,
      caseId,
    });
    if (code === 0) {
      message.success(msg);
      refreshCases();
    }
  }, [caseId, reqId, refreshCases]);

  const deleteStepCase = useCallback(async () => {
    if (!caseId) return;
    const { code, msg } = await removeTestCase({
      requirement_id: reqId ? parseInt(reqId) : undefined,
      caseId,
    });
    if (code === 0) {
      message.success(msg);
      refreshCases();
    }
  }, [caseId, reqId, refreshCases]);

  const handleMenuClick: MenuProps['onClick'] = useCallback(
    async (e) => {
      e.domEvent.stopPropagation();
      switch (e.key) {
        case '1':
          setOpenDynamic(true);
          break;
        case '2':
          await copyStepCase();
          break;
        case '3':
          await deleteStepCase();
          break;
      }
    },
    [copyStepCase, deleteStepCase],
  );

  const handleFieldSave = useCallback(
    async (field: string, value: string | number) => {
      if (!caseId) return;
      await updateCaseField(caseId, field as keyof ITestCase, value);
    },
    [caseId, updateCaseField],
  );

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTitleValue(e.target.value);
    },
    [],
  );

  const handleTitleSave = useCallback(async () => {
    const trimmedValue = titleValue.trim();
    if (trimmedValue && trimmedValue !== testcaseData?.case_name) {
      form.setFieldsValue({ case_name: trimmedValue });
      await handleFieldSave('case_name', trimmedValue);
    }
  }, [titleValue, testcaseData?.case_name, form, handleFieldSave]);

  const handleTitleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        (e.target as HTMLTextAreaElement).blur();
      }
    },
    [],
  );

  const handleTagChange = useCallback(
    async (id: number, newTag: string) => {
      await updateCaseField(id, 'case_tag', newTag);
    },
    [updateCaseField],
  );

  /** 切换用例类型 */
  const handleCaseLevelToggle = useCallback(
    async (id: number, newLevel: string) => {
      if (!reqId) return;
      await updateCaseLevel(id, newLevel);
    },
    [caseId, testcaseData?.case_level, updateCaseLevel],
  );

  /** 切换用例类型 */
  const handleCaseTypeToggle = useCallback(
    async (id: number, newType: number) => {
      if (!reqId) return;
      await updateCaseType(id, newType);
    },
    [caseId, testcaseData?.case_type, updateCaseType],
  );

  /** 切换审核状态 */
  const handleReviewToggle = useCallback(async () => {
    if (!caseId || testcaseData?.is_review === undefined) return;
    await updateCaseReview(caseId, !testcaseData.is_review);
  }, [caseId, testcaseData?.is_review, updateCaseReview]);

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);
  const handleFocus = useCallback(() => setIsFocused(true), []);
  const handleBlur = useCallback(() => {
    setIsFocused(false);
    handleTitleSave();
  }, [handleTitleSave]);

  /** 切换选中状态 */
  const handleCheckboxChange = useCallback(
    (e: { target: { checked: boolean }; stopPropagation: () => void }) => {
      e.stopPropagation();
      if (caseId) {
        toggleCase(caseId);
      }
    },
    [caseId, toggleCase],
  );

  const handleExpandClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenCaseSteps(true);
  }, []);

  return (
    <>
      <MyDrawer
        name="动态"
        width="40%"
        open={openDynamic}
        setOpen={setOpenDynamic}
      >
        <DynamicInfo caseId={caseId} />
      </MyDrawer>

      <MyDrawer
        name={testcaseData.case_name || '用例详情'}
        width="70%"
        open={openCaseSteps}
        setOpen={setOpenCaseSteps}
      >
        <CaseSubSteps
          creatorName={testcaseData?.creatorName}
          caseId={caseId}
          case_status={testcaseData?.case_status}
          callback={refreshCases}
          requirement_id={reqId ? parseInt(reqId) : undefined}
        />
      </MyDrawer>

      <ProForm<ITestCase> form={form} submitter={false}>
        <div
          style={styles.container(isHovered, selected)}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div
            style={styles.leftAccent(
              isHovered,
              testcaseData?.case_status || 0,
              selected,
            )}
          />

          <div style={styles.inner()}>
            <div style={styles.checkbox(selected, isHovered)}>
              <Checkbox checked={selected} onChange={handleCheckboxChange} />
            </div>

            <span style={styles.caseIdTag()}>{testcaseData?.uid}</span>

            <div style={styles.titleInputContainer()}>
              <Input
                value={titleValue}
                placeholder="输入用例标题..."
                variant={'borderless'}
                style={styles.titleInput(isFocused)}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onChange={handleTitleChange}
                onKeyDown={handleTitleKeyDown}
              />
              <div style={styles.focusIndicator(isFocused)} />
            </div>

            <div style={styles.metaSection()}>
              <span
                style={styles.statusTag(
                  { bg: statusConfig.bg, text: statusConfig.text },
                  testcaseData?.case_status || 0,
                )}
              >
                {StatusIcon}
                {statusText}
              </span>

              {testcaseData?.is_common && (
                <span style={styles.caseFlagTag('common')}>
                  <StarFilled style={{ fontSize: 10 }} />
                  公共
                </span>
              )}

              <CaseTagSelect
                tags={tags}
                setTags={setTags}
                testcaseData={testcaseData}
                onTagChange={handleTagChange}
              />
              <CaseLevelSelect
                testcaseData={testcaseData}
                onLevelChange={handleCaseLevelToggle}
              />
              <CaseTypeSelect
                testcaseData={testcaseData}
                onTypeChange={handleCaseTypeToggle}
              />

              {testcaseData?.is_review !== undefined && (
                <Tag
                  onClick={handleReviewToggle}
                  style={{
                    ...styles.caseFlagTag(
                      testcaseData.is_review
                        ? 'review-active'
                        : 'review-pending',
                    ),
                    cursor: 'pointer',
                  }}
                >
                  <FileProtectOutlined style={{ fontSize: 10 }} />
                  {testcaseData.is_review ? '已评审' : '未评审'}
                </Tag>
              )}
              <Button
                type="text"
                size="small"
                icon={<ExpandOutlined style={{ fontSize: 14 }} />}
                style={styles.detailBtn(isHovered)}
                onClick={handleExpandClick}
              />

              <Dropdown
                menu={{ items: menuItems, onClick: handleMenuClick }}
                trigger={['click']}
              >
                <Button
                  type="text"
                  size="small"
                  icon={<MoreOutlined style={{ fontSize: 16 }} />}
                  style={styles.moreBtn(isHovered)}
                />
              </Dropdown>
            </div>
          </div>
        </div>
      </ProForm>
    </>
  );
});

RequirementCaseCard.displayName = 'RequirementCaseCard';

export default RequirementCaseCard;

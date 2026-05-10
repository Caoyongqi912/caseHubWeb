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
  Tooltip,
} from 'antd';
import React, { memo, useEffect, useState } from 'react';
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
    onCaseDataChange,
  } = useCaseUpdate();

  const caseId = testcaseData?.id;
  const selected = caseId ? isSelected(caseId) : false;

  useEffect(() => {
    if (testcaseData) {
      form.setFieldsValue(testcaseData);
      setTitleValue(testcaseData.case_name || '');
    }
  }, [testcaseData, form]);

  const statusConfig =
    caseStatusColors[testcaseData?.case_status || 0] || caseStatusColors[0];
  const statusText =
    testcaseData?.case_status === 1
      ? '通过'
      : testcaseData?.case_status === 2
      ? '失败'
      : '待开始';
  const StatusIcon =
    testcaseData?.case_status === 1 ? (
      <CheckCircleFilled style={{ color: '#52c41a' }} />
    ) : testcaseData?.case_status === 2 ? (
      <CloseCircleFilled style={{ color: '#ff4d4f' }} />
    ) : (
      <ClockCircleFilled style={{ color: '#8c8c8c' }} />
    );

  const menuItems: MenuProps['items'] = [
    { label: '查看动态', key: '1', icon: <MessageOutlined /> },
    { label: '复制用例', key: '2', icon: <CopyOutlined /> },
    { type: 'divider' },
    { label: '删除用例', key: '3', icon: <DeleteOutlined />, danger: true },
  ];

  const handleMenuClick = async (e: any) => {
    e.domEvent.stopPropagation();
    if (e.key === '1') {
      setOpenDynamic(true);
    } else if (e.key === '2') {
      if (!caseId) return;
      const { code, msg } = await copyTestCase({
        requirement_id: reqId ? parseInt(reqId) : undefined,
        caseId,
      });
      if (code === 0) {
        message.success(msg);
        refreshCases();
      }
    } else if (e.key === '3') {
      if (!caseId) return;
      const { code, msg } = await removeTestCase({
        requirement_id: reqId ? parseInt(reqId) : undefined,
        caseId,
      });
      if (code === 0) {
        message.success(msg);
        refreshCases();
      }
    }
  };

  const handleTitleSave = async () => {
    const trimmedValue = titleValue.trim();
    if (trimmedValue && trimmedValue !== testcaseData?.case_name) {
      form.setFieldsValue({ case_name: trimmedValue });
      if (caseId) {
        await updateCaseField(caseId, 'case_name', trimmedValue);
      }
    }
  };

  const handleTagChange = async (id: number, newTag: string) => {
    await updateCaseField(id, 'case_tag', newTag);
  };

  const handleCaseStatusChange = (caseId: number, newStatus: number) => {
    onCaseDataChange(caseId, 'case_status', newStatus);
  };

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
          onStatusChange={handleCaseStatusChange}
        />
      </MyDrawer>

      <ProForm<ITestCase> form={form} submitter={false}>
        <div
          style={styles.container(isHovered, selected)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
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
              <Checkbox
                checked={selected}
                onChange={(e) => {
                  e.stopPropagation();
                  if (caseId) toggleCase(caseId);
                }}
              />
            </div>

            <Tooltip title="点击查看用例详情" placement="top">
              <Button
                type="primary"
                ghost
                size="small"
                icon={<ExpandOutlined style={{ fontSize: 13 }} />}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenCaseSteps(true);
                }}
              />
            </Tooltip>
            <div style={styles.titleInputContainer()}>
              <Input
                value={titleValue}
                placeholder="输入用例标题..."
                variant={'borderless'}
                style={styles.titleInput(isFocused)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => {
                  setIsFocused(false);
                  handleTitleSave();
                }}
                onChange={(e) => setTitleValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    (e.target as HTMLTextAreaElement).blur();
                  }
                }}
              />
              <div style={styles.focusIndicator(isFocused)} />
            </div>

            <div style={styles.metaSection()}>
              <span
                style={styles.statusTag(
                  statusConfig,
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
                onLevelChange={async (id, newLevel) => {
                  if (reqId) await updateCaseLevel(id, newLevel);
                }}
              />
              <CaseTypeSelect
                testcaseData={testcaseData}
                onTypeChange={async (id, newType) => {
                  if (reqId) await updateCaseType(id, newType);
                }}
              />

              {testcaseData?.is_review !== undefined && (
                <Tag
                  onClick={async () => {
                    if (caseId && testcaseData?.is_review !== undefined) {
                      await updateCaseReview(caseId, !testcaseData.is_review);
                    }
                  }}
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

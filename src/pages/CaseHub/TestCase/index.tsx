import {
  copyTestCase,
  removeTestCase,
  updateTestCase,
} from '@/api/case/testCase';
import MyDrawer from '@/components/MyDrawer';
import CaseLevelSelect from '@/pages/CaseHub/component/CaseLevelSelect';
import CaseTagSelect from '@/pages/CaseHub/component/CaseTagSelect';
import CaseTypeSelect from '@/pages/CaseHub/component/CaseTypeSelect';
import { caseStatusColors } from '@/pages/CaseHub/styles';
import CaseSubSteps from '@/pages/CaseHub/TestCase/CaseSubSteps';
import DynamicInfo from '@/pages/CaseHub/TestCase/DynamicInfo';
import { useTestCaseStyles } from '@/pages/CaseHub/TestCase/styles';
import { ITestCase } from '@/pages/CaseHub/type';
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
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';

interface Props {
  reqId?: string;
  tags?: { label: string; value: string }[];
  setTags: React.Dispatch<
    React.SetStateAction<{ label: string; value: string }[]>
  >;
  selectedCase: number[];
  testcaseData: ITestCase;
  setSelectedCase: React.Dispatch<React.SetStateAction<number[]>>;
  callback: () => void;
}

const Index: FC<Props> = ({
  callback,
  selectedCase,
  setSelectedCase,
  testcaseData,
  reqId,
  tags,
  setTags,
}) => {
  const [form] = Form.useForm<ITestCase>();
  const [openDynamic, setOpenDynamic] = useState(false);
  const [openCaseSteps, setOpenCaseSteps] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [titleValue, setTitleValue] = useState('');

  const styles = useTestCaseStyles();

  useEffect(() => {
    if (testcaseData) {
      form.setFieldsValue(testcaseData);
      setTitleValue(testcaseData.case_name || '');
    }
  }, [testcaseData, form]);

  const reloadCaseStep = useCallback(() => {
    callback();
  }, [callback]);

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
    if (!testcaseData?.id) return;
    const { code, msg } = await copyTestCase({
      requirement_id: reqId ? parseInt(reqId) : null,
      caseId: testcaseData.id,
    });
    if (code === 0) {
      message.success(msg);
      callback();
    }
  }, [testcaseData?.id, reqId, callback]);

  const deleteStepCase = useCallback(async () => {
    if (!testcaseData?.id) return;
    const { code, msg } = await removeTestCase({
      requirement_id: reqId ? parseInt(reqId) : null,
      caseId: testcaseData.id,
    });
    if (code === 0) {
      message.success(msg);
      callback();
    }
  }, [testcaseData?.id, reqId, callback]);

  /**
   * 处理菜单点击事件
   */
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

  /**
   * 处理字段保存事件
   */
  const handleFieldSave = useCallback(
    async (field: string, value: string | number) => {
      if (!testcaseData?.id) return;

      const values: Record<string, unknown> = {
        id: testcaseData.id,
        [field]: value,
      };

      const { code } = await updateTestCase(values as unknown as ITestCase);
      if (code === 0) {
        message.success('保存成功');
        callback();
      }
    },
    [testcaseData?.id, callback],
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
        (e.target as HTMLInputElement).blur();
      }
    },
    [],
  );

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);
  const handleFocus = useCallback(() => setIsFocused(true), []);
  const handleBlur = useCallback(() => {
    setIsFocused(false);
    handleTitleSave();
  }, [handleTitleSave]);

  const handleCheckboxChange = useCallback(
    (e: { target: { checked: boolean }; stopPropagation: () => void }) => {
      e.stopPropagation();
      const checked = e.target.checked;
      const testCaseId = testcaseData.id;
      if (testCaseId) {
        setSelectedCase((prev) =>
          checked
            ? prev.includes(testCaseId)
              ? prev
              : [...prev, testCaseId]
            : prev.filter((id) => id !== testCaseId),
        );
      }
    },
    [testcaseData.id, setSelectedCase],
  );

  const handleExpandClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenCaseSteps(true);
  }, []);

  const isSelected =
    testcaseData.id !== undefined && selectedCase.includes(testcaseData.id);

  return (
    <>
      <MyDrawer
        name="动态"
        width="40%"
        open={openDynamic}
        setOpen={setOpenDynamic}
      >
        <DynamicInfo caseId={testcaseData?.id} />
      </MyDrawer>

      <MyDrawer
        name={testcaseData.case_name || '用例详情'}
        width="70%"
        open={openCaseSteps}
        setOpen={setOpenCaseSteps}
      >
        <CaseSubSteps
          creatorName={testcaseData?.creatorName}
          caseId={testcaseData?.id}
          case_status={testcaseData?.case_status}
          callback={reloadCaseStep}
          requirement_id={reqId ? parseInt(reqId) : undefined}
        />
      </MyDrawer>

      <ProForm<ITestCase> form={form} submitter={false}>
        <div
          style={styles.container(isHovered, isSelected)}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div
            style={styles.leftAccent(
              isHovered,
              testcaseData?.case_status || 0,
              isSelected,
            )}
          />

          <div style={styles.inner()}>
            <div style={styles.checkbox(isSelected, isHovered)}>
              <Checkbox checked={isSelected} onChange={handleCheckboxChange} />
            </div>

            <span style={styles.caseIdTag()}>{testcaseData?.uid}</span>

            <div style={styles.titleInputContainer()}>
              <Input
                value={titleValue}
                placeholder="输入用例标题..."
                bordered={false}
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
                onSave={handleFieldSave}
              />
              <CaseLevelSelect
                testcaseData={testcaseData}
                onSave={handleFieldSave}
              />
              <CaseTypeSelect
                testcaseData={testcaseData}
                onSave={handleFieldSave}
              />

              {testcaseData?.is_review !== undefined && (
                <Tag
                  onClick={() => {
                    if (testcaseData?.id) {
                      const newValue = !testcaseData.is_review;
                      handleFieldSave(
                        'is_review',
                        newValue as unknown as string,
                      );
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
};

export default Index;

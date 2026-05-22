import { copyTestCase, removeTestCase } from '@/api/case/testCase';
import MyDrawer from '@/components/MyDrawer';
import CaseLevelSelect from '@/pages/CaseHub/components/CaseLevelSelect';
import CaseTagSelect from '@/pages/CaseHub/components/CaseTagSelect';
import CaseTypeSelect from '@/pages/CaseHub/components/CaseTypeSelect';
import {
  caseStatusColors,
  useRequirementCaseCardStyles,
} from '@/pages/CaseHub/styles';
import { ITestCase } from '@/pages/CaseHub/types';
import {
  CheckCircleFilled,
  ClockCircleFilled,
  CloseCircleFilled,
  CopyOutlined,
  DeleteOutlined,
  FileProtectOutlined,
  MessageOutlined,
  MoreOutlined,
  OrderedListOutlined,
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
import CaseSubSteps from '../../../components/CaseSubSteps';
import DynamicInfo from '../../../components/DynamicInfo';

/**
 * RequirementCaseCard 组件属性
 */
interface Props {
  /** 用例数据 */
  testcaseData: ITestCase;
  /** 是否选中 */
  isSelected: boolean;
  /** 切换用例选中状态回调 */
  onToggleCase: (caseId: number) => void;
  /** 需求ID */
  reqId: string | undefined;
  /** 标签选项列表 */
  tags: { label: string; value: string }[];
  /** 标签状态变更回调 */
  onTagsChange: React.Dispatch<
    React.SetStateAction<{ label: string; value: string }[]>
  >;
  /** 更新用例字段回调 */
  onUpdateCaseField: (
    caseId: number,
    field: keyof ITestCase,
    value: string | number | boolean,
  ) => Promise<boolean>;
  /** 更新用例评审状态回调 */
  onUpdateCaseReview: (caseId: number, isReview: boolean) => Promise<boolean>;
  /** 更新用例等级回调 */
  onUpdateCaseLevel: (caseId: number, case_level: string) => Promise<boolean>;
  /** 更新用例类型回调 */
  onUpdateCaseType: (caseId: number, case_type: number) => Promise<boolean>;
  /** 刷新用例列表回调 */
  onRefreshCases: () => void;
  /** 用例数据变更回调 */
  onCaseDataChange: (
    caseId: number,
    field: keyof ITestCase,
    value: unknown,
  ) => void;
}

/**
 * 用例卡片组件
 * 展示单个测试用例的详细信息，支持编辑、选择、状态切换等功能
 * @param props - 组件属性
 */
const RequirementCaseCard: React.FC<Props> = memo(
  ({
    testcaseData,
    isSelected,
    onToggleCase,
    reqId,
    tags,
    onTagsChange,
    onUpdateCaseField,
    onUpdateCaseReview,
    onUpdateCaseLevel,
    onUpdateCaseType,
    onRefreshCases,
    onCaseDataChange,
  }) => {
    const [form] = Form.useForm<ITestCase>();
    const [openDynamic, setOpenDynamic] = useState(false);
    const [openCaseSteps, setOpenCaseSteps] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [titleValue, setTitleValue] = useState('');

    const styles = useRequirementCaseCardStyles();

    const caseId = testcaseData?.id;
    const selected = caseId ? isSelected : false;

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

    /**
     * 处理菜单点击事件
     * @param e - 菜单项点击事件
     */
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
          onRefreshCases();
        }
      } else if (e.key === '3') {
        if (!caseId) return;
        const { code, msg } = await removeTestCase({
          requirement_id: reqId ? parseInt(reqId) : undefined,
          caseId,
        });
        if (code === 0) {
          message.success(msg);
          onRefreshCases();
        }
      }
    };

    /**
     * 保存用例标题
     */
    const handleTitleSave = async () => {
      const trimmedValue = titleValue.trim();
      if (trimmedValue && trimmedValue !== testcaseData?.case_name) {
        form.setFieldsValue({ case_name: trimmedValue });
        if (caseId) {
          await onUpdateCaseField(caseId, 'case_name', trimmedValue);
        }
      }
    };

    /**
     * 处理标签变更
     * @param id - 用例ID
     * @param newTag - 新标签
     */
    const handleTagChange = async (id: number, newTag: string) => {
      await onUpdateCaseField(id, 'case_tag', newTag);
    };

    /**
     * 处理用例状态变更
     * @param caseId - 用例ID
     * @param newStatus - 新状态
     */
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
            callback={onRefreshCases}
            requirement_id={reqId ? parseInt(reqId) : undefined}
            onStatusChange={handleCaseStatusChange}
            case_setup={testcaseData?.case_setup || ''}
            case_mark={testcaseData?.case_mark || ''}
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
                    if (caseId) onToggleCase(caseId);
                  }}
                />
              </div>

              <Tooltip title="点击查看用例详情" placement="top">
                <Button
                  type="primary"
                  ghost
                  style={{
                    marginLeft: 16,
                  }}
                  size="small"
                  icon={<OrderedListOutlined style={{ fontSize: 13 }} />}
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
                  setTags={onTagsChange}
                  testcaseData={testcaseData}
                  onTagChange={handleTagChange}
                />
                <CaseLevelSelect
                  testcaseData={testcaseData}
                  onLevelChange={async (id, newLevel) => {
                    if (reqId) await onUpdateCaseLevel(id, newLevel);
                  }}
                />
                <CaseTypeSelect
                  testcaseData={testcaseData}
                  onTypeChange={async (id, newType) => {
                    if (reqId) await onUpdateCaseType(id, newType);
                  }}
                />

                {testcaseData?.is_review !== undefined && (
                  <Tag
                    onClick={async () => {
                      if (caseId && testcaseData?.is_review !== undefined) {
                        await onUpdateCaseReview(
                          caseId,
                          !testcaseData.is_review,
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
  },
);

RequirementCaseCard.displayName = 'RequirementCaseCard';

export default RequirementCaseCard;

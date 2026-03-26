import { uploadTestCase } from '@/api/case/testCase';
import { CaseHubConfig } from '@/pages/CaseHub/CaseConfig';
import { useCaseHubTheme } from '@/pages/CaseHub/styles';
import { CaseSearchForm } from '@/pages/CaseHub/type';
import {
  AppstoreOutlined,
  CheckSquareOutlined,
  ClearOutlined,
  CloseSquareOutlined,
  DownSquareOutlined,
  MenuOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  SettingOutlined,
  UploadOutlined,
  UpSquareOutlined,
} from '@ant-design/icons';
import {
  ModalForm,
  ProCard,
  ProForm,
  ProFormSelect,
  ProFormText,
  ProFormUploadDragger,
} from '@ant-design/pro-components';
import {
  Button,
  Divider,
  Dropdown,
  Form,
  Space,
  Tooltip,
  Typography,
} from 'antd';
import React, { FC, useCallback, useMemo, useState } from 'react';

const { Text } = Typography;

interface Props {
  setSearchForm: React.Dispatch<React.SetStateAction<CaseSearchForm>>;
  tags: { label: string; value: string }[];
  isGrouped?: boolean;
  isAllExpanded?: boolean;
  selectedCount?: number;
  totalCount?: number;
  onSelectAll?: () => void;
  onExpandAll?: () => void;
  onCollapseAll?: () => void;
  onClearSelection?: () => void;
  onRefresh?: () => void;
  onToggleGroup?: () => void;
  onAddCase?: () => void;
  onUploadFinish?: () => void;
  uploadProps?: {
    reqId?: string;
    moduleId?: string;
    projectId?: string;
  };
}

const CaseStepSearchForm: FC<Props> = ({
  tags,
  setSearchForm,
  isGrouped = true,
  isAllExpanded = true,
  selectedCount = 0,
  totalCount = 0,
  onSelectAll,
  onExpandAll,
  onCollapseAll,
  onClearSelection,
  onRefresh,
  onToggleGroup,
  onAddCase,
  onUploadFinish,
  uploadProps,
}) => {
  const [form] = Form.useForm();
  const [uploadForm] = Form.useForm();
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const { CASE_LEVEL_OPTION, CASE_TYPE_OPTION } = CaseHubConfig;
  const { colors, spacing, borderRadius } = useCaseHubTheme();

  const handleSearch = useCallback(() => {
    const values = form.getFieldsValue();
    setSearchForm(values || {});
  }, [form, setSearchForm]);

  const handleReset = useCallback(() => {
    form.resetFields();
    setSearchForm({});
  }, [form, setSearchForm]);

  const cardStyle = useMemo(
    () => ({
      borderRadius: borderRadius.xl,
      border: `1px solid ${colors.border}`,
      overflow: 'visible' as const,
      position: 'sticky' as const,
      top: 0,
      zIndex: 100,
      background: colors.bgContainer,
      boxShadow: `0 4px 16px rgba(0, 0, 0, 0.08)`,
      marginBottom: spacing.sm,
    }),
    [borderRadius, colors, spacing],
  );

  const toolbarBtnStyle = useMemo(
    () => ({
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      borderRadius: borderRadius.md,
      fontWeight: 500,
    }),
    [borderRadius],
  );

  const moreActions = useMemo(
    () => [
      {
        key: 'upload',
        label: '附件上传',
        icon: <UploadOutlined />,
      },
      { type: 'divider' as const },
      {
        key: 'batch-pass',
        label: '批量设置通过',
        icon: <CheckSquareOutlined style={{ color: '#52c41a' }} />,
      },
      {
        key: 'batch-fail',
        label: '批量设置失败',
        icon: <CloseSquareOutlined style={{ color: '#ff4d4f' }} />,
      },
      { type: 'divider' as const },
      {
        key: 'batch-reset',
        label: '批量重置状态',
        icon: <ClearOutlined />,
      },
    ],
    [],
  );

  const handleMoreAction = useCallback((key: string) => {
    if (key === 'upload') {
      setUploadModalOpen(true);
    }
  }, []);

  const handleUploadCase = useCallback(
    async (values: any) => {
      const formData = new FormData();
      const fileValue = values.file;
      formData.append('file', fileValue[0].originFileObj);
      formData.append('module_id', uploadProps?.moduleId || '');
      formData.append('requirement_id', uploadProps?.reqId || '');
      formData.append('project_id', uploadProps?.projectId || '');

      const { code } = await uploadTestCase(formData);
      if (code === 0) {
        onUploadFinish?.();
      }
      uploadForm.resetFields();
      return true;
    },
    [uploadProps, onUploadFinish, uploadForm],
  );

  const groupButtonStyle = useMemo(
    () => ({
      borderRadius: borderRadius.lg,
      fontWeight: 600,
      height: 36,
      paddingLeft: 20,
      paddingRight: 20,
      background: isGrouped
        ? `linear-gradient(135deg, ${colors.primary} 0%, ${
            colors.primaryHover || colors.primary
          } 100%)`
        : `linear-gradient(135deg, ${colors.warning} 0%, ${colors.warning} 100%)`,
      boxShadow: `0 4px 12px ${isGrouped ? colors.primary : colors.warning}40`,
      border: 'none',
    }),
    [borderRadius, colors, isGrouped],
  );

  const addCaseButtonStyle = useMemo(
    () => ({
      borderRadius: borderRadius.lg,
      fontWeight: 600,
      height: 36,
      paddingLeft: 20,
      paddingRight: 20,
      background: `linear-gradient(135deg, ${colors.success} 0%, ${colors.success} 100%)`,
      boxShadow: `0 4px 12px ${colors.success}40`,
      border: 'none',
    }),
    [borderRadius, colors],
  );

  const selectionBadgeStyle = useMemo(
    () => ({
      display: 'flex',
      alignItems: 'center',
      gap: spacing.xs,
      padding: '4px 12px',
      background: selectedCount > 0 ? colors.primaryBg : 'transparent',
      borderRadius: borderRadius.md,
      border: `1px solid ${selectedCount > 0 ? colors.primary : colors.border}`,
      transition: 'all 200ms ease',
    }),
    [spacing, borderRadius, colors, selectedCount],
  );

  return (
    <>
      <ModalForm
        form={uploadForm}
        modalProps={{ destroyOnClose: true }}
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        title="上传用例附件"
        onFinish={handleUploadCase}
      >
        <ProCard>
          <ProFormUploadDragger
            title={false}
            max={1}
            description="上传文件"
            accept=".xlsx,.xls"
            name="file"
          />
        </ProCard>
      </ModalForm>

      <ProCard
        style={cardStyle}
        collapsible={false}
        headStyle={{
          background: `linear-gradient(135deg, ${colors.primaryBg} 0%, ${colors.bgContainer} 100%)`,
          borderBottom: `1px solid ${colors.border}`,
          padding: `${spacing.md}px ${spacing.lg}px`,
        }}
        bodyStyle={{
          padding: spacing.lg,
          background: colors.bgContainer,
        }}
      >
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: spacing.md,
            }}
          >
            <ProForm
              form={form}
              submitter={false}
              layout="inline"
              style={{ flex: 1 }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing.md,
                  flexWrap: 'wrap' as const,
                }}
              >
                <ProFormText
                  width="sm"
                  name="case_name"
                  placeholder="搜索用例名称..."
                  fieldProps={{
                    allowClear: true,
                    prefix: (
                      <SearchOutlined style={{ color: colors.primary }} />
                    ),
                    variant: 'filled',
                    style: { borderRadius: borderRadius.md },
                  }}
                />
                <ProFormSelect
                  width="sm"
                  name="case_tag"
                  placeholder="选择标签"
                  mode="single"
                  allowClear
                  options={tags}
                  fieldProps={{
                    variant: 'filled',
                    style: { borderRadius: borderRadius.md },
                  }}
                />
                <ProFormSelect
                  width="sm"
                  name="case_level"
                  placeholder="选择等级"
                  mode="single"
                  allowClear
                  options={CASE_LEVEL_OPTION}
                  fieldProps={{
                    variant: 'filled',
                    style: { borderRadius: borderRadius.md },
                  }}
                />
                <ProFormSelect
                  width="sm"
                  name="is_review"
                  placeholder="是否评审"
                  mode="single"
                  allowClear
                  options={[
                    { label: '已评审', value: true },
                    { label: '未评审', value: false },
                  ]}
                  fieldProps={{
                    variant: 'filled',
                    style: { borderRadius: borderRadius.md },
                  }}
                />
                <ProFormSelect
                  width="sm"
                  name="is_common"
                  placeholder="是否公共用例"
                  mode="single"
                  allowClear
                  options={[
                    { label: '公共', value: true },
                    { label: '私有', value: false },
                  ]}
                  fieldProps={{
                    variant: 'filled',
                    style: { borderRadius: borderRadius.md },
                  }}
                />
                <ProFormSelect
                  width="sm"
                  name="case_type"
                  placeholder="选择类型"
                  mode="single"
                  allowClear
                  options={CASE_TYPE_OPTION}
                  fieldProps={{
                    variant: 'filled',
                    style: { borderRadius: borderRadius.md },
                  }}
                />
                <Space>
                  <Button
                    type="primary"
                    onClick={handleSearch}
                    style={{ borderRadius: borderRadius.md, fontWeight: 500 }}
                    icon={<SearchOutlined />}
                  >
                    搜索
                  </Button>
                  <Button
                    onClick={handleReset}
                    style={{ borderRadius: borderRadius.md }}
                  >
                    重置
                  </Button>
                </Space>
              </div>
            </ProForm>
          </div>

          <Divider style={{ margin: 0, borderColor: colors.border }} />

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: spacing.sm,
            }}
          >
            <div
              style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}
            >
              <div style={selectionBadgeStyle}>
                <CheckSquareOutlined
                  style={{
                    color:
                      selectedCount > 0 ? colors.primary : colors.textSecondary,
                  }}
                />
                <Text
                  style={{
                    fontSize: 13,
                    color:
                      selectedCount > 0 ? colors.primary : colors.textSecondary,
                    fontWeight: 500,
                  }}
                >
                  已选 {selectedCount}/{totalCount}
                </Text>
              </div>

              <Tooltip title="全选">
                <Button
                  type="text"
                  size="small"
                  icon={<CheckSquareOutlined />}
                  onClick={onSelectAll}
                  style={toolbarBtnStyle}
                >
                  全选
                </Button>
              </Tooltip>

              <Tooltip title="取消选择">
                <Button
                  type="text"
                  size="small"
                  icon={<CloseSquareOutlined />}
                  onClick={onClearSelection}
                  disabled={selectedCount === 0}
                  style={toolbarBtnStyle}
                >
                  取消
                </Button>
              </Tooltip>
            </div>

            <div
              style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}
            >
              {isGrouped && (
                <>
                  <Tooltip title={isAllExpanded ? '全部收起' : '全部展开'}>
                    <Button
                      type="text"
                      size="small"
                      icon={
                        isAllExpanded ? (
                          <UpSquareOutlined />
                        ) : (
                          <DownSquareOutlined />
                        )
                      }
                      onClick={isAllExpanded ? onCollapseAll : onExpandAll}
                      style={toolbarBtnStyle}
                    >
                      {isAllExpanded ? '收起' : '展开'}
                    </Button>
                  </Tooltip>
                  <Divider type="vertical" style={{ height: 20, margin: 0 }} />
                </>
              )}

              <Tooltip title="刷新列表">
                <Button
                  type="text"
                  size="small"
                  icon={<ReloadOutlined />}
                  onClick={onRefresh}
                  style={toolbarBtnStyle}
                >
                  刷新
                </Button>
              </Tooltip>

              <Dropdown
                menu={{
                  items: moreActions,
                  onClick: (e) => handleMoreAction(e.key),
                }}
                trigger={['click']}
                placement="bottomRight"
              >
                <Button
                  type="text"
                  size="small"
                  icon={<SettingOutlined />}
                  style={toolbarBtnStyle}
                >
                  更多操作
                </Button>
              </Dropdown>

              <Button
                type="primary"
                onClick={onToggleGroup}
                style={groupButtonStyle}
                icon={isGrouped ? <MenuOutlined /> : <AppstoreOutlined />}
              >
                {isGrouped ? '平铺' : '分组'}
              </Button>

              <Button
                type="primary"
                onClick={onAddCase}
                style={addCaseButtonStyle}
                icon={<PlusOutlined />}
              >
                添加用例
              </Button>
            </div>
          </div>
        </div>
      </ProCard>
    </>
  );
};

export default CaseStepSearchForm;

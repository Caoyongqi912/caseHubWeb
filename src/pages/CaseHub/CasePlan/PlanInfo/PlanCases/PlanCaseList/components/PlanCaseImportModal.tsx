/**
 * 计划用例批量导入弹窗组件
 */
import { commitPlanImportCase } from '@/api/case/caseplan';
import { cancelImportCase, uploadPreviewCase } from '@/api/case/testCase';
import type { IPlanModule } from '@/pages/CaseHub/types';
import {
  CheckCircleOutlined,
  DeleteOutlined,
  InboxOutlined,
} from '@ant-design/icons';
import {
  ModalForm,
  ProCard,
  ProForm,
  ProFormSelect,
  ProFormTreeSelect,
  ProFormUploadDragger,
} from '@ant-design/pro-components';
import { Button, Form, message, Progress, theme } from 'antd';
import { FC, useCallback, useMemo, useState } from 'react';

interface PlanCaseImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planId: string;
  planModules: IPlanModule[];
  onUploadFinish: () => void;
}

interface ErrorRow {
  row: number;
  errors: { field: string; message: string }[];
}

interface ValidateResult {
  file_md5: string;
  total_count: number;
  valid_count: number;
  invalid_count: number;
  errors: ErrorRow[];
}

interface FormValues {
  case_status: number;
  is_review: number;
  module_id?: number;
  file?: File;
}

const useModalTheme = (isDark: boolean) =>
  useMemo(
    () => ({
      cardBg: isDark ? '#1f1f1f' : '#ffffff',
      cardBorder: isDark ? '#303030' : '#e2e8f0',
      containerBg: isDark
        ? 'linear-gradient(135deg, #141414 0%, #1a1a1a 100%)'
        : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      textPrimary: isDark ? '#e2e8f0' : '#334155',
      textSecondary: isDark ? '#8b949e' : '#64748b',
      errorText: isDark ? '#ff7875' : '#7f1d1d',
      errorBg: isDark ? '#2a1a1a' : '#ffffff',
      errorBorder: isDark ? '#4a2020' : '#fee2e2',
      errorDashBorder: isDark ? '#4a2020' : '#fecaca',
      tipColor: '#f59e0b',
      iconBg: isDark ? '#262626' : '#f0f0f0',
      uploadAreaBg: isDark ? '#1f1f1f' : '#fafafa',
      uploadAreaBorder: isDark ? '#303030' : '#d9d9d9',
      successBg: isDark ? '#1a2e1a' : '#f0fdf4',
      successBorder: isDark ? '#2d4a2d' : '#bbf7d0',
    }),
    [isDark],
  );

const getPassRateColor = (passRate: number) => {
  if (passRate >= 80) return { start: '#10b981', end: '#059669' };
  if (passRate >= 50) return { start: '#f59e0b', end: '#d97706' };
  return { start: '#ef4444', end: '#dc2626' };
};

const StatusSelect: FC<{
  name: string;
  label: string;
  options: { value: number; label: string }[];
  required?: boolean;
  message?: string;
}> = ({ name, label, options, required, message }) => (
  <ProFormSelect
    name={name}
    label={label}
    width="md"
    required={required}
    rules={
      required ? [{ required: true, message: message || `请选择${label}` }] : []
    }
    options={options}
    fieldProps={{ variant: 'filled' }}
  />
);

const FileUploadArea: FC<{
  file: File | null;
  uploading: boolean;
  error: string | null;
  styles: ReturnType<typeof useModalTheme>;
  token: { colorPrimary: string };
  onRemove: () => void;
}> = ({ file, uploading, error, styles, token, onRemove }) => (
  <div
    style={{
      marginTop: 16,
      padding: 16,
      borderRadius: 8,
      border: `1px dashed ${styles.uploadAreaBorder}`,
      background: styles.uploadAreaBg,
    }}
  >
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: styles.iconBg,
          }}
        >
          <InboxOutlined style={{ fontSize: 24, color: token.colorPrimary }} />
        </div>
        <div>
          <div
            style={{
              fontWeight: 500,
              marginBottom: 4,
              color: styles.textPrimary,
            }}
          >
            {file?.name}
          </div>
          <div style={{ fontSize: 12, color: styles.textSecondary }}>
            {file && (file.size / 1024).toFixed(1)} KB
          </div>
        </div>
      </div>
      {uploading ? (
        <Button type="text" disabled>
          上传中...
        </Button>
      ) : (
        <Button type="text" danger icon={<DeleteOutlined />} onClick={onRemove}>
          移除
        </Button>
      )}
    </div>
    {uploading && (
      <div style={{ marginTop: 16 }}>
        <Progress percent={50} status="active" size="small" />
        <div
          style={{
            fontSize: 12,
            color: styles.textSecondary,
            marginTop: 8,
            textAlign: 'center',
          }}
        >
          正在校验文件，请稍候...
        </div>
      </div>
    )}
    {error && !uploading && (
      <div
        style={{
          marginTop: 12,
          padding: '8px 12px',
          borderRadius: 6,
          fontSize: 13,
          color: styles.errorText,
        }}
      >
        {error}
      </div>
    )}
  </div>
);

const StatCard: FC<{
  label: string;
  value: number;
  icon: React.ReactNode;
  style: React.CSSProperties;
}> = ({ label, value, icon, style }) => (
  <div style={style}>
    <div style={{ fontSize: 12, color: style.color, marginBottom: 4 }}>
      {label}
    </div>
    <div
      style={{
        fontSize: 24,
        fontWeight: 700,
        color: style.color,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
      }}
    >
      {icon}
      {value}
    </div>
  </div>
);

const InfoAlert: FC<{
  type: 'success' | 'error' | 'info';
  message: string;
  styles: ReturnType<typeof useModalTheme>;
}> = ({ type, message, styles }) => {
  const colors = {
    success: {
      bg: styles.successBg,
      border: styles.successBorder,
      text: '#059669',
    },
    error: {
      bg: styles.errorBg,
      border: styles.errorBorder,
      text: styles.errorText,
    },
    info: {
      bg: styles.cardBg,
      border: styles.cardBorder,
      text: styles.textPrimary,
    },
  };
  const c = colors[type];
  return (
    <div
      style={{
        marginTop: 12,
        padding: 12,
        borderRadius: 6,
        fontSize: 13,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        color: c.text,
        background: c.bg,
        border: `1px solid ${c.border}`,
      }}
    >
      {type === 'success' && <CheckCircleOutlined />}
      {type === 'error' && <span style={{ fontSize: 16 }}>⚠</span>}
      {message}
    </div>
  );
};

const PlanCaseImportModal: FC<PlanCaseImportModalProps> = ({
  open,
  onOpenChange,
  planId,
  planModules,
  onUploadFinish,
}) => {
  const { token } = theme.useToken();
  const [form] = Form.useForm<FormValues>();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [validateResult, setValidateResult] = useState<ValidateResult | null>(
    null,
  );
  const [uploadError, setUploadError] = useState<string | null>(null);

  const isDark = token.colorBgContainer === '#141414';
  const styles = useModalTheme(isDark);
  const passRate = useMemo(() => {
    if (!validateResult || validateResult.total_count === 0) return 0;
    return Math.round(
      (validateResult.valid_count / validateResult.total_count) * 100,
    );
  }, [validateResult]);
  const passRateColor = getPassRateColor(passRate);

  const treeData = useMemo(
    () =>
      planModules.map((m) => ({
        title: m.title,
        value: m.id,
        children: m.children?.map((c) => ({
          title: c.title,
          value: c.id,
          children: c.children?.map((gc) => ({
            title: gc.title,
            value: gc.id,
          })),
        })),
      })),
    [planModules],
  );

  const resetAllState = useCallback(() => {
    form.resetFields();
    setFile(null);
    setValidateResult(null);
    setUploadError(null);
    setUploading(false);
    setConfirming(false);
  }, [form]);

  const handleModalChange = useCallback(
    (isOpen: boolean) => {
      if (!isOpen) resetAllState();
      onOpenChange(isOpen);
    },
    [onOpenChange, resetAllState],
  );

  const handleUpload = useCallback(async (fileList: any[]) => {
    const rawFile = fileList?.[0]?.originFileObj as File;
    if (!rawFile) return;

    setFile(rawFile);
    setValidateResult(null);
    setUploadError(null);
    setUploading(true);

    try {
      const response = (await uploadPreviewCase(rawFile)) as any;
      if (!response) {
        setUploadError('服务器未返回数据，请重试');
        return;
      }

      if (response.code === 0 && response.data) {
        setValidateResult({
          file_md5: response.data.file_md5 || '',
          total_count: response.data.total_count || 0,
          valid_count: response.data.valid_count || 0,
          invalid_count: response.data.invalid_count || 0,
          errors: response.data.errors || [],
        });
        setUploadError(null);
      } else {
        setUploadError(response.msg || '上传失败');
        setValidateResult(null);
      }
    } catch (err: any) {
      console.error('上传预览错误:', err);
      setUploadError(err?.msg || err?.message || '上传失败，请重试');
      setValidateResult(null);
    } finally {
      setUploading(false);
    }
  }, []);

  const handleRemove = useCallback(async () => {
    if (validateResult?.file_md5) {
      try {
        await cancelImportCase(validateResult.file_md5);
      } catch (err) {
        console.error('清理缓存失败:', err);
      }
    }
    form.resetFields(['file']);
    setFile(null);
    setValidateResult(null);
    setUploadError(null);
  }, [form, validateResult]);

  const handleConfirm = useCallback(
    async (values: FormValues) => {
      if (!validateResult?.file_md5) return false;

      setConfirming(true);
      try {
        const response = (await commitPlanImportCase({
          file_md5: validateResult.file_md5,
          plan_module_id: values.module_id,
          plan_id: planId,
          case_status: values.case_status,
          is_review: values.is_review === 1,
        })) as any;

        if (!response || response.code !== 0) {
          setUploadError(response?.msg || '导入失败');
          return false;
        }

        message.success(
          `成功导入数据 ${response.data?.imported_count || 0} 条`,
        );
        onUploadFinish();
        resetAllState();
        return true;
      } catch (err: any) {
        console.error('导入错误:', err);
        setUploadError(err?.msg || err?.message || '导入失败，请重试');
        return false;
      } finally {
        setConfirming(false);
      }
    },
    [validateResult, planId, onUploadFinish, resetAllState],
  );

  const formatErrors = (errors: ErrorRow[]) =>
    errors.map(
      (e) => `第 ${e.row} 行：${e.errors.map((err) => err.message).join('；')}`,
    );

  const statCardBaseStyle = useMemo(
    () => ({
      padding: '12px 20px',
      background: styles.cardBg,
      borderRadius: 10,
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      border: `1px solid ${styles.cardBorder}`,
      minWidth: 100,
      color: styles.textSecondary,
    }),
    [styles],
  );

  const hasValid = validateResult && validateResult.valid_count > 0;
  const hasInvalid = validateResult && validateResult.invalid_count > 0;
  const allInvalid =
    validateResult &&
    validateResult.invalid_count === 0 &&
    validateResult.total_count > 0;

  return (
    <ModalForm
      form={form}
      modalProps={{ destroyOnHidden: true }}
      open={open}
      title="批量导入用例"
      layout="horizontal"
      onFinish={handleConfirm}
      onOpenChange={handleModalChange}
      submitter={{
        searchConfig: { submitText: '确认导入', resetText: '取消' },
        submitButtonProps: {
          disabled:
            !validateResult?.file_md5 || validateResult.valid_count === 0,
          loading: confirming,
        },
        resetButtonProps: { onClick: () => handleModalChange(false) },
      }}
    >
      <ProCard>
        <ProForm.Group>
          <StatusSelect
            name="case_status"
            label="用例状态"
            required
            message="请选择用例状态"
            options={[
              { value: 0, label: '待执行' },
              { value: 1, label: '通过' },
              { value: 2, label: '失败' },
            ]}
          />
          <StatusSelect
            name="is_review"
            label="评审状态"
            required
            message="请选择评审状态"
            options={[
              { value: 1, label: '已评审' },
              { value: 0, label: '未评审' },
            ]}
          />
        </ProForm.Group>

        <ProFormTreeSelect
          name="module_id"
          label="计划目录"
          width="md"
          placeholder="请选择计划目录（可选）"
          fieldProps={{
            variant: 'filled',
            treeData,
            fieldNames: { label: 'title', value: 'value' },
            filterTreeNode: true,
          }}
        />

        {!file ? (
          <ProFormUploadDragger
            title={false}
            max={1}
            description="点击或拖拽 Excel 文件到此区域上传"
            width="md"
            name="file"
            fieldProps={{
              accept: '.xlsx,.xls',
              beforeUpload: (f) => {
                handleUpload([{ originFileObj: f }]);
                return false;
              },
              showUploadList: false,
            }}
          />
        ) : (
          <FileUploadArea
            file={file}
            uploading={uploading}
            error={uploadError}
            styles={styles}
            token={token}
            onRemove={handleRemove}
          />
        )}

        {validateResult && !uploading && (
          <div
            style={{
              marginTop: 16,
              padding: 20,
              borderRadius: 12,
              background: styles.containerBg,
              border: `1px solid ${styles.cardBorder}`,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                marginBottom: 16,
              }}
            >
              <div style={{ display: 'flex', gap: 16 }}>
                <StatCard
                  label="总行数"
                  value={validateResult.total_count}
                  icon={
                    <CheckCircleOutlined
                      style={{ color: token.colorPrimary, fontSize: 16 }}
                    />
                  }
                  style={statCardBaseStyle}
                />
                <StatCard
                  label="有效用例"
                  value={validateResult.valid_count}
                  icon={
                    <span style={{ color: '#10b981', fontSize: 16 }}>✓</span>
                  }
                  style={statCardBaseStyle}
                />
                {hasInvalid && (
                  <StatCard
                    label="无效用例"
                    value={validateResult.invalid_count}
                    icon={
                      <span style={{ color: '#ef4444', fontSize: 16 }}>✗</span>
                    }
                    style={statCardBaseStyle}
                  />
                )}
              </div>
              <div
                style={{
                  padding: '12px 24px',
                  background: `linear-gradient(135deg, ${passRateColor.start} 0%, ${passRateColor.end} 100%)`,
                  borderRadius: 10,
                  color: 'white',
                  textAlign: 'center',
                  boxShadow: isDark
                    ? '0 4px 12px rgba(0,0,0,0.5)'
                    : '0 4px 12px rgba(0,0,0,0.15)',
                }}
              >
                <div style={{ fontSize: 11, opacity: 0.9, marginBottom: 2 }}>
                  通过率
                </div>
                <div style={{ fontSize: 28, fontWeight: 700 }}>{passRate}%</div>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 6,
                  fontSize: 12,
                  color: styles.textSecondary,
                }}
              >
                <span>校验进度</span>
                <span style={{ fontWeight: 600, color: styles.textPrimary }}>
                  校验完成 {validateResult.total_count} 条
                </span>
              </div>
              <Progress
                percent={100}
                showInfo={false}
                strokeColor={{
                  '0%': token.colorPrimary,
                  '100%': token.colorPrimary,
                }}
                trailColor={styles.cardBorder}
                size="default"
                status="success"
              />
            </div>

            {validateResult.errors.length > 0 && (
              <div
                style={{
                  marginTop: 16,
                  background: styles.errorBg,
                  borderRadius: 8,
                  padding: 12,
                  border: `1px solid ${styles.errorBorder}`,
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    marginBottom: 8,
                    color: styles.errorText,
                    fontWeight: 500,
                  }}
                >
                  ⚠ 错误详情（仅展示前 10 条）
                </div>
                <div
                  style={{
                    maxHeight: 150,
                    overflowY: 'auto',
                    fontSize: 12,
                    wordBreak: 'break-word',
                  }}
                >
                  {formatErrors(validateResult.errors.slice(0, 10)).map(
                    (err, i) => (
                      <div
                        key={i}
                        style={{
                          padding: '4px 0',
                          color: styles.errorText,
                          borderBottom:
                            i < 9
                              ? `1px dashed ${styles.errorDashBorder}`
                              : 'none',
                        }}
                      >
                        {err}
                      </div>
                    ),
                  )}
                  {validateResult.errors.length > 10 && (
                    <div
                      style={{
                        color: styles.errorText,
                        marginTop: 8,
                        fontStyle: 'italic',
                      }}
                    >
                      ... 还有 {validateResult.errors.length - 10} 条错误未展示
                    </div>
                  )}
                </div>
              </div>
            )}

            {allInvalid && (
              <InfoAlert
                type="error"
                message="所有用例均无效，请检查文件格式或数据内容后重新上传"
                styles={styles}
              />
            )}
            {!allInvalid && hasValid && (
              <>
                <InfoAlert
                  type="success"
                  message={
                    hasInvalid
                      ? `将导入 ${validateResult.valid_count} 条有效用例，${validateResult.invalid_count} 条无效用例将被跳过`
                      : '所有用例校验通过，可以导入'
                  }
                  styles={styles}
                />
                {hasInvalid && (
                  <InfoAlert
                    type="info"
                    message="💡 提示：可点击上方「移除」按钮删除文件后重新上传"
                    styles={styles}
                  />
                )}
              </>
            )}
          </div>
        )}
      </ProCard>
    </ModalForm>
  );
};

export default PlanCaseImportModal;

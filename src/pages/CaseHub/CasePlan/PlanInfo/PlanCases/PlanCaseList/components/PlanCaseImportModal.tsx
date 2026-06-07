/**
 * 计划用例批量导入弹窗组件
 */
import { commitPlanImportCase } from '@/api/case/caseplan';
import {
  cancelImportCase,
  downloadCaseExcel,
  uploadPreviewCase,
} from '@/api/case/testCase';
import { toSelectOptions } from '@/pages/CaseHub/hooks/caseEnumOption';
import { useCaseEnumConfig } from '@/pages/CaseHub/hooks/useCaseEnumConfig';
import type { IPlanModule } from '@/pages/CaseHub/types';
import {
  CheckCircleOutlined,
  DeleteOutlined,
  DownloadOutlined,
  InboxOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import {
  ModalForm,
  ProCard,
  ProForm,
  ProFormCheckbox,
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
  /** 导入完成后触发: 刷新用例列表 */
  onUploadFinish: () => void;
  /**
   * 导入完成后触发: 刷新左侧计划目录树 (可选)
   * Excel "所属分组" 列会被解析为 plan_module 路径, 缺失节点会自动创建,
   * 因此需要刷新目录树以展示新创建的目录.
   */
  onModuleRefresh?: () => void;
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
  first_status?: '0' | '1' | '2' | '3' | '4';
  second_status?: '0' | '1' | '2' | '3' | '4';
  is_review: string;
  /** 默认计划目录 (Excel 「所属分组」 缺失时兜底) */
  module_id?: number;
  /** 是否跳过 plan 内已关联的同名用例 (默认 true) */
  skip_duplicate?: boolean;
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
  options: { value: string; label: string }[];
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
  onModuleRefresh,
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
  /**
   * 从 Context 动态获取评审状态选项
   * 用于导入表单中的评审状态 Select
   */
  const { options: reviewOptions } = useCaseEnumConfig('REVIEW_STATUS');
  // 一轮 / 二轮状态选项 (与 BatchEditModal 保持一致, 复用 CASE_STATUS 枚举)
  const { options: caseOptions } = useCaseEnumConfig('CASE_STATUS');
  /** 一轮 / 二轮状态共用一份 Select 选项 (来自同一 CASE_STATUS 枚举)
   *  默认空选项, 避免后端拉不到数据时表单变成"无选项可选".
   *  内置一份与后端默认值一致的兑底, 拉取成功后会被覆盖.
   */
  const roundStatusFormOptions = useMemo(() => {
    const opts = toSelectOptions(caseOptions);
    if (opts.length > 0) return opts;
    // 兑底: 与后端 PlanCaseAssociation.first_status/second_status 含义一致
    // "0"=未开始 "1"=通过 "2"=失败 "3"=阻塞 "4"=跳过
    return [
      { value: '0', label: '未开始' },
      { value: '1', label: '通过' },
      { value: '2', label: '失败' },
      { value: '3', label: '阻塞' },
      { value: '4', label: '跳过' },
    ];
  }, [caseOptions]);

  /** 评审状态选项（转换为 FormSelect 所需格式） */
  const reviewStatusFormOptions = useMemo(() => {
    const opts = toSelectOptions(reviewOptions);
    return opts.length > 0
      ? opts
      : [
          { value: '1', label: '已评审' },
          { value: '0', label: '未评审' },
        ];
  }, [reviewOptions]);
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

  /** 下载用例导入模板 (与 CaseDataTable 共用同一模板) */
  const handleDownloadTemplate = useCallback(async () => {
    try {
      const { blob, filename } = await downloadCaseExcel({
        responseType: 'blob',
      });
      const objectURL = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectURL;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectURL);
    } catch (error) {
      message.error('下载模板失败');
    }
  }, []);

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

  const handleUpload = useCallback(
    async (fileList: { originFileObj?: File }[]) => {
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
    },
    [],
  );

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
          first_status: values.first_status,
          second_status: values.second_status,
          is_review: values.is_review,
          // 复选框未选时 ProForm 给的是 undefined, 与后端默认值 False 等价
          skip_duplicate: values.skip_duplicate !== false,
        })) as any;

        if (!response || response.code !== 0) {
          setUploadError(response?.msg || '导入失败');
          return false;
        }

        const imported = response.data?.imported_count || 0;
        const skipped = response.data?.skipped_count || 0;
        if (skipped > 0) {
          message.success(`成功导入 ${imported} 条, 跳过同名 ${skipped} 条`);
        } else {
          message.success(`成功导入数据 ${imported} 条`);
        }
        // 1) 刷新用例列表 (必传)
        onUploadFinish();
        // 2) 刷新计划目录树 (可选, group_path 会自动创建缺失的 plan_module)
        safeInvokeRefresh();
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
    [validateResult, planId, onUploadFinish, resetAllState, safeInvokeRefresh],
  );

  /**
   * 安全调用模块目录刷新回调
   * - 缺失/抛错均不影响主流程 (导入已成功)
   * - 单独的 try/catch 防止一个回调失败污染其它回调
   */
  const safeInvokeRefresh = useCallback(() => {
    if (!onModuleRefresh) return;
    try {
      onModuleRefresh();
    } catch (err) {
      console.error('[PlanCaseImportModal] 模块目录树刷新失败:', err);
    }
  }, [onModuleRefresh]);

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
  // allInvalid: 所有用例都无效 (valid_count === 0 且 total_count > 0)
  // 旧实现是 `invalid_count === 0 && total_count > 0`, 含义是"没有无效用例",
  // 与命名/渲染条件相反, 全有效时反而误报"所有用例均无效".
  const allInvalid =
    validateResult &&
    validateResult.invalid_count > 0 &&
    validateResult.valid_count === 0 &&
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
            name="first_status"
            label="一轮状态"
            required={false}
            message="请选择一轮状态"
            options={roundStatusFormOptions}
          />
          <StatusSelect
            name="second_status"
            label="二轮状态"
            required={false}
            message="请选择二轮状态"
            options={roundStatusFormOptions}
          />
        </ProForm.Group>
        <ProForm.Group>
          <StatusSelect
            name="is_review"
            label="评审状态"
            required
            message="请选择评审状态"
            options={reviewStatusFormOptions}
          />
        </ProForm.Group>

        <ProFormCheckbox
          name="skip_duplicate"
          label="跳过同名用例"
          tooltip={[
            '开启后: 与"本计划已关联"的同名 case 比对, 命中即跳过(不写入关联), 计入"跳过同名 N 条".',
            'Excel 内部多行同名 case_name 不会被自动去重, 会作为 N 条不同 case 全部入库(id 不同), 视为复制粘贴.',
            '并发场景(同一 plan 同一时间多次上传)不保证去重, 视为后台工具的"尽力而为"去重.',
          ].join('\n')}
          initialValue={true}
        >
          跳过已关联的同名用例 (推荐开启, 避免重复)
        </ProFormCheckbox>

        <ProFormTreeSelect
          name="module_id"
          label="默认目录"
          width="md"
          placeholder="Excel 中无「所属分组」时, 落到该目录下"
          tooltip="Excel 每行的「所属分组」列(如「前端/登录/表单」)会按路径自动创建并落到对应计划目录; 该字段仅作为缺省兜底"
          fieldProps={{
            variant: 'filled',
            treeData,
            fieldNames: { label: 'title', value: 'value' },
            filterTreeNode: true,
          }}
        />

        <div
          style={{
            marginTop: -8,
            marginBottom: 12,
            padding: '8px 12px',
            background: styles.cardBg,
            border: `1px solid ${styles.cardBorder}`,
            borderRadius: 6,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 6,
            fontSize: 12,
            color: styles.textSecondary,
            lineHeight: 1.6,
          }}
        >
          <InfoCircleOutlined
            style={{ color: token.colorPrimary, marginTop: 2 }}
          />
          <span>
            Excel 模板与「用例库」共用, 其中的「所属分组」列(如
            <code
              style={{
                padding: '0 4px',
                margin: '0 2px',
                background: styles.iconBg,
                borderRadius: 3,
                fontFamily: token.fontFamilyCode,
                fontSize: 11,
                color: styles.textPrimary,
              }}
            >
              前端 / 登录 / 表单
            </code>
            ) 会被逐级解析为计划目录, 缺失节点会自动创建,
            用例落到对应叶子目录下.
            <a
              onClick={handleDownloadTemplate}
              style={{
                marginLeft: 8,
                color: token.colorPrimary,
                textDecoration: 'none',
              }}
            >
              <DownloadOutlined /> 下载导入模板
            </a>
          </span>
        </div>

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

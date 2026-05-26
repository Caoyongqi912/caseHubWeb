import { IModuleEnum } from '@/api';
import {
  cancelImportCase,
  commitImportCase,
  uploadPreviewCase,
} from '@/api/case/testCase';
import { ModuleEnum } from '@/utils/config';
import { fetchModulesEnum } from '@/utils/somefunc';
import {
  CheckCircleOutlined,
  DeleteOutlined,
  InboxOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import {
  ModalForm,
  ProForm,
  ProFormSelect,
  ProFormTreeSelect,
  ProFormUploadDragger,
} from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import { Button, Form, message, Progress, theme } from 'antd';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';

interface Props {
  onSuccess: () => void;
}

interface ErrorDetail {
  field: string;
  message: string;
}

interface ErrorRow {
  row: number;
  errors: ErrorDetail[];
}

interface ValidateResult {
  file_md5: string;
  total_count: number;
  valid_count: number;
  invalid_count: number;
  errors: ErrorRow[];
}

const UploadCaseModal: FC<Props> = ({ onSuccess }) => {
  const { token } = theme.useToken();
  const [uploadForm] = Form.useForm();
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [validateResult, setValidateResult] = useState<ValidateResult | null>(
    null,
  );
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { initialState } = useModel('@@initialState');
  const [selectProjectId, setSelectProjectId] = useState<number>();
  const [moduleEnum, setModuleEnum] = useState<IModuleEnum[]>([]);
  const projects = initialState?.projects || [];
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

  const isDark = token.colorBgContainer === '#141414';

  const styles = useMemo(
    () => ({
      cardBg: isDark ? '#1f1f1f' : '#ffffff',
      cardBorder: isDark ? '#303030' : '#e2e8f0',
      cardShadow: isDark
        ? '0 1px 3px rgba(0,0,0,0.4)'
        : '0 1px 3px rgba(0,0,0,0.08)',
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

  const passRate = useMemo(() => {
    if (!validateResult || validateResult.total_count === 0) return 0;
    return Math.round(
      (validateResult.valid_count / validateResult.total_count) * 100,
    );
  }, [validateResult]);

  const passRateColor = useMemo(() => {
    if (passRate >= 80) return { start: '#10b981', end: '#059669' };
    if (passRate >= 50) return { start: '#f59e0b', end: '#d97706' };
    return { start: '#ef4444', end: '#dc2626' };
  }, [passRate]);

  const statCardStyle = useMemo(
    () => ({
      padding: '12px 20px',
      background: styles.cardBg,
      borderRadius: 10,
      boxShadow: styles.cardShadow,
      border: `1px solid ${styles.cardBorder}`,
      minWidth: 100,
    }),
    [styles],
  );

  const StatCard = ({
    label,
    value,
    icon,
  }: {
    label: string;
    value: number;
    icon: React.ReactNode;
  }) => (
    <div style={statCardStyle}>
      <div
        style={{ fontSize: 12, color: styles.textSecondary, marginBottom: 4 }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 24,
          fontWeight: 700,
          color: styles.textPrimary,
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

  const resetAllState = useCallback(() => {
    uploadForm.resetFields();
    setUploadFile(null);
    setValidateResult(null);
    setUploadError(null);
    setUploading(false);
    setConfirming(false);
  }, [uploadForm]);

  const handleModalOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        resetAllState();
      }
    },
    [resetAllState],
  );

  const handleFileChange = async (fileList: any[]) => {
    if (!fileList || fileList.length === 0) {
      await handleRemoveFile();
      return;
    }

    const file = fileList[0]?.originFileObj as File;
    if (!file) return;

    setUploadFile(file);
    setValidateResult(null);
    setUploadError(null);
    setUploading(true);

    try {
      const response = (await uploadPreviewCase(file)) as any;

      if (!response) {
        setUploadError('服务器未返回数据，请重试');
        return;
      }

      if (response.code === 0 && response.data) {
        setValidateResult({
          file_md5: response.data?.file_md5 || '',
          total_count: response.data?.total_count || 0,
          valid_count: response.data?.valid_count || 0,
          invalid_count: response.data?.invalid_count || 0,
          errors: response.data?.errors || [],
        });
        setUploadError(null);
      } else {
        setUploadError(response.msg || '上传失败');
        setValidateResult(null);
      }
    } catch (error: any) {
      console.error('上传预览错误:', error);
      setUploadError(error?.msg || error?.message || '上传失败，请重试');
      setValidateResult(null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = async () => {
    if (validateResult?.file_md5) {
      try {
        await cancelImportCase(validateResult.file_md5);
      } catch (error) {
        console.error('清理缓存失败:', error);
      }
    }
    uploadForm.resetFields(['file']);
    setUploadFile(null);
    setValidateResult(null);
    setUploadError(null);
  };

  const handleConfirmImport = async (values: any) => {
    if (!validateResult?.file_md5) {
      return false;
    }

    setConfirming(true);

    try {
      const response = (await commitImportCase({
        file_md5: validateResult.file_md5,
        project_id: values.project_id,
        module_id: values.module_id,
        is_common: true,
      })) as any;

      if (!response || response.code !== 0) {
        setUploadError(response?.msg || '导入失败');
        return false;
      }

      const importedCount = response.data?.imported_count || 0;
      message.success(`成功导入数据 ${importedCount} 条`);
      onSuccess();
      resetAllState();
      return true;
    } catch (error: any) {
      console.error('导入错误:', error);
      setUploadError(error?.msg || error?.message || '导入失败，请重试');
      return false;
    } finally {
      setConfirming(false);
    }
  };

  const formatErrorDetails = (errors: ErrorRow[]): string[] => {
    return errors.map((error) => {
      const msgs = error.errors.map((e) => e.message).join('；');
      return `第 ${error.row} 行：${msgs}`;
    });
  };

  return (
    <ModalForm
      form={uploadForm}
      trigger={
        <Button type="primary">
          <UploadOutlined />
          上传
        </Button>
      }
      title="上传用例"
      layout="horizontal"
      onFinish={handleConfirmImport}
      onOpenChange={handleModalOpenChange}
      submitter={{
        searchConfig: {
          submitText: '确认导入',
          resetText: '取消',
        },
        submitButtonProps: {
          disabled:
            !validateResult?.file_md5 || validateResult.valid_count === 0,
          loading: confirming,
        },
        resetButtonProps: {
          onClick: () => handleModalOpenChange(false),
        },
      }}
    >
      <ProForm.Group>
        <ProFormSelect
          label="所属项目"
          options={projects}
          name="project_id"
          width="md"
          required
          rules={[{ required: true, message: '请选择项目' }]}
          fieldProps={{
            variant: 'filled',
            onChange: (value) => setSelectProjectId(value as number),
          }}
        />
        <ProFormTreeSelect
          required
          name="module_id"
          label="所属模块"
          width="md"
          rules={[{ required: true, message: '所属模块必选' }]}
          fieldProps={{
            variant: 'filled',
            treeData: moduleEnum,
            fieldNames: { label: 'title', value: 'value' },
            filterTreeNode: true,
          }}
        />
      </ProForm.Group>

      {!uploadFile ? (
        <ProFormUploadDragger
          title={false}
          max={1}
          description="点击或拖拽 Excel 文件到此区域上传"
          width="md"
          name="file"
          fieldProps={{
            accept: '.xlsx,.xls',
            beforeUpload: (file) => {
              handleFileChange([{ originFileObj: file }]);
              return false;
            },
            showUploadList: false,
          }}
        />
      ) : (
        <div
          style={{
            marginBottom: 16,
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
                <InboxOutlined
                  style={{ fontSize: 24, color: token.colorPrimary }}
                />
              </div>
              <div>
                <div
                  style={{
                    fontWeight: 500,
                    marginBottom: 4,
                    color: styles.textPrimary,
                  }}
                >
                  {uploadFile.name}
                </div>
                <div style={{ fontSize: 12, color: styles.textSecondary }}>
                  {(uploadFile.size / 1024).toFixed(1)} KB
                </div>
              </div>
            </div>

            {uploading ? (
              <Button type="text" disabled>
                上传中...
              </Button>
            ) : (
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={handleRemoveFile}
              >
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

          {uploadError && !uploading && (
            <div
              style={{
                marginTop: 12,
                padding: '8px 12px',
                borderRadius: 6,
                fontSize: 13,
                color: styles.errorText,
              }}
            >
              {uploadError}
            </div>
          )}
        </div>
      )}

      {validateResult && !uploading && (
        <div
          style={{
            marginBottom: 16,
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
              />
              <StatCard
                label="有效用例"
                value={validateResult.valid_count}
                icon={<span style={{ color: '#10b981', fontSize: 16 }}>✓</span>}
              />
              {validateResult.invalid_count > 0 && (
                <StatCard
                  label="无效用例"
                  value={validateResult.invalid_count}
                  icon={
                    <span style={{ color: '#ef4444', fontSize: 16 }}>✗</span>
                  }
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
                {formatErrorDetails(validateResult.errors.slice(0, 10)).map(
                  (err, index) => (
                    <div
                      key={index}
                      style={{
                        padding: '4px 0',
                        color: styles.errorText,
                        borderBottom:
                          index < 9
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

          {validateResult.invalid_count === 0 && (
            <div
              style={{
                marginTop: 12,
                padding: 12,
                borderRadius: 6,
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                color: '#059669',
                background: styles.successBg,
                border: `1px solid ${styles.successBorder}`,
              }}
            >
              <CheckCircleOutlined />
              所有用例校验通过，可以导入
            </div>
          )}

          {validateResult.invalid_count > 0 &&
            validateResult.valid_count === 0 && (
              <div
                style={{
                  marginTop: 12,
                  padding: 12,
                  borderRadius: 6,
                  fontSize: 13,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  color: styles.errorText,
                  background: styles.errorBg,
                  border: `1px solid ${styles.errorBorder}`,
                }}
              >
                <span style={{ fontSize: 16 }}>⚠</span>
                所有用例均无效，请检查文件格式或数据内容后重新上传
              </div>
            )}

          {validateResult.invalid_count > 0 &&
            validateResult.valid_count > 0 && (
              <div
                style={{
                  marginTop: 12,
                  padding: 12,
                  borderRadius: 6,
                  fontSize: 13,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  color: styles.textPrimary,
                  background: styles.cardBg,
                  border: `1px solid ${styles.cardBorder}`,
                }}
              >
                <CheckCircleOutlined style={{ color: passRateColor.start }} />
                将导入 {validateResult.valid_count} 条有效用例，
                {validateResult.invalid_count} 条无效用例将被跳过
              </div>
            )}

          {validateResult.invalid_count > 0 &&
            validateResult.valid_count > 0 && (
              <div
                style={{
                  marginTop: 12,
                  fontSize: 12,
                  color: styles.tipColor,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                💡 提示：可点击上方「移除」按钮删除文件后重新上传
              </div>
            )}
        </div>
      )}
    </ModalForm>
  );
};

export default UploadCaseModal;

import {
  cancelImportCase,
  cancelImportCaseM2,
  commitImportCase,
  downloadCaseExcel,
  importCommitCase,
  uploadPreviewCase,
  type TemplateType,
} from '@/api/case/testCase';
import {
  CheckCircleOutlined,
  DeleteOutlined,
  DownloadOutlined,
  InboxOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { ModalForm, ProFormRadio } from '@ant-design/pro-components';
import {
  Alert,
  Button,
  Card,
  Col,
  Divider,
  Form,
  message,
  Progress,
  Row,
  Space,
  Statistic,
  Tag,
  Typography,
  Upload,
} from 'antd';
import { FC, useCallback, useMemo, useState } from 'react';

const { Dragger } = Upload;
const { Text, Title } = Typography;

interface Props {
  /**
   * 提交导入成功后触发：刷新右侧用例表格
   * 由调用方（CaseDataTable）提供，内部只负责触发时机
   */
  onSuccess: () => void;
  /**
   * 提交导入成功后触发：刷新左侧模块目录树（可选）
   * 目录树位于独立组件树中，通过父级回调联动刷新；
   * 不传则只刷新表格（兼容历史用法）
   */
  onModuleRefresh?: () => void;
  /**
   * 当前项目 ID (必填). 由父组件 (CaseDataTable) 透传,
   * 跟"用例库"页面当前选中的项目保持一致.
   * 同时用于:
   * - 预览阶段"用例库分组"硬门禁校验
   * - commit 入库时的 project_id
   * 父组件在没拿到 currentProjectId 时, 不会渲染本组件 / 不会渲染上传按钮.
   */
  currentProjectId: number;
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
  /**
   * 后端在 result.errors 非空时为 false, 此时 Redis 无预览缓存,
   * commit 必失败. 兼容老后端: 字段缺失视为 true.
   */
  can_commit: boolean;
  /**
   * PR-3: 模板类型. 缺省 / 字段缺失视为 M1 (老后端兼容).
   * - M1: 老 9 列模板, 走 on_duplicate 老逻辑
   * - M2: 10 列 + _meta sheet, 走 case_id 同步 (无视 on_duplicate)
   */
  template_type?: TemplateType;
  /**
   * PR-3: 警告信息 (M2 解析可能产生, 如某行有 case_id 但 DB 查不到).
   * 不阻塞 commit, 仅展示给用户.
   */
  warnings?: Array<{ row?: number; field?: string; message: string }>;
  /**
   * PR-3: 预览数据 (前 10 条), M2 路径会带 case_id. 暂不渲染, 留作扩展.
   */
  preview_data?: Array<Record<string, any>>;
}

/** 相同用例处理: skip = 跳过 (默认 create). 透传后端 on_duplicate. */
type DuplicateMode = 'skip' | 'create';

const DUPLICATE_OPTIONS: {
  value: DuplicateMode;
  label: string;
  hint: string;
}[] = [
  {
    value: 'skip',
    label: '跳过该用例',
    hint: '当 (分组, 标题) 与已有用例一致时整行跳过，计入 skipped_count。',
  },
  {
    value: 'create',
    label: '创建新的用例',
    hint: '不检查重复，全部写入，标题可以重复。',
  },
];

const UploadCaseModal: FC<Props> = ({
  onSuccess,
  onModuleRefresh,
  currentProjectId,
}) => {
  const [uploadForm] = Form.useForm();
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [validateResult, setValidateResult] = useState<ValidateResult | null>(
    null,
  );
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const passRate = useMemo(() => {
    if (!validateResult || validateResult.total_count === 0) return 0;
    return Math.round(
      (validateResult.valid_count / validateResult.total_count) * 100,
    );
  }, [validateResult]);

  /**
   * PR-3: M1/M2 分支标志. M2 走 case_id 同步, 隐藏 on_duplicate + 显示提示.
   * 缺省 M1 (老后端兼容).
   */
  const isM2 = validateResult?.template_type === 'M2';

  const duplicateMode: DuplicateMode =
    uploadForm.getFieldValue('on_duplicate') ?? 'create';
  const activeHint = useMemo(
    () => DUPLICATE_OPTIONS.find((opt) => opt.value === duplicateMode)?.hint,
    [duplicateMode],
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
    (nextOpen: boolean) => {
      setOpen(nextOpen);
      if (!nextOpen) {
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
      if (!currentProjectId) {
        setUploadError('当前项目未就绪, 请稍后再试');
        setValidateResult(null);
        setUploading(false);
        return;
      }
      const response = (await uploadPreviewCase(file, currentProjectId)) as any;

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
          can_commit: response.data?.can_commit ?? true,
          // PR-3: 模板类型. 缺省视为 M1 (老后端兼容).
          template_type: response.data?.template_type ?? 'M1',
          warnings: response.data?.warnings || [],
          preview_data: response.data?.preview_data || [],
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
        // PR-3: cancel 分支. M1 走 /upload/cancel, M2 走 /import/cancel.
        // 端点分开, 跟 M1/M2 commit 端点对应, 互不干扰.
        if (isM2) {
          await cancelImportCaseM2(validateResult.file_md5);
        } else {
          await cancelImportCase(validateResult.file_md5);
        }
      } catch (error) {
        console.error('清理缓存失败:', error);
      }
    }
    uploadForm.resetFields(['file']);
    setUploadFile(null);
    setValidateResult(null);
    setUploadError(null);
  };

  /**
   * 下载用例模版 (.xlsx).
   * 响应拦截器 (requestErrorConfig.ts -> isBlob) 会自动处理 blob 下载，
   * 此处只需调用接口，无需手动创建 <a> 标签（否则会导致重复下载）
   */
  const handleDownloadTemplate = useCallback(async () => {
    setDownloading(true);
    try {
      await downloadCaseExcel({
        responseType: 'blob',
      });
    } catch (error) {
      console.error('下载模板失败:', error);
      message.error('下载模板失败');
    } finally {
      setDownloading(false);
    }
  }, []);

  /**
   * 安全调用刷新回调
   * 单个回调抛错不应影响整体流程，仅在控制台记录错误
   * @param fn - 刷新回调，可能为 undefined
   * @param label - 回调用途描述，用于错误日志
   */
  const safeInvoke = (fn: (() => void) | undefined, label: string) => {
    if (!fn) return;
    try {
      fn();
    } catch (err) {
      console.error(`[UploadCaseModal] ${label}回调执行失败:`, err);
    }
  };

  /**
   * 提交导入
   * 成功后联动刷新：右侧表格 + 左侧模块目录树
   * 注意：两个刷新回调相互独立，任一失败不应阻塞另一回调的执行，
   *       用 try/catch 包裹单个回调避免单个刷新异常导致整体回滚
   */
  const handleConfirmImport = async () => {
    if (!validateResult?.file_md5) {
      return false;
    }

    setConfirming(true);

    try {
      if (!currentProjectId) {
        setUploadError('当前项目未就绪, 无法入库');
        return false;
      }
      // PR-3: M1/M2 commit 分支. M2 走新 /import/commit 端点, 无视 on_duplicate.
      let response: any;
      let successMsg: string;
      if (isM2) {
        response = (await importCommitCase({
          file_md5: validateResult.file_md5,
          project_id: currentProjectId,
        })) as any;
        if (!response || response.code !== 0) {
          setUploadError(response?.msg || 'M2 导入失败');
          return false;
        }
        const inserted = response.data?.inserted ?? 0;
        const updated = response.data?.updated ?? 0;
        successMsg = `已修改 ${updated} 条, 新增 ${inserted} 条`;
      } else {
        const onDuplicate: DuplicateMode =
          uploadForm.getFieldValue('on_duplicate') === 'skip'
            ? 'skip'
            : 'create';
        response = (await commitImportCase({
          file_md5: validateResult.file_md5,
          project_id: currentProjectId,
          is_common: true,
          on_duplicate: onDuplicate,
        })) as any;
        if (!response || response.code !== 0) {
          setUploadError(response?.msg || '导入失败');
          return false;
        }
        const importedCount = response.data?.imported_count || 0;
        const skippedCount = response.data?.skipped_count || 0;
        successMsg =
          skippedCount > 0
            ? `成功导入 ${importedCount} 条, 跳过重复 ${skippedCount} 条`
            : `成功导入数据 ${importedCount} 条`;
      }
      message.success(successMsg);

      safeInvoke(onSuccess, '表格刷新');
      safeInvoke(onModuleRefresh, '模块目录树刷新');

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

  const formatErrorDetails = (errors: ErrorRow[]): string[] =>
    errors.map((error) => {
      const msgs = error.errors.map((e) => e.message).join('；');
      return `第 ${error.row} 行：${msgs}`;
    });

  return (
    <>
      <Button type="primary" onClick={() => setOpen(true)}>
        <UploadOutlined />
        上传
      </Button>
      <ModalForm
        form={uploadForm}
        title="上传用例"
        open={open}
        layout="vertical"
        onFinish={handleConfirmImport}
        onOpenChange={handleModalOpenChange}
        initialValues={{ on_duplicate: 'create' }}
        modalProps={{ width: 640 }}
        submitter={{
          searchConfig: {
            submitText: confirming ? '导入中…' : '确认导入',
            resetText: '取消',
          },
          submitButtonProps: {
            disabled: !validateResult?.file_md5 || !validateResult.can_commit,
            loading: confirming,
          },
          resetButtonProps: {
            onClick: () => handleModalOpenChange(false),
          },
        }}
      >
        <Space vertical size="small" style={{ display: 'flex' }}>
          <Title level={5} style={{ margin: 0 }}>
            下载模板
          </Title>
          <Text type="secondary">
            请先下载标准模板，按模板格式填写后再上传。
          </Text>
        </Space>

        <Button
          loading={downloading}
          onClick={handleDownloadTemplate}
          icon={<DownloadOutlined />}
          style={{ marginTop: 12 }}
        >
          下载用例导入模板 (.xlsx)
        </Button>

        <Divider />

        {/* PR-3: M1 显示 on_duplicate 选项; M2 隐藏, 用 M2 Tag + 导回协议提示代替. */}
        {!isM2 && (
          <>
            <Space vertical size="small" style={{ display: 'flex' }}>
              <Title level={5} style={{ margin: 0 }}>
                相同用例处理
              </Title>
              <Text type="secondary">
                当导入文件中包含与导入位置相同用例（分组 +
                标题完全一致）时，选择执行方式。
              </Text>
            </Space>

            <ProFormRadio.Group
              name="on_duplicate"
              options={DUPLICATE_OPTIONS.map((opt) => ({
                value: opt.value,
                label: opt.label,
              }))}
              radioType="button"
              fieldProps={{
                buttonStyle: 'solid',
                size: 'middle',
              }}
            />

            <Text type="secondary" style={{ fontSize: 12 }}>
              {activeHint}
            </Text>

            <Divider />
          </>
        )}

        {isM2 && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Tag color="blue">M2</Tag>
              <Title level={5} style={{ margin: 0 }}>
                导回协议
              </Title>
            </div>
            <Alert
              type="info"
              showIcon
              message="按 用例ID 同步, 无视重复检查"
              description="已导出的文件再次传回时, 系统按 用例ID 命中更新, 未命中的行作为新增入库. 名字冲突不跳过, 删行无操作."
              style={{ marginTop: 8 }}
            />
            <Divider />
          </>
        )}

        <Space vertical size="small" style={{ display: 'flex' }}>
          <Title level={5} style={{ margin: 0 }}>
            上传 Excel 稿件
          </Title>
          <Text type="secondary">
            支持 <Text code>.xlsx</Text> / <Text code>.xls</Text>{' '}
            格式；文件将先进入校验队列，校验通过后方可入库。
          </Text>
        </Space>

        {!uploadFile ? (
          <Dragger
            accept=".xlsx,.xls"
            beforeUpload={(file) => {
              handleFileChange([{ originFileObj: file }]);
              return false;
            }}
            showUploadList={false}
            style={{ marginTop: 16, marginBottom: 8 }}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined style={{ fontSize: 48, color: '#1677ff' }} />
            </p>
            <p className="ant-upload-text">点击或拖拽 Excel 文件到此区域上传</p>
            <p className="ant-upload-hint">单次仅支持上传一个文件</p>
          </Dragger>
        ) : (
          <Card
            style={{ marginTop: 16, marginBottom: 8 }}
            styles={{ body: { padding: 16 } }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Space size="middle">
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 6,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#f0f5ff',
                  }}
                >
                  <InboxOutlined style={{ fontSize: 20, color: '#1677ff' }} />
                </div>
                <div>
                  <div style={{ fontWeight: 500 }}>{uploadFile.name}</div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {(uploadFile.size / 1024).toFixed(1)} KB
                  </Text>
                </div>
              </Space>

              {uploading ? (
                <Button type="text" disabled>
                  校验中…
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
                <Text
                  type="secondary"
                  style={{
                    display: 'block',
                    marginTop: 8,
                    textAlign: 'center',
                  }}
                >
                  正在校验文件…
                </Text>
              </div>
            )}

            {uploadError && !uploading && (
              <Alert
                title={uploadError}
                type="error"
                showIcon
                style={{ marginTop: 12 }}
              />
            )}
          </Card>
        )}

        {validateResult && !uploading && (
          <>
            <Space vertical size="small" style={{ display: 'flex' }}>
              <Title level={5} style={{ margin: 0 }}>
                校验结果
              </Title>
            </Space>

            <Card variant="outlined" style={{ marginTop: 12 }}>
              <Row gutter={24} align="middle">
                <Col>
                  <Statistic
                    title="总行数"
                    value={validateResult.total_count}
                  />
                </Col>
                <Col>
                  <Statistic
                    title="有效"
                    value={validateResult.valid_count}
                    styles={{ value: { color: '#52c41a' } }}
                  />
                </Col>
                {validateResult.invalid_count > 0 && (
                  <Col>
                    <Statistic
                      title="无效"
                      value={validateResult.invalid_count}
                      styles={{ value: { color: '#ff4d4f' } }}
                    />
                  </Col>
                )}
                <Col style={{ marginLeft: 'auto', textAlign: 'center' }}>
                  <Statistic
                    title="通过率"
                    value={passRate}
                    suffix="%"
                    styles={{
                      value: { color: passRate >= 80 ? '#52c41a' : '#ff4d4f' },
                    }}
                  />
                </Col>
              </Row>

              <div style={{ marginTop: 12 }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 4,
                  }}
                >
                  <Text type="secondary">校验完成</Text>
                  <Text strong>
                    {validateResult.valid_count} / {validateResult.total_count}
                  </Text>
                </div>
                <Progress
                  percent={100}
                  showInfo={false}
                  status="success"
                  size="small"
                />
              </div>
            </Card>

            {!validateResult.can_commit && (
              <Alert
                title="文件包含错误，无法继续入库"
                description="预览阶段未通过校验。请按下方错误详情修正 Excel 后重新上传。"
                type="warning"
                showIcon
                style={{ marginTop: 16 }}
              />
            )}

            {validateResult.errors.length > 0 && (
              <Alert
                title="错误详情（前 10 条）"
                description={
                  <div style={{ maxHeight: 150, overflowY: 'auto' }}>
                    {formatErrorDetails(validateResult.errors.slice(0, 10)).map(
                      (err, index) => (
                        <div
                          key={index}
                          style={{
                            padding: '4px 0',
                            borderBottom:
                              index < 9 ? '1px dashed #f0f0f0' : 'none',
                          }}
                        >
                          {err}
                        </div>
                      ),
                    )}
                    {validateResult.errors.length > 10 && (
                      <Text
                        type="secondary"
                        style={{ display: 'block', marginTop: 8 }}
                      >
                        … 还有 {validateResult.errors.length - 10} 条错误未展示
                      </Text>
                    )}
                  </div>
                }
                type="error"
                showIcon
                style={{ marginTop: 16 }}
              />
            )}

            {/* PR-3: M2 warnings 展示. 不阻塞 commit, 仅提示 (e.g. case_id 缺失对应行). */}
            {isM2 && (validateResult.warnings?.length ?? 0) > 0 && (
              <Alert
                type="warning"
                showIcon
                style={{ marginTop: 16 }}
                message={`警告（前 ${Math.min(
                  10,
                  validateResult.warnings!.length,
                )} 条）`}
                description={
                  <div style={{ maxHeight: 150, overflowY: 'auto' }}>
                    {validateResult.warnings!.slice(0, 10).map((w, i) => (
                      <div
                        key={i}
                        style={{
                          padding: '4px 0',
                          borderBottom: i < 9 ? '1px dashed #f0f0f0' : 'none',
                        }}
                      >
                        {w.row ? `第 ${w.row} 行: ` : ''}
                        {w.message}
                      </div>
                    ))}
                    {validateResult.warnings!.length > 10 && (
                      <Text
                        type="secondary"
                        style={{ display: 'block', marginTop: 8 }}
                      >
                        … 还有 {validateResult.warnings!.length - 10}{' '}
                        条警告未展示
                      </Text>
                    )}
                  </div>
                }
              />
            )}

            {validateResult.invalid_count === 0 && (
              <Alert
                title="所有用例校验通过，可以导入。"
                type="success"
                showIcon
                icon={<CheckCircleOutlined />}
                style={{ marginTop: 16 }}
              />
            )}

            {validateResult.invalid_count > 0 &&
              validateResult.valid_count === 0 && (
                <Alert
                  title="所有用例均无效，请检查文件格式或数据内容后重新上传。"
                  type="error"
                  showIcon
                  style={{ marginTop: 16 }}
                />
              )}
          </>
        )}
      </ModalForm>
    </>
  );
};

export default UploadCaseModal;

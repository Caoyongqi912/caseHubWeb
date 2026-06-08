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
import {
  CheckCircleOutlined,
  DeleteOutlined,
  DownloadOutlined,
  InboxOutlined,
} from '@ant-design/icons';
import {
  ModalForm,
  ProForm,
  ProFormRadio,
  ProFormSelect,
} from '@ant-design/pro-components';
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
  Typography,
  Upload,
} from 'antd';
import { FC, useCallback, useMemo, useState } from 'react';

const { Dragger } = Upload;
const { Text, Title } = Typography;

interface PlanCaseImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planId: string;
  /**
   * 计划所属项目 ID (必填). 来自父组件 planInfo.project_id.
   * 用于预览阶段"用例库分组"硬门禁校验: plan 用例落库时 module_id
   * 要绑到该项目下的 case library, 所以必须先在那个项目下存在.
   * plan_module 树 (计划侧目录) 是从 case module "复制" 出来的副本.
   */
  projectId: number;
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

/** 相同用例处理: skip = 跳过 (默认 create). 透传后端 skip_duplicate. */
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

const PlanCaseImportModal: FC<PlanCaseImportModalProps> = ({
  open,
  onOpenChange,
  planId,
  projectId,
  onUploadFinish,
  onModuleRefresh,
}) => {
  const [form] = Form.useForm();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [validateResult, setValidateResult] = useState<ValidateResult | null>(
    null,
  );
  const [uploadError, setUploadError] = useState<string | null>(null);

  const duplicateMode: DuplicateMode =
    form.getFieldValue('on_duplicate') ?? 'create';
  const activeHint = useMemo(
    () => DUPLICATE_OPTIONS.find((opt) => opt.value === duplicateMode)?.hint,
    [duplicateMode],
  );

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

  const handleUpload = useCallback(
    async (fileList: { originFileObj?: File }[]) => {
      const rawFile = fileList?.[0]?.originFileObj as File;
      if (!rawFile) return;

      setFile(rawFile);
      setValidateResult(null);
      setUploadError(null);
      setUploading(true);

      try {
        if (!projectId) {
          setUploadError('计划未关联项目, 无法预览');
          setValidateResult(null);
          setUploading(false);
          return;
        }
        const response = (await uploadPreviewCase(rawFile, projectId)) as any;
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
    [projectId],
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

  const handleConfirm = useCallback(
    async (values: any) => {
      if (!validateResult?.file_md5) return false;

      setConfirming(true);
      try {
        const response = (await commitPlanImportCase({
          file_md5: validateResult.file_md5,
          plan_id: planId,
          first_status: values.first_status,
          second_status: values.second_status,
          is_review: values.is_review,
          skip_duplicate: values.on_duplicate === 'skip',
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

        onUploadFinish();
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

  const formatErrors = (errors: ErrorRow[]) =>
    errors.map(
      (e) => `第 ${e.row} 行：${e.errors.map((err) => err.message).join('；')}`,
    );

  const hasInvalid = validateResult && validateResult.invalid_count > 0;
  const allInvalid =
    validateResult &&
    validateResult.invalid_count > 0 &&
    validateResult.valid_count === 0 &&
    validateResult.total_count > 0;

  return (
    <ModalForm
      form={form}
      open={open}
      title="批量导入用例"
      layout="vertical"
      onFinish={handleConfirm}
      onOpenChange={handleModalChange}
      modalProps={{ destroyOnHidden: true, width: 640 }}
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
      {/* 下载模板 */}
      <Space vertical size="small" style={{ display: 'flex' }}>
        <Title level={5} style={{ margin: 0 }}>
          下载模板
        </Title>
        <Text type="secondary">请先下载标准模板，按模板格式填写后再上传。</Text>
      </Space>

      <Button
        onClick={handleDownloadTemplate}
        icon={<DownloadOutlined />}
        style={{ marginTop: 12 }}
      >
        下载用例导入模板 (.xlsx)
      </Button>

      <Divider />

      {/* 相同用例处理 */}
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
        initialValue="create"
      />

      <Text type="secondary" style={{ fontSize: 12 }}>
        {activeHint}
      </Text>

      <Divider />

      {/* 状态设置 */}
      <Space vertical size="small" style={{ display: 'flex' }}>
        <Title level={5} style={{ margin: 0 }}>
          状态设置
        </Title>
        <Text type="secondary">设置导入用例的默认状态（可选）。</Text>
      </Space>

      <ProForm.Group>
        <ProFormSelect
          name="first_status"
          label="一轮状态"
          options={roundStatusFormOptions}
          placeholder="请选择"
          allowClear
        />
        <ProFormSelect
          name="second_status"
          label="二轮状态"
          options={roundStatusFormOptions}
          placeholder="请选择"
          allowClear
        />
      </ProForm.Group>

      <ProFormSelect
        name="is_review"
        label="评审状态"
        options={reviewStatusFormOptions}
        placeholder="请选择"
        rules={[{ required: true, message: '请选择评审状态' }]}
      />

      <Divider />

      {/* 上传区域 */}
      <Space vertical size="small" style={{ display: 'flex' }}>
        <Title level={5} style={{ margin: 0 }}>
          上传 Excel 稿件
        </Title>
        <Text type="secondary">
          支持 <Text code>.xlsx</Text> / <Text code>.xls</Text>{' '}
          格式；文件将先进入校验队列，校验通过后方可入库。
        </Text>
      </Space>

      {!file ? (
        <Dragger
          accept=".xlsx,.xls"
          beforeUpload={(f) => {
            handleUpload([{ originFileObj: f }]);
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
                <div style={{ fontWeight: 500 }}>{file.name}</div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {(file.size / 1024).toFixed(1)} KB
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
                onClick={handleRemove}
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
                style={{ display: 'block', marginTop: 8, textAlign: 'center' }}
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
                <Statistic title="总行数" value={validateResult.total_count} />
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

          {validateResult.errors.length > 0 && (
            <Alert
              title="错误详情（前 10 条）"
              description={
                <div style={{ maxHeight: 150, overflowY: 'auto' }}>
                  {formatErrors(validateResult.errors.slice(0, 10)).map(
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

          {allInvalid && (
            <Alert
              title="所有用例均无效，请检查文件格式或数据内容后重新上传。"
              type="error"
              showIcon
              style={{ marginTop: 16 }}
            />
          )}

          {!allInvalid && validateResult.valid_count > 0 && (
            <Alert
              title={
                hasInvalid
                  ? `将导入 ${validateResult.valid_count} 条有效用例，${validateResult.invalid_count} 条无效用例将被跳过`
                  : '所有用例校验通过，可以导入。'
              }
              type={hasInvalid ? 'warning' : 'success'}
              showIcon
              icon={!hasInvalid ? <CheckCircleOutlined /> : undefined}
              style={{ marginTop: 16 }}
            />
          )}
        </>
      )}
    </ModalForm>
  );
};

export default PlanCaseImportModal;

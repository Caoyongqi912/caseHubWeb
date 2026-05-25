import { IModuleEnum } from '@/api';
import {
  cancelImportCase,
  commitImportCase,
  uploadPreviewCase,
} from '@/api/case/testCase';
import { CheckCircleOutlined, UploadOutlined } from '@ant-design/icons';
import {
  ModalForm,
  ProForm,
  ProFormSelect,
  ProFormTreeSelect,
  ProFormUploadDragger,
} from '@ant-design/pro-components';
import { Button, Form, notification, Result, Space } from 'antd';
import { FC, useState } from 'react';

interface Props {
  projects: { label: string; value: number }[];
  moduleEnum: IModuleEnum[];
  onProjectChange: (projectId: number) => void;
  onSuccess: () => void;
}

/**
 * 错误详情接口
 */
interface ErrorDetail {
  field: string;
  message: string;
}

/**
 * 错误行接口
 */
interface ErrorRow {
  row: number;
  errors: ErrorDetail[];
}

/**
 * 预校验结果接口（对应 Step 1 响应）
 */
interface ValidateResult {
  file_md5: string;
  total_count: number;
  valid_count: number;
  invalid_count: number;
  errors: ErrorRow[];
}

/**
 * 最终导入结果
 */
interface ImportResult {
  imported_count: number;
}

/**
 * 用例上传弹窗组件
 * 完整三阶段处理：
 * 1. 选择文件 → 上传预览（POST /hub/cases/upload）
 * 2. 点击确认 → 确认入库（POST /hub/cases/upload/commit）
 * 3. 取消上传 → 清理缓存（POST /hub/cases/upload/cancel）
 */
const UploadCaseModal: FC<Props> = ({
  projects,
  moduleEnum,
  onProjectChange,
  onSuccess,
}) => {
  const [uploadForm] = Form.useForm();
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [validateResult, setValidateResult] = useState<ValidateResult | null>(
    null,
  );
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  /**
   * Step 1: 处理文件上传预览
   * POST /hub/cases/upload
   */
  const handleFileChange = async (fileList: any[]) => {
    if (!fileList || fileList.length === 0) {
      setUploadFile(null);
      setValidateResult(null);
      setImportResult(null);
      return;
    }

    const file = fileList[0]?.originFileObj as File;
    if (!file) return;

    setUploadFile(file);
    setValidateResult(null);
    setImportResult(null);
    setUploading(true);

    try {
      const response = (await uploadPreviewCase(file)) as any;

      if (!response) {
        notification.error({
          message: '上传预览失败',
          description: '服务器未返回数据，请重试',
          placement: 'top',
        });
        setUploadFile(null);
        return;
      }

      if (response.code === 200 && response.data) {
        const result: ValidateResult = {
          file_md5: response.data?.file_md5 || '',
          total_count: response.data?.total_count || 0,
          valid_count: response.data?.valid_count || 0,
          invalid_count: response.data?.invalid_count || 0,
          errors: response.data?.errors || [],
        };
        setValidateResult(result);

        if (result.invalid_count > 0) {
          notification.warning({
            message: '上传成功',
            description: `${result.valid_count} 个有效，${result.invalid_count} 个无效`,
            placement: 'top',
            duration: 4,
          });
        } else {
          notification.success({
            message: '上传成功',
            description: `${result.valid_count} 个用例全部有效`,
            placement: 'top',
            duration: 3,
          });
        }
      } else {
        notification.error({
          message: '上传预览失败',
          description: response.msg || '未知错误',
          placement: 'top',
        });
        setUploadFile(null);
      }
    } catch (error: any) {
      console.error('上传预览错误:', error);
      notification.error({
        message: '上传失败',
        description: error?.msg || error?.message || '请重试',
        placement: 'top',
      });
      setUploadFile(null);
    } finally {
      setUploading(false);
    }
  };

  /**
   * Step 2: 确认导入
   * POST /hub/cases/upload/commit
   */
  const handleConfirmImport = async (values: any) => {
    if (!validateResult?.file_md5) {
      notification.warning({
        message: '请先上传文件',
        description: '需要先上传 Excel 文件进行预览',
        placement: 'top',
      });
      return false;
    }

    if (validateResult.valid_count === 0) {
      notification.warning({
        message: '没有有效用例',
        description: '文件中的用例均无效，无法导入',
        placement: 'top',
      });
      return false;
    }

    setConfirming(true);

    try {
      // 生成有效用例的索引列表（0-based）
      const validCaseIds = Array.from(
        { length: validateResult.valid_count },
        (_, i) => i,
      );

      const response = (await commitImportCase({
        file_md5: validateResult.file_md5,
        valid_case_ids: validCaseIds,
        project_id: values.project_id,
        module_id: values.module_id,
        is_common: true,
      })) as any;

      if (!response) {
        notification.error({
          message: '导入失败',
          description: '服务器未返回数据',
          placement: 'top',
        });
        return false;
      }

      if (response.code === 200) {
        const result: ImportResult = {
          imported_count: response.data?.imported_count || 0,
        };
        setImportResult(result);
        uploadForm.resetFields();

        // 使用 notification 代替 message，持续时间更长
        const notificationKey = 'importSuccess';
        notification.success({
          key: notificationKey,
          message: '🎉 导入成功！',
          description: (
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 14 }}>
                成功导入{' '}
                <strong style={{ fontSize: 18, color: '#52c41a' }}>
                  {result.imported_count}
                </strong>{' '}
                个用例
              </div>
            </div>
          ),
          placement: 'top',
          duration: 5,
          style: { width: 320 },
        });

        setTimeout(() => {
          setUploadFile(null);
          setValidateResult(null);
          onSuccess();
        }, 300);

        return true;
      } else {
        notification.error({
          message: '导入失败',
          description: response.msg || '未知错误',
          placement: 'top',
        });
        return false;
      }
    } catch (error: any) {
      console.error('导入错误:', error);
      notification.error({
        message: '导入失败',
        description: error?.msg || error?.message || '请重试',
        placement: 'top',
      });
      return false;
    } finally {
      setConfirming(false);
    }
  };

  /**
   * Step 3: 取消上传（清理缓存）- 暂未使用，预留功能
   * POST /hub/cases/upload/cancel
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _handleCancel = async () => {
    if (!validateResult?.file_md5) return;

    try {
      await cancelImportCase(validateResult.file_md5);
    } catch (error) {
      console.error('取消上传失败:', error);
    }

    setUploadFile(null);
    setValidateResult(null);
    setImportResult(null);
    uploadForm.resetFields();
  };

  /**
   * 获取上传区域描述文本
   */
  const getUploadDescription = () => {
    if (uploading) {
      return '正在上传预览，请稍候...';
    }
    if (uploadFile) {
      return uploadFile.name;
    }
    return '点击或拖拽 Excel 文件到此区域上传';
  };

  /**
   * 格式化错误详情为可读文本
   */
  const formatErrorDetails = (errors: ErrorRow[]): string[] => {
    return errors.map((error) => {
      const errorMessages = error.errors.map((e) => e.message).join('；');
      return `第 ${error.row} 行：${errorMessages}`;
    });
  };

  return (
    <ModalForm
      form={uploadForm}
      trigger={
        <Button key="upload" type="primary">
          <UploadOutlined />
          上传
        </Button>
      }
      title="上传用例"
      onFinish={handleConfirmImport}
      submitter={{
        searchConfig: {
          submitText: '确认导入',
          resetText: '取消',
        },
        submitButtonProps: {
          disabled: !validateResult || validateResult.valid_count === 0,
          loading: confirming,
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
            onChange: (value) => {
              onProjectChange(value as number);
            },
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
            fieldNames: {
              label: 'title',
              value: 'value',
            },
            filterTreeNode: true,
          }}
        />
      </ProForm.Group>

      <ProFormUploadDragger
        title={false}
        max={1}
        description={getUploadDescription()}
        width="md"
        accept=".xlsx,.xls"
        name="file"
        fieldProps={{
          accept: '.xlsx,.xls',
          beforeUpload: (file) => {
            handleFileChange([{ originFileObj: file }]);
            return false;
          },
          showUploadList: false,
        }}
        formItemProps={{
          validateStatus: uploading ? 'validating' : undefined,
          help: uploading ? '正在上传预览，请稍候...' : undefined,
        }}
      />

      {validateResult && (
        <div
          style={{
            marginTop: 16,
            padding: '12px 16px',
            background:
              validateResult.invalid_count > 0 ? '#fffbe6' : '#f6ffed',
            borderRadius: 8,
            border: `1px solid ${
              validateResult.invalid_count > 0 ? '#ffe58f' : '#b7eb8f'
            }`,
          }}
        >
          <div style={{ marginBottom: 8, fontWeight: 500 }}>预览结果</div>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            <div>
              总行数：
              <span style={{ fontWeight: 600 }}>
                {validateResult.total_count}
              </span>
            </div>
            <div style={{ color: '#52c41a' }}>
              有效用例：
              <span style={{ fontWeight: 600 }}>
                {validateResult.valid_count}
              </span>
            </div>
            {validateResult.invalid_count > 0 && (
              <div style={{ color: '#ff4d4f' }}>
                无效行数：
                <span style={{ fontWeight: 600 }}>
                  {validateResult.invalid_count}
                </span>
              </div>
            )}
          </div>

          {validateResult.errors.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div style={{ color: '#faad14', marginBottom: 4, fontSize: 12 }}>
                错误详情（仅展示前 10 条）：
              </div>
              <div
                style={{
                  maxHeight: 120,
                  overflowY: 'auto',
                  fontSize: 12,
                  color: '#ff4d4f',
                  wordBreak: 'break-word',
                }}
              >
                {formatErrorDetails(validateResult.errors.slice(0, 10)).map(
                  (err, index) => (
                    <div key={index}>{err}</div>
                  ),
                )}
                {validateResult.errors.length > 10 && (
                  <div style={{ color: '#999', marginTop: 4 }}>
                    ... 还有 {validateResult.errors.length - 10} 条错误
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {importResult && (
        <Result
          status="success"
          title="导入成功！"
          subTitle={`成功导入 ${importResult.imported_count} 个用例`}
          icon={
            <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 64 }} />
          }
          extra={
            <Space>
              <div style={{ color: '#52c41a', fontSize: 14 }}>
                ✅ 数据已保存到数据库
              </div>
            </Space>
          }
        />
      )}
    </ModalForm>
  );
};

export default UploadCaseModal;

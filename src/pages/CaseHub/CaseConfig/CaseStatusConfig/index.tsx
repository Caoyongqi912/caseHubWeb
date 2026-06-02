/**
 * @file src/pages/CaseHub/CaseConfig/CaseStatusConfig/index.tsx
 * @description 通用枚举配置 CRUD 页面（用例状态、评审状态等共用）
 * 通过 configKey 区分不同枚举类型，使用同一张配置表，便于扩展
 */

import {
  addCaseEnumConfig,
  pageCaseEnumConfig,
  removeCaseEnumConfig,
  updateCaseEnumConfig,
} from '@/api/case/caseConfig';
import {
  CaseConfigKeyEnum,
  ICaseEnumConfig,
} from '@/pages/CaseHub/CaseConfig/types';
import { useCaseHubTheme } from '@/pages/CaseHub/styles';
import { pageData } from '@/utils/somefunc';
import {
  ClockCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import {
  ActionType,
  ModalForm,
  ProCard,
  ProColumns,
  ProFormColorPicker,
  ProFormDigit,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
  ProTable,
} from '@ant-design/pro-components';
import { Button, Form, message, Modal, Space, Tag, Typography } from 'antd';
import { FC, useCallback, useMemo, useRef, useState } from 'react';

const { Text, Paragraph } = Typography;

interface CaseStatusConfigProps {
  /** 当前 Tab 对应的枚举类型，对应 ICaseEnumConfig.config_key */
  configKey: string;
  /** 当前 Tab 标题，用于头部展示 */
  title: string;
  /** 当前 Tab 描述 */
  description: string;
}

const CaseStatusConfig: FC<CaseStatusConfigProps> = ({
  configKey,
  title,
  description,
}) => {
  const { token, colors, spacing, borderRadius } = useCaseHubTheme();
  const [form] = Form.useForm<ICaseEnumConfig>();
  const actionRef = useRef<ActionType>();
  const [openModal, setOpenModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ICaseEnumConfig | null>(
    null,
  );
  const isEdit = editingRecord !== null;

  /**
   * value 字段类型派生
   * - 用例等级（CASE_LEVEL）：value 与 label 一致为字符串（如 P1 / P2），使用文本输入
   * - 其他枚举（用例状态 / 评审状态）：value 沿用数字，与现有 CASE_STATUS_OPTIONS 保持一致
   */
  const isStringValue = configKey === CaseConfigKeyEnum.CASE_LEVEL;

  /**
   * 颜色字段标准化
   * 背景：ProFormColorPicker 的 onChange 返回 antd Color 对象（含 cleared / metaColor / rgb 等），
   *       后端只接受字符串（antd 预设名如 "success" / "processing" 或 hex 如 "#1677ff"）。
   * 转换规则：
   *   - 空 / undefined / 空串  → undefined
   *   - 字符串（预设名 / hex）  → 原样返回
   *   - Color 对象 cleared=true → undefined（表示用户清除了选择）
   *   - Color 对象             → toHexString() 转为 hex
   */
  const normalizeColor = useCallback((raw: unknown): string | undefined => {
    if (raw == null || raw === '') return undefined;
    if (typeof raw === 'string') return raw;
    const colorLike = raw as { cleared?: boolean; toHexString?: () => string };
    if (colorLike.cleared) return undefined;
    if (typeof colorLike.toHexString === 'function') {
      return colorLike.toHexString();
    }
    return undefined;
  }, []);

  /**
   * 通用分页查询：根据 configKey 拉取对应枚举
   */
  const pageConfig = useCallback(
    async (values: any, sort: any) => {
      const { code, data } = await pageCaseEnumConfig({
        ...values,
        sort,
        config_key: configKey,
      });
      return pageData(code, data);
    },
    [configKey],
  );

  /**
   * 将 color 字段应用到 antd Tag 上
   * 约定：
   *   - 预设值：success / processing / error / warning / default 等直接传入 color
   *   - 自定义：按 hex 渲染为带边框的胶囊
   */
  const renderStatusTag = useCallback((label: string, color?: string) => {
    const presetList = [
      'success',
      'processing',
      'error',
      'warning',
      'default',
      'magenta',
      'red',
      'volcano',
      'orange',
      'gold',
      'lime',
      'green',
      'cyan',
      'blue',
      'geekblue',
      'purple',
    ];
    if (!color) {
      return <Tag>{label}</Tag>;
    }
    if (presetList.includes(color)) {
      return <Tag color={color}>{label}</Tag>;
    }
    return (
      <Tag
        style={{
          backgroundColor: `${color}1a`,
          color,
          borderColor: `${color}66`,
          fontWeight: 500,
        }}
      >
        {label}
      </Tag>
    );
  }, []);

  const styles = useMemo(
    () => ({
      headerWrap: {
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: spacing.lg,
        marginBottom: spacing.lg,
        flexWrap: 'wrap' as const,
      },
      headerInfo: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: spacing.xs,
        flex: 1,
        minWidth: 280,
      },
      headerTitle: {
        display: 'flex',
        alignItems: 'center',
        gap: spacing.sm,
        fontSize: 18,
        fontWeight: 600,
        color: token.colorText,
      },
      headerDesc: {
        color: token.colorTextSecondary,
        fontSize: 13,
        lineHeight: 1.6,
        margin: 0,
      },
      valueTag: {
        fontFamily: '"SF Mono", "Fira Code", "JetBrains Mono", monospace',
        fontSize: 12,
        fontWeight: 600,
        padding: '4px 10px',
        borderRadius: borderRadius.md,
        background: `linear-gradient(135deg, ${token.colorPrimaryBg} 0%, ${token.colorPrimaryBorder} 100%)`,
        color: token.colorPrimary,
        border: `1px solid ${token.colorPrimaryBorder}`,
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)',
      },
      sortTag: {
        fontFamily: '"SF Mono", "Fira Code", "JetBrains Mono", monospace',
        fontSize: 12,
        fontWeight: 500,
        padding: '2px 8px',
        borderRadius: borderRadius.sm,
        backgroundColor: token.colorFillAlter,
        color: token.colorTextSecondary,
      },
      colorSwatch: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '2px 8px 2px 2px',
        borderRadius: borderRadius.sm,
        backgroundColor: token.colorFillAlter,
        border: `1px solid ${token.colorBorderSecondary}`,
      },
      colorDot: {
        width: 18,
        height: 18,
        borderRadius: 4,
        boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.06)',
      },
      colorHex: {
        fontFamily: '"SF Mono", "Fira Code", "JetBrains Mono", monospace',
        fontSize: 12,
        color: token.colorTextSecondary,
      },
      activeDot: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 12,
        color: token.colorSuccess,
        fontWeight: 500,
      },
      disabledDot: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 12,
        color: token.colorTextTertiary,
        fontWeight: 500,
      },
      addBtn: {
        height: 38,
        borderRadius: borderRadius.lg,
        fontWeight: 500,
        padding: '0 18px',
        boxShadow: `0 2px 8px ${token.colorPrimaryBg}`,
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      },
      actionBtn: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '4px 10px',
        borderRadius: borderRadius.md,
        fontSize: 13,
        fontWeight: 500,
        transition: 'all 0.2s ease',
        cursor: 'pointer',
      },
      primaryBtn: {
        color: token.colorPrimary,
        backgroundColor: token.colorPrimaryBg,
      },
      dangerBtn: {
        color: token.colorError,
        backgroundColor: token.colorErrorBg,
      },
      metaCell: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: 2,
        fontSize: 12,
        lineHeight: 1.5,
      },
      metaPrimary: {
        color: token.colorText,
        fontWeight: 500,
      },
      metaSecondary: {
        color: token.colorTextTertiary,
      },
    }),
    [token, spacing, borderRadius],
  );

  const columns: ProColumns<ICaseEnumConfig>[] = useMemo(
    () => [
      {
        title: '名称',
        dataIndex: 'label',
        fixed: 'left',
        width: 180,
        render: (_, record) => renderStatusTag(record.label, record.color),
      },
      {
        title: '值',
        dataIndex: 'value',
        width: 110,
        render: (_, record) => (
          <Text code style={styles.valueTag}>
            {String(record.value)}
          </Text>
        ),
      },
      {
        title: '颜色',
        dataIndex: 'color',
        width: 160,
        render: (_, record) => {
          if (!record.color) {
            return <Text type="secondary">-</Text>;
          }
          return (
            <span style={styles.colorSwatch}>
              <span
                style={{
                  ...styles.colorDot,
                  background: record.color,
                }}
              />
              <span style={styles.colorHex}>{record.color}</span>
            </span>
          );
        },
      },
      {
        title: '描述',
        dataIndex: 'description',
        width: 260,
        render: (_, record) => (
          <Paragraph
            ellipsis={{ rows: 2, expandable: true, symbol: '展开' }}
            style={{
              margin: 0,
              color: token.colorTextSecondary,
              fontSize: 13,
            }}
          >
            {record.description || '-'}
          </Paragraph>
        ),
      },
      {
        title: '排序',
        dataIndex: 'sort',
        width: 80,
        render: (_, record) =>
          record.sort === undefined || record.sort === null ? (
            <Text type="secondary">-</Text>
          ) : (
            <Text style={styles.sortTag}>{record.sort}</Text>
          ),
      },
      {
        title: '启用',
        dataIndex: 'enabled',
        width: 90,
        render: (_, record) =>
          record.enabled === false ? (
            <span style={styles.disabledDot}>
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  backgroundColor: token.colorTextTertiary,
                }}
              />
              已停用
            </span>
          ) : (
            <span style={styles.activeDot}>
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  backgroundColor: token.colorSuccess,
                  boxShadow: `0 0 6px ${token.colorSuccess}80`,
                }}
              />
              已启用
            </span>
          ),
      },
      {
        title: '创建信息',
        dataIndex: 'create_time',
        width: 170,
        hideInSearch: true,
        render: (_, record) => (
          <div style={styles.metaCell}>
            <span style={styles.metaPrimary}>{record.creatorName || '-'}</span>
            <span style={styles.metaSecondary}>
              {record.create_time || '-'}
            </span>
          </div>
        ),
      },
      {
        title: '操作',
        valueType: 'option',
        key: 'option',
        fixed: 'right',
        width: 150,
        render: (_, record) => (
          <Space size={4}>
            <a
              style={{ ...styles.actionBtn, ...styles.primaryBtn }}
              onClick={() => {
                setEditingRecord(record);
                form.setFieldsValue({
                  ...record,
                  // 字符串值类型（如 CASE_LEVEL）不做 Number 强转，
                  // 否则会把 "P1" 错误地变为 NaN
                  value: isStringValue
                    ? record.value
                    : typeof record.value === 'string'
                    ? Number(record.value)
                    : record.value,
                } as ICaseEnumConfig);
                setOpenModal(true);
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = `0 2px 8px ${token.colorPrimaryBg}`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <EditOutlined />
              编辑
            </a>
            <a
              style={{ ...styles.actionBtn, ...styles.dangerBtn }}
              onClick={() => {
                Modal.confirm({
                  title: '确认删除',
                  content: `确定要删除「${record.label}」吗？删除后无法恢复。`,
                  okText: '确认',
                  cancelText: '取消',
                  okButtonProps: { danger: true },
                  onOk: async () => {
                    const { code, msg } = await removeCaseEnumConfig({
                      uid: record.uid,
                    });
                    if (code === 0) {
                      message.success(msg || '删除成功');
                      actionRef.current?.reload();
                    }
                  },
                });
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = `0 2px 8px ${token.colorErrorBg}`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <DeleteOutlined />
              删除
            </a>
          </Space>
        ),
      },
    ],
    [token, styles, renderStatusTag, form],
  );

  /**
   * 打开新增弹窗
   */
  const handleOpenAdd = useCallback(() => {
    setEditingRecord(null);
    form.resetFields();
    form.setFieldsValue({
      enabled: true,
      sort: 0,
      config_key: configKey,
    } as Partial<ICaseEnumConfig>);
    setOpenModal(true);
  }, [form, configKey]);

  /**
   * 关闭弹窗
   */
  const handleOpenChange = useCallback(
    (open: boolean) => {
      setOpenModal(open);
      if (!open) {
        setEditingRecord(null);
        form.resetFields();
      }
    },
    [form],
  );

  /**
   * 提交表单（新增 / 更新）
   */
  const handleFinish = useCallback(
    async (values: ICaseEnumConfig) => {
      const payload: Partial<ICaseEnumConfig> = {
        ...values,
        config_key: configKey,
        // ProFormColorPicker 提交的是 Color 对象，标准化为字符串给后端
        color: normalizeColor((values as unknown as { color?: unknown }).color),
      };
      if (isEdit && editingRecord?.uid) {
        payload.uid = editingRecord.uid;
        const { code, msg } = await updateCaseEnumConfig(payload);
        if (code === 0) {
          message.success(msg || '更新成功');
          actionRef.current?.reload();
          setOpenModal(false);
          setEditingRecord(null);
        }
      } else {
        const { code, msg } = await addCaseEnumConfig(payload);
        if (code === 0) {
          message.success(msg || '新增成功');
          actionRef.current?.reload();
          setOpenModal(false);
        }
      }
    },
    [isEdit, editingRecord, configKey],
  );

  return (
    <ProCard
      variant="outlined"
      style={{
        background: colors.bgContainer,
        borderRadius: borderRadius.xl,
      }}
    >
      <div style={styles.headerWrap}>
        <div style={styles.headerInfo}>
          <div style={styles.headerTitle}>
            <ClockCircleOutlined
              style={{ color: token.colorPrimary, fontSize: 18 }}
            />
            {title}
            <Text
              style={{
                fontSize: 12,
                color: token.colorTextTertiary,
                fontWeight: 400,
                marginLeft: 4,
              }}
            >
              （{configKey}）
            </Text>
          </div>
          <p style={styles.headerDesc}>{description}</p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleOpenAdd}
          style={styles.addBtn}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = `0 6px 16px ${token.colorPrimaryBg}`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = `0 2px 8px ${token.colorPrimaryBg}`;
          }}
        >
          新增配置
        </Button>
      </div>

      <ModalForm<ICaseEnumConfig>
        form={form}
        open={openModal}
        onOpenChange={handleOpenChange}
        onFinish={handleFinish}
        title={
          <span style={{ fontWeight: 600 }}>
            <SettingOutlined style={{ marginRight: 8 }} />
            {isEdit ? '编辑配置' : '新增配置'}
          </span>
        }
        width={560}
        layout="vertical"
        modalProps={{
          destroyOnClose: true,
          okText: isEdit ? '保存' : '创建',
          cancelText: '取消',
        }}
      >
        <ProFormText
          name="label"
          label="名称"
          required
          rules={[
            { required: true, message: '名称必填' },
            { max: 32, message: '名称长度不能超过 32' },
          ]}
          placeholder="请输入显示名称，如：通过"
        />
        {isStringValue ? (
          <ProFormText
            name="value"
            label="值（等级标识）"
            required
            rules={[
              { required: true, message: '等级标识必填' },
              { max: 32, message: '等级标识长度不能超过 32' },
            ]}
            placeholder="请输入等级标识，如 P1 / P2"
            tooltip="等级场景下 value 与 label 一致，便于筛选与展示"
          />
        ) : (
          <ProFormDigit
            name="value"
            label="值（枚举值）"
            required
            rules={[{ required: true, message: '枚举值必填' }]}
            placeholder="请输入枚举值，建议为整数"
            min={0}
            fieldProps={{ precision: 0 }}
          />
        )}
        <ProFormColorPicker
          name="color"
          label="颜色"
          placeholder="请选择主题色（可选）"
          allowClear
          presets={[
            {
              label: '推荐',
              colors: [
                '#1677ff',
                '#52c41a',
                '#faad14',
                '#ff4d4f',
                '#722ed1',
                '#13c2c2',
                '#fa8c16',
                '#eb2f96',
                '#8c8c8c',
              ],
            },
          ]}
        />
        <ProFormTextArea
          name="description"
          label="描述"
          placeholder="请输入描述信息（可选）"
          rules={[{ max: 200, message: '描述长度不能超过 200' }]}
          fieldProps={{ rows: 3, maxLength: 200, showCount: true }}
        />
        <Space size="large" style={{ width: '100%' }}>
          <ProFormDigit
            name="sort"
            label="排序"
            placeholder="升序排序"
            min={0}
            fieldProps={{ precision: 0, style: { width: 200 } }}
          />
          <ProFormSwitch
            name="enabled"
            label="启用"
            checkedChildren="已启用"
            unCheckedChildren="已停用"
            initialValue={true}
          />
        </Space>
      </ModalForm>

      <ProTable<ICaseEnumConfig>
        actionRef={actionRef}
        columns={columns}
        request={pageConfig}
        rowKey="uid"
        headerTitle={null}
        search={{
          labelWidth: 'auto',
          showHiddenNum: true,
        }}
        toolBarRender={false}
        dateFormatter="string"
      />
    </ProCard>
  );
};

export default CaseStatusConfig;

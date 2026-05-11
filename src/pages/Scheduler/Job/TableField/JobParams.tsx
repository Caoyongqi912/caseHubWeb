import { updateApsJob } from '@/api/base/aps';
import AceCodeEditor from '@/components/CodeEditor/AceCodeEditor';
import { IJob } from '@/pages/Project/types';
import {
  CodeOutlined,
  EditOutlined,
  SettingOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { Button, message, Modal, Radio, theme, Typography } from 'antd';
import { FC, ReactNode, useMemo, useRef, useState } from 'react';

const { Text } = Typography;
const { useToken } = theme;

interface Props {
  text: ReactNode;
  record: IJob;
  callback: () => void;
}

const JobParams: FC<Props> = ({ text, record, callback }) => {
  const { token } = useToken();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [showError, setShowError] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'editor'>('list');
  const timeoutRef = useRef<any>(null);

  const params = useMemo(() => {
    try {
      let data = text;
      if (typeof data === 'string' && data.trim()) {
        data = JSON.parse(data);
      }
      return data;
    } catch {
      return null;
    }
  }, [text]);

  const paramsList = useMemo(() => {
    if (!params) return [];
    if (Array.isArray(params)) {
      return params
        .filter(
          (item: any) => item && typeof item === 'object' && 'key' in item,
        )
        .map((item: any) => ({
          key: String(item.key ?? ''),
          value: item.value,
        }));
    }
    if (typeof params === 'object') {
      return Object.entries(params).map(([key, value]) => ({ key, value }));
    }
    return [];
  }, [params]);

  const paramsCount = paramsList.length;

  const styles = useMemo(
    () => ({
      container: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '4px 8px',
        borderRadius: 8,
        background: hovered ? token.colorPrimaryBg : 'transparent',
        cursor: 'pointer',
        transition: 'all 0.2s',
      },
      iconBox: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 28,
        height: 28,
        borderRadius: 8,
        background: 'linear-gradient(135deg, #722ed1 0%, #9254de 100%)',
        boxShadow: '0 2px 8px rgba(114, 46, 209, 0.35)',
        flexShrink: 0,
      },
      contentBox: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
      },
      label: {
        fontSize: 12,
        color: token.colorTextSecondary,
        fontWeight: 500,
      },
      countBadge: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 20,
        height: 20,
        padding: '0 6px',
        borderRadius: 10,
        background: 'linear-gradient(135deg, #722ed1 0%, #9254de 100%)',
        color: '#fff',
        fontSize: 11,
        fontWeight: 600,
      },
      emptyBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '4px 10px',
        borderRadius: 8,
        background: hovered ? token.colorPrimaryBg : token.colorFillAlter,
        border: `1px dashed ${token.colorBorderSecondary}`,
        cursor: 'pointer',
        transition: 'all 0.2s',
      },
      emptyIcon: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 24,
        height: 24,
        borderRadius: 6,
        background: token.colorFillSecondary,
      },
      emptyText: {
        fontSize: 12,
        color: token.colorTextSecondary,
      },
      modalContent: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: 16,
        minHeight: 400,
      },
      listContainer: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column' as const,
        gap: 8,
      },
      listTitle: {
        fontSize: 14,
        fontWeight: 600,
        color: token.colorText,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      },
      listCount: {
        padding: '4px 12px',
        borderRadius: 6,
        background: 'linear-gradient(135deg, #722ed1 0%, #531dab 100%)',
        color: '#fff',
        fontSize: 12,
        fontWeight: 600,
      },
      paramRow: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 12px',
        borderRadius: 6,
        background: token.colorBgContainer,
        border: `1px solid ${token.colorBorderSecondary}`,
      },
      paramIndex: {
        width: 24,
        height: 24,
        borderRadius: 6,
        background: 'linear-gradient(135deg, #722ed1 0%, #531dab 100%)',
        color: '#fff',
        fontSize: 12,
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      },
      paramContent: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        fontSize: 13,
      },
      paramKeyBox: {
        padding: '4px 12px',
        borderRadius: 6,
        background: token.colorFillAlter,
        border: `1px solid ${token.colorBorderSecondary}`,
        color: '#722ed1',
        fontSize: 13,
        fontWeight: 600,
        fontFamily: 'monospace',
      },
      paramValueBox: {
        flex: 1,
        padding: '4px 12px',
        borderRadius: 6,
        background: token.colorFillAlter,
        border: `1px solid ${token.colorBorderSecondary}`,
        color: token.colorText,
        fontSize: 13,
        fontFamily: 'monospace',
      },
      editorContainer: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column' as const,
      },
      editorHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        background: token.colorFillAlter,
        borderRadius: 8,
        border: `1px solid ${token.colorBorderSecondary}`,
      },
      viewToggle: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      },
      viewToggleLabel: {
        fontSize: 13,
        color: token.colorText,
      },
    }),
    [token, hovered],
  );

  const handleOpenModal = (editMode: boolean = false) => {
    setIsModalOpen(true);
    setIsEditMode(editMode);
    if (editMode) {
      setEditValue(params ? JSON.stringify(params, null, 2) : '[]');
    }
  };

  const validateParamsFormat = (data: any): boolean => {
    if (!Array.isArray(data)) return false;
    return data.every(
      (item) =>
        item &&
        typeof item === 'object' &&
        'key' in item &&
        'value' in item &&
        typeof item.key === 'string',
    );
  };

  const handleSaveEdit = async () => {
    clearTimeout(timeoutRef.current);
    try {
      const parsedValue = JSON.parse(editValue);
      if (!validateParamsFormat(parsedValue)) {
        message.error(
          '格式错误：必须是 [{key: "参数名", value: "参数值"}, ...] 格式',
        );
        return;
      }
      const { code } = await updateApsJob({
        job_kwargs: parsedValue,
        uid: record.uid,
      } as any);
      if (code === 0) {
        setIsEditMode(false);
        setIsModalOpen(false);
        setShowError(false);
        message.success('保存成功');
        callback();
      }
    } catch {
      setShowError(true);
      timeoutRef.current = setTimeout(() => setShowError(false), 3000);
    }
  };

  const renderParamList = () => {
    if (!paramsList.length) return null;
    return paramsList.map((item, index) => (
      <div key={index} style={styles.paramRow}>
        <div style={styles.paramIndex}>{index + 1}</div>
        <div style={styles.paramContent}>
          <div style={styles.paramKeyBox}>{item.key}</div>
          <div style={styles.paramValueBox}>{String(item.value)}</div>
        </div>
      </div>
    ));
  };

  if (paramsCount === 0) {
    return (
      <>
        <div
          style={styles.emptyBtn}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleOpenModal(true);
          }}
        >
          <div style={styles.emptyIcon}>
            <CodeOutlined
              style={{ fontSize: 11, color: token.colorTextSecondary }}
            />
          </div>
          <span style={styles.emptyText}>无参数</span>
          <EditOutlined
            style={{
              fontSize: 10,
              color: token.colorTextSecondary,
              marginLeft: 'auto',
            }}
          />
        </div>

        <Modal
          title="参数配置"
          open={isModalOpen}
          onCancel={() => {
            setIsModalOpen(false);
            setIsEditMode(false);
            setShowError(false);
          }}
          footer={[
            <Button
              key="cancel"
              onClick={() => {
                setIsModalOpen(false);
                setShowError(false);
              }}
            >
              取消
            </Button>,
            <Button key="save" type="primary" onClick={handleSaveEdit}>
              保存
            </Button>,
          ]}
          width={800}
          destroyOnHidden
        >
          <div style={styles.modalContent}>
            <div style={styles.editorHeader}>
              <div style={styles.listTitle}>
                <CodeOutlined
                  style={{ fontSize: 14, color: token.colorPrimary }}
                />
                <span>JSON 编辑器</span>
              </div>
            </div>
            {showError && (
              <div
                style={{
                  color: '#ff4d4f',
                  padding: 8,
                  background: '#fff2f0',
                  borderRadius: 4,
                  fontSize: 13,
                }}
              >
                JSON格式错误，请检查语法
              </div>
            )}
            <Text
              type="secondary"
              style={{ marginBottom: 8, display: 'block' }}
            >
              格式要求：[&#123;"key": "参数名", "value": "参数值"&#125;]
            </Text>
            <AceCodeEditor
              readonly={false}
              _mode="json"
              value={editValue}
              onChange={(value) => {
                setEditValue(value);
                setShowError(false);
              }}
              height="350px"
            />
          </div>
        </Modal>
      </>
    );
  }

  return (
    <>
      <div
        style={styles.container}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleOpenModal(false);
        }}
      >
        <div style={styles.iconBox}>
          <SettingOutlined style={{ fontSize: 13, color: '#fff' }} />
        </div>
        <div style={styles.contentBox}>
          <span style={styles.label}>参数 x</span>
          <span style={styles.countBadge}>{paramsCount}</span>
        </div>
      </div>

      <Modal
        title="参数详情"
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setIsEditMode(false);
          setShowError(false);
        }}
        footer={
          isEditMode
            ? [
                <Button
                  key="cancel"
                  onClick={() => {
                    setIsEditMode(false);
                    setShowError(false);
                  }}
                >
                  取消
                </Button>,
                <Button key="save" type="primary" onClick={handleSaveEdit}>
                  保存
                </Button>,
              ]
            : [
                <Button key="close" onClick={() => setIsModalOpen(false)}>
                  关闭
                </Button>,
                <Button
                  key="edit"
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => {
                    setEditValue(JSON.stringify(params, null, 2));
                    setIsEditMode(true);
                  }}
                >
                  编辑
                </Button>,
              ]
        }
        width={800}
        destroyOnHidden
      >
        <div style={styles.modalContent}>
          <div style={styles.editorHeader}>
            <div style={styles.listTitle}>
              {viewMode === 'list' ? (
                <UnorderedListOutlined
                  style={{ fontSize: 14, color: token.colorPrimary }}
                />
              ) : (
                <CodeOutlined
                  style={{ fontSize: 14, color: token.colorPrimary }}
                />
              )}
              <span>{viewMode === 'list' ? '参数列表' : 'JSON 编辑器'}</span>
            </div>
            <div style={styles.viewToggle}>
              <span style={styles.viewToggleLabel}>视图：</span>
              <Radio.Group
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value)}
                optionType="button"
                buttonStyle="solid"
                size="small"
              >
                <Radio.Button value="list">列表</Radio.Button>
                <Radio.Button value="editor">编辑器</Radio.Button>
              </Radio.Group>
              {viewMode === 'list' && (
                <span style={styles.listCount}>{paramsCount}</span>
              )}
            </div>
          </div>

          {viewMode === 'list' ? (
            <div style={styles.listContainer}>{renderParamList()}</div>
          ) : (
            <div style={styles.editorContainer}>
              {showError && (
                <div
                  style={{
                    color: '#ff4d4f',
                    marginBottom: 8,
                    padding: 8,
                    background: '#fff2f0',
                    borderRadius: 4,
                    fontSize: 13,
                  }}
                >
                  JSON格式错误，请检查语法
                </div>
              )}
              {!showError && !isEditMode && (
                <Text
                  type="secondary"
                  style={{ marginBottom: 8, display: 'block' }}
                >
                  格式要求：[&#123;"key": "参数名", "value": "参数值"&#125;]
                </Text>
              )}
              <AceCodeEditor
                readonly={!isEditMode}
                _mode="json"
                value={isEditMode ? editValue : JSON.stringify(params, null, 2)}
                onChange={(value) => {
                  setEditValue(value);
                  setShowError(false);
                }}
                height="350px"
              />
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

export default JobParams;

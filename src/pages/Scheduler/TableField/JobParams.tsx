import { update_aps_job } from '@/api/base/aps';
import AceCodeEditor from '@/components/CodeEditor/AceCodeEditor';
import { IJob } from '@/pages/Project/types';
import { EditOutlined, EyeOutlined, SettingOutlined } from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import {
  Button,
  Col,
  message,
  Modal,
  Row,
  Space,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import { FC, ReactNode, useMemo, useRef, useState } from 'react';

const { Text, Link } = Typography;

interface Props {
  text: ReactNode;
  record: IJob;
  callback: () => void;
}

const JobParams: FC<Props> = ({ text, record, callback }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editable, setEditable] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [showError, setShowError] = useState(false);
  const timeoutRef = useRef<any>(null);

  // 解析参数数据
  const params = useMemo(() => {
    try {
      let data = text;
      if (typeof data === 'string' && data.trim()) {
        data = JSON.parse(data);
      }
      return data;
    } catch (error) {
      return null;
    }
  }, [text]);

  const getParamsInfo = useMemo(() => {
    if (!params) {
      return {
        type: 'empty' as const,
        count: 0,
        hasMore: false,
      };
    }

    // 判断类型和数量
    const isArray = Array.isArray(params);
    const totalCount = isArray ? params.length : Object.keys(params).length;

    // 判断是否为键值对格式
    let isKeyValue = false;
    if (isArray && params.length > 0) {
      const firstItem = params[0];
      isKeyValue =
        firstItem?.key !== undefined && firstItem?.value !== undefined;
    }

    return {
      type: isKeyValue ? 'keyValue' : isArray ? 'array' : 'object',
      count: totalCount,
      hasMore: totalCount > 3,
      isKeyValue,
      isObject: !isArray,
    };
  }, [params]);
  // 获取参数数量
  const paramCount = useMemo(() => {
    if (!params) return '0 个参数';
    if (Array.isArray(params)) return `${params.length} 个参数`;
    if (typeof params === 'object')
      return `${Object.keys(params).length} 个参数`;
    return '0 个参数';
  }, [params]);

  // 格式化显示的文本（截断过长文本）
  const formatText = (text: any, maxLength = 15) => {
    const str = String(text);
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength) + '...';
  };

  // 获取前3行数据
  const firstParams = useMemo(() => {
    if (!params) return [];
    if (Array.isArray(params)) {
      return params.slice(0, 3);
    }
    if (typeof params === 'object') {
      return Object.entries(params).slice(0, 3);
    }
    return [];
  }, [params]);

  // 是否有更多数据
  const hasMoreData = useMemo(() => {
    if (!params) return false;
    if (Array.isArray(params)) return params.length > 3;
    if (typeof params === 'object') return Object.keys(params).length > 3;
    return false;
  }, [params]);

  // 渲染键值对项
  const renderKeyValueItem = (item: any, index: number) => {
    const keyText = formatText(item.key, 6);
    const valueText = formatText(item.value, 12);

    return (
      <Row
        key={index}
        align="middle"
        style={{
          padding: '1px 0',
          minHeight: '20px',
          fontSize: '11px',
          width: '100%',
        }}
      >
        {/* Key列 - 固定宽度 */}
        <Col
          flex="80px"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            overflow: 'hidden',
          }}
        >
          <Tooltip title={item.key}>
            <Tag
              color="purple"
              style={{
                margin: 0,
                width: '100%',
                fontSize: '10px',
                height: '18px',
                lineHeight: '16px',
                padding: '0 4px',
                overflow: 'hidden',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  width: '100%',
                  textAlign: 'center',
                }}
              >
                {keyText}
              </span>
            </Tag>
          </Tooltip>
          <span
            style={{
              color: '#bfbfbf',
              flexShrink: 0,
            }}
          >
            :
          </span>
        </Col>

        {/* Value列 - 自适应宽度 */}
        <Col
          flex="auto"
          style={{
            overflow: 'hidden',
            paddingLeft: '4px',
          }}
        >
          <Tooltip title={item.value}>
            <Text
              ellipsis={{ tooltip: item.value }}
              style={{
                display: 'block',
                margin: 0,
                fontSize: '11px',
                lineHeight: '18px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {valueText}
            </Text>
          </Tooltip>
        </Col>
      </Row>
    );
  };
  // 渲染对象键值对
  const renderObjectItem = ([key, value]: [string, any], index: number) => {
    const keyText = formatText(key, 12);
    const valueText = formatText(value, 30);

    return (
      <Row
        key={index}
        align="middle"
        gutter={[4, 0]}
        style={{
          padding: '1px 0',
          minHeight: '20px',
          fontSize: '11px',
        }}
      >
        <Col
          flex="none"
          style={{
            display: 'flex',
            alignItems: 'center',
            height: '18px',
          }}
        >
          <Tooltip title={key}>
            <Tag
              color="blue"
              style={{
                margin: 0,
                maxWidth: '80px',
                fontSize: '10px',
                height: '18px',
                lineHeight: '16px',
                padding: '0 4px',
                overflow: 'hidden',
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '70px',
                }}
              >
                {keyText}
              </span>
            </Tag>
          </Tooltip>
          <span
            style={{
              margin: '0 4px',
              color: '#bfbfbf',
              flexShrink: 0,
            }}
          >
            :
          </span>
        </Col>
        <Col flex="auto" style={{ overflow: 'hidden' }}>
          <Tooltip title={value}>
            <Text
              ellipsis={{ tooltip: value }}
              style={{
                display: 'block',
                margin: 0,
                fontSize: '11px',
                lineHeight: '18px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {valueText}
            </Text>
          </Tooltip>
        </Col>
      </Row>
    );
  };
  const renderSimpleItem = (item: any, index: number) => {
    const text = formatText(item, 30);

    return (
      <div
        key={index}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '1px 0',
          minHeight: '20px',
          fontSize: '11px',
        }}
      >
        <Tooltip title={item}>
          <Text
            ellipsis={{ tooltip: item }}
            style={{
              margin: 0,
              fontSize: '11px',
              lineHeight: '18px',
              paddingLeft: '20px', // 为了对齐，添加左边距
              flex: 1,
              wordBreak: 'break-all',
            }}
          >
            {text}
          </Text>
        </Tooltip>
      </div>
    );
  };
  // 渲染前三行数据
  const renderFirstThree = () => {
    if (!firstParams.length) return null;
    const { type } = getParamsInfo;

    return (
      <ProCard size={'small'}>
        {firstParams.map((item, index) => {
          console.log('=====', type);
          switch (type) {
            case 'keyValue':
              return renderKeyValueItem(item, index);
            case 'object':
              return renderObjectItem(item as [string, any], index);
            default:
              return renderSimpleItem(item, index);
          }
        })}

        {getParamsInfo.hasMore && (
          <div
            style={{
              padding: '2px 0',
              fontSize: '10px',
              color: '#8c8c8c',
              textAlign: 'center',
            }}
          >
            ...还有{getParamsInfo.count - 3}个参数
          </div>
        )}
      </ProCard>
    );
  };

  // 处理保存编辑
  const handleSaveEdit = async () => {
    clearTimeout(timeoutRef.current);

    try {
      const parsedValue = JSON.parse(editValue);
      // @ts-ignore
      const { code } = await update_aps_job({
        job_kwargs: parsedValue,
        uid: record.uid,
      });
      if (code === 0) {
        setIsEditMode(false);
        setIsModalOpen(false);
        setShowError(false);
        message.success('参数保存成功');
        callback();
      }
    } catch (error) {
      setShowError(true);
      timeoutRef.current = setTimeout(() => {
        setShowError(false);
      }, 3000);
    }
  };

  return (
    <>
      {!params ? (
        <ProCard
          size="small"
          layout="center"
          style={{
            borderRadius: '6px',
            cursor: 'pointer',
            height: '50px',
          }}
          bodyStyle={{
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Space direction="vertical" align="center" size={2}>
            <Text type="secondary" style={{ fontSize: '10px' }}>
              无参数配置
            </Text>
            <Link
              style={{ fontSize: '12px' }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsModalOpen(true);
                setEditable(true);
              }}
            >
              添加
            </Link>
          </Space>
        </ProCard>
      ) : (
        <>
          {/* 参数展示卡片 */}
          <ProCard
            size={'small'}
            split={'horizontal'}
            style={{
              padding: '3px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            {/* 标题区域 */}
            <Tag
              icon={<SettingOutlined />}
              color="#722ed1"
              style={{
                fontSize: '11px',
                flex: 1,
                fontWeight: 500,
                marginBottom: '4px',
              }}
            >
              {paramCount}
            </Tag>
            {/* 参数内容 */}
            {renderFirstThree()}

            {/* 查看更多按钮 */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                marginTop: '6px',
              }}
            >
              <a
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsModalOpen(true);
                  setEditable(true);
                }}
                style={{
                  fontSize: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px',
                }}
              >
                <EyeOutlined style={{ fontSize: '10px' }} />
                {hasMoreData ? '查看全部' : '查看详情'}
                {editable && '/编辑'}
              </a>
            </div>
          </ProCard>
        </>
      )}

      {/* 模态框 */}
      <>
        <Modal
          title={'参数详情'}
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
                    取消编辑
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
                      setEditable(true);
                      setEditValue(JSON.stringify(params, null, 2));
                      setIsEditMode(true);
                    }}
                  >
                    编辑
                  </Button>,
                ]
          }
          width={800}
          destroyOnClose
        >
          <div style={{ marginTop: '12px' }}>
            {showError ? (
              <div
                style={{
                  color: '#ff4d4f',
                  marginBottom: '8px',
                  padding: '8px',
                  backgroundColor: '#fff2f0',
                  borderRadius: '4px',
                  border: '1px solid #ffccc7',
                  fontSize: '13px',
                }}
              >
                JSON格式错误，请检查语法
              </div>
            ) : (
              <Text type={'secondary'}>{`格式要求：[{key:xx,value:xx}]`} </Text>
            )}
            {isEditMode ? (
              <AceCodeEditor
                _mode="json"
                value={editValue}
                onChange={(value) => {
                  setEditValue(value);
                  setShowError(false);
                }}
                height="400px"
              />
            ) : (
              <AceCodeEditor
                readonly={true}
                _mode="json"
                value={JSON.stringify(params, null, 2)}
                height="400px"
              />
            )}
          </div>
        </Modal>
      </>
    </>
  );
};

export default JobParams;

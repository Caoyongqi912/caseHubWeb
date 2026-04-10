import Handler from '@/components/DnDDraggable/handler';
import { AssertOption } from '@/pages/Httpx/componets/assertEnum';
import {
  CheckCircleOutlined,
  EditOutlined,
  MinusCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import {
  Button,
  Col,
  Divider,
  Form,
  Input,
  message,
  Row,
  Select,
  Space,
  Tag,
  theme,
  Typography,
} from 'antd';
import { FC, useEffect, useMemo, useState } from 'react';

const { Text } = Typography;
const { useToken } = theme;

export interface AssertContentInfo {
  id: number;
  content_name?: string;
  assert_list?: any[];
}

export type UpdateAssertFunc = (data: {
  id: number;
  content_name?: string;
  assert_list?: any[];
}) => Promise<any>;

interface Props {
  id: number;
  step: number;
  caseId: number;
  contentInfo: AssertContentInfo;
  callback?: () => void;
  extra?: React.ReactNode;
  showExtra?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  updateAssert: UpdateAssertFunc;
}

/**
 * 断言内容卡片组件
 * 用于显示和管理断言步骤内容，支持多个断言条件的配置
 */
const AssertContentCard: FC<Props> = (props) => {
  const [form] = Form.useForm();
  const { token } = useToken();
  const {
    id,
    step,
    contentInfo,
    callback,
    extra,
    onMouseEnter,
    onMouseLeave,
    updateAssert,
  } = props;
  const [showOption, setShowOption] = useState(false);
  const [showEditIcon, setShowEditIcon] = useState(false);
  const [showAssertInput, setShowAssertInput] = useState(true);
  const [assertName, setAssertName] = useState<string>();

  /**
   * 监听 contentInfo 变化，初始化断言名称和表单数据
   * @description 当 contentInfo 变化时，更新断言名称和表单初始值
   */
  useEffect(() => {
    const { content_name, assert_list } = contentInfo;
    if (content_name) {
      setAssertName(content_name);
      setShowAssertInput(false);
    }
    if (assert_list) {
      form.setFieldsValue({ assert_list });
    }
  }, [contentInfo, form]);

  /**
   * 更新内容标题
   * @description 保存编辑后的断言标题到服务端
   * @param value - 新的标题内容
   */
  const updateContentTitle = async (value: string | undefined) => {
    if (value) {
      const { code, data } = await updateAssert({
        id: contentInfo.id,
        content_name: value,
      });
      if (code === 0) {
        setAssertName(data.content_name);
        setShowAssertInput(false);
      }
    } else {
      setShowAssertInput(true);
    }
  };

  /**
   * 断言标题组件
   * @description 根据状态渲染文本或输入框，支持点击编辑图标进入编辑模式
   */
  const Assert = useMemo(() => {
    if (assertName && !showAssertInput) {
      return (
        <Space size={8} align="center">
          <Text
            strong
            style={{
              fontSize: '15px',
              color: token.colorText,
              letterSpacing: '0.5px',
            }}
          >
            {assertName}
          </Text>
          {showEditIcon && (
            <EditOutlined
              style={{
                color: '#059669',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'all 0.2s ease',
                padding: '4px',
                borderRadius: '4px',
              }}
              onClick={(event) => {
                event.stopPropagation();
                setShowAssertInput(true);
              }}
            />
          )}
        </Space>
      );
    }
    return (
      <Input
        style={{ width: '100%', maxWidth: '280px', borderRadius: '6px' }}
        variant="borderless"
        placeholder="输入断言名称..."
        onChange={(e) => {
          e.stopPropagation();
          if (e.target.value) setAssertName(e.target.value);
        }}
        onClick={(e) => e.stopPropagation()}
        onBlur={() => updateContentTitle(assertName)}
        onPressEnter={() => updateContentTitle(assertName)}
      />
    );
  }, [assertName, showAssertInput, showEditIcon, token]);

  /**
   * 卡片标题渲染
   * @description 渲染带有断言标签和步骤信息的卡片标题
   */
  const cardTitle = useMemo(
    () => (
      <Space size={10} align="center">
        <Handler id={id} step={step} />
        <Tag
          icon={<CheckCircleOutlined />}
          style={{
            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            color: '#fff',
            border: 'none',
            fontWeight: 600,
            fontSize: '12px',
            padding: '4px 10px',
            borderRadius: '6px',
            boxShadow: '0 2px 8px rgba(5, 150, 105, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          断言
        </Tag>
        {Assert}
      </Space>
    ),
    [id, step, Assert, token],
  );

  return (
    <ProCard
      bordered
      collapsible
      hoverable
      defaultCollapsed
      bodyStyle={{ padding: 0 }}
      style={{
        borderRadius: '16px',
        boxShadow: showOption
          ? `0 8px 32px rgba(5, 150, 105, 0.15), 0 2px 8px rgba(0, 0, 0, 0.08)`
          : `0 2px 12px rgba(0, 0, 0, 0.06)`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        border: showOption
          ? `1px solid rgba(5, 150, 105, 0.3)`
          : `1px solid ${token.colorBorderSecondary}`,
        overflow: 'hidden',
      }}
      onMouseEnter={() => {
        setShowOption(true);
        setShowEditIcon(true);
        onMouseEnter?.();
      }}
      onMouseLeave={() => {
        setShowOption(false);
        setShowEditIcon(false);
        onMouseLeave?.();
      }}
      extra={extra}
      collapsibleIconRender={() => cardTitle}
    >
      <ProCard
        bordered={false}
        style={{
          background: `linear-gradient(180deg, ${token.colorBgContainer} 0%, ${token.colorBgLayout} 100%)`,
          padding: '20px 24px',
        }}
      >
        <Form form={form} layout="vertical">
          <Form.List name="assert_list">
            {(fields, { add, remove }) => (
              <>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  {fields.map((field) => (
                    <div
                      key={field.key}
                      style={{
                        padding: '16px 20px',
                        background: token.colorBgContainer,
                        borderRadius: '12px',
                        border: `1px solid ${token.colorBorderSecondary}`,
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <Row gutter={16} align="middle">
                        <Col flex="auto">
                          <Row gutter={12}>
                            <Col span={8}>
                              <Form.Item
                                {...field}
                                name={[field.name, 'assert_key']}
                                rules={[
                                  { required: true, message: '请输入变量' },
                                ]}
                                style={{ marginBottom: 0 }}
                              >
                                <Input
                                  placeholder="断言变量"
                                  prefix={
                                    <Text
                                      type="secondary"
                                      style={{ fontSize: '12px' }}
                                    >
                                      变量
                                    </Text>
                                  }
                                  style={{ borderRadius: '8px' }}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={8}>
                              <Form.Item
                                {...field}
                                name={[field.name, 'assert_type']}
                                rules={[
                                  { required: true, message: '请选择条件' },
                                ]}
                                style={{ marginBottom: 0 }}
                              >
                                <Select
                                  placeholder="选择条件"
                                  options={AssertOption}
                                  style={{ borderRadius: '8px' }}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={8}>
                              <Form.Item
                                {...field}
                                name={[field.name, 'assert_value']}
                                rules={[
                                  { required: true, message: '请输入对比值' },
                                ]}
                                style={{ marginBottom: 0 }}
                              >
                                <Input
                                  placeholder="断言值"
                                  prefix={
                                    <Text
                                      type="secondary"
                                      style={{ fontSize: '12px' }}
                                    >
                                      值
                                    </Text>
                                  }
                                  style={{ borderRadius: '8px' }}
                                />
                              </Form.Item>
                            </Col>
                          </Row>
                        </Col>
                        <Col>
                          <Button
                            type="text"
                            danger
                            icon={<MinusCircleOutlined />}
                            onClick={() => remove(field.name)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          />
                        </Col>
                      </Row>
                    </div>
                  ))}
                </div>
                <Divider style={{ margin: '16px 0' }} />
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                  style={{
                    borderRadius: '10px',
                    height: '48px',
                    fontSize: '14px',
                    borderColor: 'rgba(5, 150, 105, 0.3)',
                    color: '#059669',
                  }}
                >
                  添加断言
                </Button>
              </>
            )}
          </Form.List>
        </Form>
        <div
          style={{
            marginTop: '20px',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <Button
            type="primary"
            onClick={async () => {
              const values = await form.validateFields();
              const { code, data } = await updateAssert({
                id: contentInfo.id,
                ...values,
              });
              if (code === 0) {
                form.setFieldsValue(data);
                message.success('保存成功');
              }
            }}
            style={{
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              border: 'none',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(5, 150, 105, 0.35)',
            }}
          >
            保存断言
          </Button>
        </div>
      </ProCard>
    </ProCard>
  );
};

export default AssertContentCard;

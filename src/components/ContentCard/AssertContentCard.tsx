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

  useEffect(() => {
    const { content_name } = contentInfo;
    if (content_name) {
      setAssertName(content_name);
      setShowAssertInput(false);
    }
    if (contentInfo.assert_list) {
      form.setFieldsValue({ assert_list: contentInfo.assert_list });
    }
  }, [contentInfo]);

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

  const Assert = useMemo(() => {
    if (assertName && !showAssertInput) {
      return (
        <Space size={8}>
          <Text
            strong
            style={{
              fontSize: '14px',
              color: token.colorText,
            }}
          >
            {assertName}
          </Text>
          {showEditIcon && (
            <EditOutlined
              style={{
                color: token.colorPrimary,
                cursor: 'pointer',
              }}
              onClick={(event) => {
                event.stopPropagation();
                setShowAssertInput(true);
              }}
            />
          )}
        </Space>
      );
    } else {
      return (
        <Input
          style={{ width: '100%', maxWidth: '300px' }}
          variant="borderless"
          onChange={(e) => {
            e.stopPropagation();
            if (e.target.value) setAssertName(e.target.value);
          }}
          onClick={(e) => {
            e.stopPropagation();
          }}
          onBlur={async () => await updateContentTitle(assertName)}
          onPressEnter={async () => await updateContentTitle(assertName)}
        />
      );
    }
  }, [assertName, showAssertInput, showEditIcon, token]);

  const cardTitle = useMemo(
    () => (
      <Space size={8} align="center">
        <Handler id={id} step={step} />
        <Tag
          icon={<CheckCircleOutlined />}
          style={{
            background: '#d1fae5',
            color: '#059669',
            border: '1px solid #05966920',
            fontWeight: 600,
            fontSize: '12px',
            padding: '2px 8px',
            borderRadius: token.borderRadiusSM,
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
      style={{
        borderRadius: token.borderRadiusLG,
        boxShadow: showOption
          ? `0 4px 12px ${token.colorPrimaryBg}`
          : `0 1px 3px ${token.colorBgLayout}`,
        transition: 'all 0.3s ease',
        borderColor: showOption ? token.colorPrimaryBorder : token.colorBorder,
      }}
      bodyStyle={{
        padding: 0,
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
          background: token.colorBgContainer,
          padding: '16px',
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
                        padding: '16px',
                        background: token.colorBgLayout,
                        borderRadius: token.borderRadius,
                        border: `1px solid ${token.colorBorder}`,
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <Row gutter={16} align="middle">
                        <Col flex="auto">
                          <Row gutter={16}>
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
                    borderRadius: token.borderRadius,
                    height: '48px',
                    fontSize: '14px',
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
            marginTop: '16px',
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
              borderRadius: token.borderRadius,
            }}
          >
            保存
          </Button>
        </div>
      </ProCard>
    </ProCard>
  );
};

export default AssertContentCard;

import { IPlayStepContent } from '@/pages/Play/componets/uiTypes';
import {
  DeleteOutlined,
  PlusOutlined,
  SelectOutlined,
} from '@ant-design/icons';
import {
  ActionType,
  DragSortTable,
  ProColumns,
} from '@ant-design/pro-components';
import {
  Button,
  Divider,
  Dropdown,
  Form,
  Input,
  MenuProps,
  Popconfirm,
  Select,
  Space,
  theme,
  Typography,
} from 'antd';
import { FC, useRef, useState } from 'react';
const { Text } = Typography;
const { useToken } = theme;

import { AssertOption } from '@/pages/Httpx/componets/assertEnum';

interface SelfProps {
  case_id: number;
  stepContent: IPlayStepContent;
  setKey: React.Dispatch<React.SetStateAction<string | undefined>>;
  setValue: React.Dispatch<React.SetStateAction<string | undefined>>;
  setOperator: React.Dispatch<React.SetStateAction<string | undefined>>;
}

const ConditionContentInfo: FC<SelfProps> = (props) => {
  const { case_id, stepContent, setKey, setValue, setOperator } = props;
  const { token } = useToken();
  const timeoutRef = useRef<any>(null);
  const actionRef = useRef<ActionType>();

  const [conditionForm] = Form.useForm();
  const [conditionPlayContent, setConditionPlayContent] = useState<
    IPlayStepContent[]
  >([]);

  const [showValueInput, setShowValueInput] = useState(true);
  const [showContentInfo, setShowContentInfo] = useState(false);
  const [currnetPlayContentId, setCurrnetPlayContentId] = useState<number>();
  const [playCaseChoiceOpen, setPlayCaseChoiceOpen] = useState(false);

  const refresh = () => {
    actionRef.current?.reload();
  };

  const onValuesChange = (values: any) => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(async () => {}, 2000);
  };
  const columns: ProColumns<IPlayStepContent>[] = [
    {
      title: '排序',
      dataIndex: 'sort',
      className: 'drag-visible',
      align: 'center',
    },
    {
      title: '接口编号',
      dataIndex: 'uid',
      key: 'uid',
      render: (_, record) => {
        return (
          <a
            onClick={() => {
              setCurrnetPlayContentId(record.id);
              setShowContentInfo(true);
            }}
          >
            {record.uid}
          </a>
        );
      },
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
    },

    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      align: 'center',
      render: (_, record) => {
        return (
          <Popconfirm
            title="确认移除"
            description="确定要移除这个接口吗？"
            onConfirm={async () => {}}
            okText="确定"
            cancelText="取消"
          >
            <Button type="text" danger size="small" icon={<DeleteOutlined />} />
          </Popconfirm>
        );
      },
    },
  ];
  const formRender = (
    <>
      <div
        style={{
          padding: '16px',
          background: token.colorBgContainer,
          borderRadius: token.borderRadius,
          border: `1px solid ${token.colorBorder}`,
        }}
      >
        <Form
          form={conditionForm}
          onValuesChange={onValuesChange}
          layout="inline"
        >
          <Space size="middle" align="center" wrap>
            <Text strong style={{ fontSize: '14px', color: token.colorText }}>
              判断条件
            </Text>
            <Form.Item
              name={'condition_key'}
              rules={[{ required: true, message: '变量名不能为空' }]}
              style={{ marginBottom: 0 }}
            >
              <Input
                placeholder="条件值，支持{{变量名}}"
                style={{ width: '200px' }}
                onChange={(e) => {
                  setKey(e.target.value);
                }}
              />
            </Form.Item>
            <Form.Item
              name={'condition_operator'}
              rules={[{ required: true, message: '条件不能为空' }]}
              style={{ marginBottom: 0 }}
            >
              <Select
                style={{ width: '120px' }}
                options={AssertOption}
                onChange={(_: any, option: any) => {
                  setOperator(option.label);
                  if (option.value === 3 || option.value === 4) {
                    setShowValueInput(false);
                  } else {
                    setShowValueInput(true);
                  }
                }}
              />
            </Form.Item>
            {showValueInput && (
              <Form.Item
                name={'condition_value'}
                rules={[{ required: true, message: '比较值不能为空' }]}
                style={{ marginBottom: 0 }}
              >
                <Input
                  placeholder="输入比较值"
                  style={{ width: '200px' }}
                  onChange={(e) => {
                    setValue(e.target.value);
                  }}
                />
              </Form.Item>
            )}
          </Space>
        </Form>
      </div>
    </>
  );

  const items: MenuProps['items'] = [
    {
      key: 'choice_common',
      label: '选择公共API',
      icon: <SelectOutlined style={{ color: token.colorPrimary }} />,
      onClick: () => setPlayCaseChoiceOpen(true),
    },
  ];
  return (
    <>
      <div
        style={{
          background: token.colorBgContainer,
          borderRadius: token.borderRadius,
          padding: '16px',
        }}
      >
        {formRender}
        <Divider style={{ margin: '16px 0' }} />
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
        }}
      >
        <Text strong style={{ fontSize: '14px' }}>
          条件接口列表
        </Text>
        <Dropdown arrow menu={{ items: items }} placement="bottomRight">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            style={{
              borderRadius: token.borderRadius,
            }}
          >
            选择
          </Button>
        </Dropdown>
      </div>
      <DragSortTable
        actionRef={actionRef}
        columns={columns}
        options={false}
        rowKey="id"
        search={false}
        pagination={false}
        dragSortKey="sort"
        style={{
          border: `1px solid ${token.colorBorder}`,
          borderRadius: token.borderRadius,
        }}
      />
    </>
  );
};

export default ConditionContentInfo;

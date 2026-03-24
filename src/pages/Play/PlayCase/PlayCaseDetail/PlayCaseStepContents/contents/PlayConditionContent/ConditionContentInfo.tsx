import {
  choicePlayCaseConditionContentStep,
  getPlayCaseConditionContentSteps,
  getPlayConditionContentInfo,
  removeCaseConditionContentstep,
  reorderPlayCaseConditionContentStep,
  updatePlayConditionContentInfo,
} from '@/api/play/playCase';
import MyDrawer from '@/components/MyDrawer';
import { AssertOption } from '@/pages/Httpx/componets/assertEnum';
import { IPlayStepContent } from '@/pages/Play/componets/uiTypes';
import PlayStepDetail from '@/pages/Play/PlayStep/PlayStepDetail';
import { queryData } from '@/utils/somefunc';
import {
  DeleteOutlined,
  LockOutlined,
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
  message,
  Popconfirm,
  Select,
  Space,
  Tag,
  theme,
  Typography,
} from 'antd';
import { FC, useCallback, useEffect, useRef, useState } from 'react';
import PlayCommonChoiceTable from '../../../PlayCommonChoiceTable';
const { Text } = Typography;
const { useToken } = theme;

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
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const actionRef = useRef<ActionType>();

  const [conditionForm] = Form.useForm();

  const [showValueInput, setShowValueInput] = useState(true);
  const [showContentInfo, setShowContentInfo] = useState(false);
  const [currnetPlayContentId, setCurrnetPlayContentId] = useState<number>();
  const [playCaseAddSelfStepOpen, setPlayCaseAddSelfStepOpen] = useState(false);
  const [playCaseAddCommonStepOpen, setPlayCaseAddCommonStepOpen] =
    useState(false);

  useEffect(() => {
    if (!stepContent) return;
    getPlayConditionContentInfo(stepContent.target_id).then(
      async ({ code, data }) => {
        if (code === 0) {
          setKey(data.condition_key);
          setValue(data.condition_value);
          setOperator(
            AssertOption.find((o) => o.value === data.condition_operator)
              ?.label || '',
          );

          conditionForm.setFieldsValue(data);
          if (data.condition_operator === 3 || data.condition_operator === 4) {
            setShowValueInput(false);
          }
        }
      },
    );
  }, [stepContent.target_id]);

  const refresh = () => {
    actionRef.current?.reload();
    setPlayCaseAddSelfStepOpen(false);
    setShowContentInfo(false);
    setPlayCaseAddCommonStepOpen(false);
    setCurrnetPlayContentId(undefined);
  };

  const onValuesChange = useCallback(
    (
      changedValues: Record<string, unknown>,
      allValues: Record<string, unknown>,
    ) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      const { condition_key, condition_operator, condition_value } = allValues;

      setKey((condition_key as string) || '');
      setValue((condition_value as string) || '');
      if (typeof condition_operator === 'number') {
        const option = AssertOption.find((o) => o.value === condition_operator);
        setOperator(option?.label || '');
        setShowValueInput(![3, 4].includes(condition_operator));
      }

      const isValid =
        condition_key &&
        condition_operator !== undefined &&
        condition_operator !== null &&
        (showValueInput ? condition_value : true);

      if (isValid) {
        timeoutRef.current = setTimeout(async () => {
          try {
            const { code, data } = await updatePlayConditionContentInfo({
              id: stepContent.target_id,
              condition_key,
              condition_operator,
              condition_value: showValueInput ? condition_value : undefined,
            });
            if (code === 0) {
              conditionForm.setFieldsValue(data);
            }
          } catch (error) {
            message.error('保存条件失败');
          }
        }, 2000);
      }
    },
    [
      stepContent.target_id,
      conditionForm,
      setKey,
      setValue,
      setOperator,
      showValueInput,
    ],
  );
  const columns: ProColumns<IPlayStepContent>[] = [
    {
      title: '排序',
      dataIndex: 'sort',
      width: '8%',
    },

    {
      title: '名称',
      dataIndex: 'content_name',
      key: 'content_name',
      ellipsis: true,
      render: (_, record) => {
        return (
          <a
            onClick={() => {
              setCurrnetPlayContentId(record.target_id);
              setShowContentInfo(true);
            }}
          >
            {record.content_name}
          </a>
        );
      },
    },
    {
      title: '描述',
      dataIndex: 'content_desc',
      key: 'content_desc',
      ellipsis: true,
    },

    {
      title: '类型',
      dataIndex: 'is_common',
      render: (_, record) => {
        if (record.is_common) {
          return (
            <Tag
              style={{
                background: '#d1fae5',
                color: '#059669',
                border: '#05966920',
                fontWeight: 500,
                fontSize: '12px',
                padding: '2px 8px',
                borderRadius: token.borderRadiusSM,
              }}
              icon={<LockOutlined />}
            >
              公共
            </Tag>
          );
        } else {
          return (
            <Tag
              style={{
                background: '#fee2e2',
                color: '#dc2626',
                border: '#dc262620',
                fontWeight: 500,
                fontSize: '12px',
                padding: '2px 8px',
                borderRadius: token.borderRadiusSM,
              }}
              icon={<LockOutlined />}
            >
              私有
            </Tag>
          );
        }
      },
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
            onConfirm={async () => {
              const { code } = await removeCaseConditionContentstep({
                content_id: record.id,
                condition_id: stepContent.target_id,
              });
              if (code === 0) {
                refresh();
              }
            }}
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
                onChange={(value) => {
                  setShowValueInput(![3, 4].includes(value));
                }}
              />
            </Form.Item>
            {showValueInput && (
              <Form.Item
                name={'condition_value'}
                rules={[{ required: true, message: '比较值不能为空' }]}
                style={{ marginBottom: 0 }}
              >
                <Input placeholder="输入比较值" style={{ width: '200px' }} />
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
      label: '选择公共步骤',
      icon: <SelectOutlined style={{ color: token.colorPrimary }} />,
      onClick: () => setPlayCaseAddCommonStepOpen(true),
    },

    {
      key: 'add_self_step',
      label: '添加私有步骤',
      icon: <PlusOutlined style={{ color: token.colorPrimary }} />,
      onClick: () => setPlayCaseAddSelfStepOpen(true),
    },
  ];

  /**
   * 查询条件内容步骤
   * @param data
   * @param options
   * @returns
   */
  const fetchConditionStepsContent = useCallback(async () => {
    const { code, data } = await getPlayCaseConditionContentSteps({
      condition_id: stepContent.target_id,
    });
    return queryData(code, data);
  }, [stepContent.id]);

  /**
   * Case Condition Content排序
   * @param _ 未使用
   * @param __ 未使用
   * @param newDataSource
   */
  const handleDragSortEnd = async (
    _: number,
    __: number,
    newDataSource: IPlayStepContent[],
  ) => {
    const reorderIds: number[] = newDataSource.map((item) => item.id);
    const { code } = await reorderPlayCaseConditionContentStep({
      condition_id: stepContent.target_id,
      content_child_list_id: reorderIds,
    });
    if (code === 0) {
      refresh();
    }
  };

  /**
   * 选择公共步骤
   * @param quote
   * @param selectedRowKeys
   */
  const choice_common_steps = async (
    quote: boolean,
    selectedRowKeys: React.Key[],
  ) => {
    const { code } = await choicePlayCaseConditionContentStep({
      quote: quote,
      condition_id: stepContent.target_id,
      play_step_id_list: selectedRowKeys as number[],
    });
    if (code === 0) {
      refresh();
    }
  };

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
        <DragSortTable
          toolBarRender={() => [
            <>
              <Dropdown arrow menu={{ items: items }} placement="bottomRight">
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  style={{
                    borderRadius: token.borderRadius,
                  }}
                >
                  添加
                </Button>
              </Dropdown>
            </>,
          ]}
          actionRef={actionRef}
          columns={columns}
          request={fetchConditionStepsContent}
          rowKey="id"
          onDragSortEnd={handleDragSortEnd}
          search={false}
          pagination={false}
          dragSortKey="sort"
          style={{
            border: `1px solid ${token.colorBorder}`,
            borderRadius: token.borderRadius,
          }}
        />
      </div>
      <MyDrawer
        width="auto"
        open={playCaseAddSelfStepOpen}
        setOpen={setPlayCaseAddSelfStepOpen}
      >
        <PlayStepDetail
          play_case_id={case_id}
          play_condition_content_id={stepContent.id}
          callback={refresh}
        />
      </MyDrawer>
      <MyDrawer
        width="60%"
        open={playCaseAddCommonStepOpen}
        setOpen={setPlayCaseAddCommonStepOpen}
      >
        <PlayCommonChoiceTable onSelect={choice_common_steps} />
      </MyDrawer>
      <MyDrawer
        width="auto"
        open={showContentInfo}
        setOpen={setShowContentInfo}
      >
        <PlayStepDetail
          play_case_id={case_id}
          play_step_id={currnetPlayContentId}
          play_condition_content_id={stepContent.id}
          callback={refresh}
        />
      </MyDrawer>
    </>
  );
};

export default ConditionContentInfo;

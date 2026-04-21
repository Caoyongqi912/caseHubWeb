import {
  createInterfaceAssoiationCondition,
  queryConditionAPI,
  removerAssociationAPI,
  reorderAssociationAPI,
  selectCommonAPI2ConditionAPI,
  updateConditionContentInfo,
} from '@/api/inter/interCase';
import MyDrawer from '@/components/MyDrawer';
import { AssertOption } from '@/pages/Httpx/componets/assertEnum';
import InterfaceApiDetail from '@/pages/Httpx/Interface/InterfaceApiDetail';
import GroupApiChoiceTable from '@/pages/Httpx/Interface/interfaceApiGroup/GroupApiChoiceTable';
import InterfaceCaseChoiceApiTable from '@/pages/Httpx/InterfaceApiCaseResult/InterfaceCaseChoiceApiTable';
import { IInterfaceAPI, IInterfaceCaseContent } from '@/pages/Httpx/types';
import { CONFIG } from '@/utils/config';
import { queryData } from '@/utils/somefunc';
import {
  DeleteOutlined,
  LoadingOutlined,
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
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';

const { Text } = Typography;
const { useToken } = theme;

interface ConditionData {
  condition_key?: string;
  condition_value?: string;
  condition_operator?: number;
}

interface SelfProps {
  case_id: number;
  caseContent: IInterfaceCaseContent;
  projectId?: number;
  initialConditionData: ConditionData;
  onConditionChange: () => void;
}

/**
 * 条件详情组件
 * 用于显示和管理条件判断的详细信息，包括条件配置和条件接口列表
 */
const ApiCondition: FC<SelfProps> = (props) => {
  const {
    case_id,
    caseContent,
    projectId,
    initialConditionData,
    onConditionChange,
  } = props;
  const { token } = useToken();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const actionRef = useRef<ActionType>();

  const [conditionForm] = Form.useForm();
  const [conditionAPI, setConditionAPI] = useState<IInterfaceAPI[]>([]);
  const [choiceGroupOpen, setChoiceGroupOpen] = useState(false);
  const [choiceOpen, setChoiceOpen] = useState(false);
  const [showAPIDetail, setShowAPIDetail] = useState(false);
  const [currentApiId, setCurrentApiId] = useState<number>();
  const [showValueInput, setShowValueInput] = useState(true);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  /**
   * 初始化表单数据
   * @description 当 initialConditionData 变化时，同步表单值和状态
   */
  useEffect(() => {
    if (initialConditionData) {
      conditionForm.setFieldsValue(initialConditionData);
      const operator = initialConditionData.condition_operator;
      setShowValueInput(operator !== 3 && operator !== 4);
    }
  }, [initialConditionData, conditionForm]);

  /**
   * 获取条件接口列表
   * @description 从服务端获取条件关联的接口列表
   */
  const fetchConditionAPIS = useCallback(async () => {
    const { code, data } = await queryConditionAPI(caseContent.target_id);
    return queryData(code, data, setConditionAPI);
  }, [caseContent.target_id]);

  /**
   * 刷新表格数据
   * @description 重新加载表格并关闭选择弹窗
   */
  const refresh = useCallback(() => {
    actionRef.current?.reload();
    setChoiceGroupOpen(false);
    setChoiceOpen(false);
  }, []);

  /**
   * 拖拽排序结束处理
   * @description 更新本地状态并同步排序结果到服务器
   */
  const handleDragSortEnd = useCallback(
    async (_: number, __: number, newDataSource: IInterfaceAPI[]) => {
      setConditionAPI(newDataSource);
      const reorderIds: number[] = newDataSource.map((item) => item.id);
      await reorderAssociationAPI({
        interface_id_list: reorderIds,
        condition_id: caseContent.target_id,
      });
    },
    [caseContent.target_id],
  );

  /**
   * 移除接口关联
   * @description 从条件中移除指定的接口关联
   */
  const handleRemoveAssociation = useCallback(
    async (apiId: number) => {
      const { code, msg } = await removerAssociationAPI({
        interface_id: apiId,
        condition_id: caseContent.target_id,
      });
      if (code === 0) {
        message.success(msg);
        refresh();
      }
    },
    [caseContent.target_id, refresh],
  );

  /**
   * 选择接口添加到条件
   * @description 将选中的接口关联到当前条件
   */
  const handleSelectInterface2Condition = useCallback(
    async (values: number[], copy: boolean) => {
      const { code, msg } = await selectCommonAPI2ConditionAPI({
        condition_id: caseContent.target_id,
        interface_id_list: values,
        is_copy: copy,
      });
      if (code === 0) {
        message.success(msg);
        refresh();
      }
    },
    [caseContent.target_id, refresh],
  );

  /**
   * 创建私有API
   * @description 创建新的私有接口并关联到当前条件
   */
  const handleCreateSelfApi = useCallback(async () => {
    const { code, data } = await createInterfaceAssoiationCondition({
      condition_id: caseContent.target_id,
      case_id,
    });
    if (code === 0) {
      actionRef.current?.reload();
      setCurrentApiId(data.id);
      setShowAPIDetail(true);
    }
  }, [caseContent.target_id, case_id]);

  /**
   * 表单值变化处理（防抖保存）
   * @description 条件配置变化时自动保存到服务端，防抖时间为2秒
   * 只有当 condition_key、condition_operator、condition_value 三个值都存在时才发送请求
   */
  const handleValuesChange = useCallback(
    (_: unknown, allValues: Record<string, unknown>) => {
      const condition_key = allValues.condition_key as string | undefined;
      const condition_operator = allValues.condition_operator as
        | number
        | undefined;
      const condition_value = allValues.condition_value as string | undefined;

      const isOperatorWithoutValue =
        condition_operator === 3 || condition_operator === 4;
      const needsConditionValue = !isOperatorWithoutValue;

      const hasKey = condition_key !== undefined && condition_key !== '';
      const hasOperator = condition_operator !== undefined;
      const hasValue = condition_value !== undefined && condition_value !== '';
      const isFormComplete =
        hasKey && hasOperator && (!needsConditionValue || hasValue);

      if (!isFormComplete) {
        clearTimeout(timeoutRef.current);
        return;
      }

      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(async () => {
        const { code, data } = await updateConditionContentInfo({
          id: caseContent.target_id,
          ...allValues,
        });
        if (code === 0) {
          conditionForm.setFieldsValue(data);
          setShowSaveSuccess(true);
          onConditionChange();
          setTimeout(() => setShowSaveSuccess(false), 2000);
        }
      }, 2000);
    },
    [caseContent.target_id, conditionForm, onConditionChange],
  );

  /**
   * 操作符变化处理
   * @description 当操作符为大于或小于时，隐藏比较值输入框
   */
  const handleOperatorChange = useCallback((_: unknown, option: unknown) => {
    const optionObj = option as { label: string; value: number };
    setShowValueInput(optionObj?.value !== 3 && optionObj?.value !== 4);
  }, []);

  /**
   * 表格列定义
   * @description 定义条件接口列表表格的列信息
   */
  const columns: ProColumns<IInterfaceAPI>[] = useMemo(
    () => [
      {
        title: '排序',
        dataIndex: 'sort',
        className: 'drag-visible',
        width: 60,
        align: 'center',
      },
      {
        title: '接口编号',
        dataIndex: 'uid',
        key: 'uid',
        width: 120,
        render: (_, record) => (
          <a
            onClick={() => {
              setCurrentApiId(record.id);
              setShowAPIDetail(true);
            }}
            style={{ color: '#8b5cf6', fontWeight: 500 }}
          >
            {record.uid}
          </a>
        ),
      },
      {
        title: '名称',
        dataIndex: 'interface_name',
        key: 'interface_name',
        ellipsis: true,
      },
      {
        title: '标签',
        dataIndex: 'is_common',
        key: 'is_common',
        render: (_, record) =>
          record.is_common ? (
            <Tag color="green">公共</Tag>
          ) : (
            <Tag color="red">私有</Tag>
          ),
      },
      {
        title: '优先级',
        dataIndex: 'interface_level',
        valueType: 'select',
        valueEnum: CONFIG.API_LEVEL_ENUM,
        align: 'center',
        render: (_, record) => (
          <Tag
            style={{
              background: 'rgba(139, 92, 246, 0.1)',
              color: '#8b5cf6',
              border: '1px solid rgba(139, 92, 246, 0.2)',
              borderRadius: '4px',
            }}
          >
            {record.interface_level}
          </Tag>
        ),
      },
      {
        title: '创建人',
        dataIndex: 'creatorName',
        align: 'center',
        render: (_, record) => (
          <Tag style={{ borderRadius: '4px' }}>{record.creatorName}</Tag>
        ),
      },
      {
        title: '操作',
        valueType: 'option',
        key: 'option',
        width: '10%',
        align: 'center',
        render: (_, record) => (
          <Popconfirm
            title="确认移除"
            description="确定要移除这个接口吗？"
            onConfirm={async () => await handleRemoveAssociation(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="text" danger size="small" icon={<DeleteOutlined />} />
          </Popconfirm>
        ),
      },
    ],
    [handleRemoveAssociation],
  );

  /**
   * 下拉菜单配置
   * @description 提供添加接口的下拉菜单选项
   */
  const dropdownItems: MenuProps['items'] = useMemo(
    () => [
      {
        key: 'choice_common',
        label: '选择公共API',
        icon: <SelectOutlined style={{ color: '#8b5cf6' }} />,
        onClick: () => setChoiceOpen(true),
      },
      {
        key: 'create_self_api',
        label: '创建私有API',
        icon: <PlusOutlined style={{ color: '#8b5cf6' }} />,
        onClick: handleCreateSelfApi,
      },
    ],
    [handleCreateSelfApi],
  );

  /**
   * 条件表单渲染
   * @description 渲染条件配置的表单区域
   */
  const formRender = useMemo(
    () => (
      <div
        style={{
          padding: '16px 20px',
          background: token.colorBgContainer,
          borderRadius: '12px',
          border: `1px solid ${token.colorBorderSecondary}`,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        }}
      >
        <Form
          form={conditionForm}
          onValuesChange={handleValuesChange}
          layout="horizontal"
          component={false}
        >
          <Space size="middle" align="center" wrap>
            {showSaveSuccess && (
              <LoadingOutlined style={{ fontSize: '14px', color: '#8b5cf6' }} />
            )}
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
                style={{ width: '200px', borderRadius: '8px' }}
              />
            </Form.Item>
            <Form.Item
              name={'condition_operator'}
              rules={[{ required: true, message: '条件不能为空' }]}
              style={{ marginBottom: 0 }}
            >
              <Select
                style={{ width: '120px', borderRadius: '8px' }}
                options={AssertOption}
                onChange={handleOperatorChange}
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
                  style={{ width: '200px', borderRadius: '8px' }}
                />
              </Form.Item>
            )}
          </Space>
        </Form>
      </div>
    ),
    [
      token,
      showSaveSuccess,
      showValueInput,
      conditionForm,
      handleValuesChange,
      handleOperatorChange,
    ],
  );

  return (
    <>
      <div
        style={{
          background: `linear-gradient(180deg, ${token.colorBgContainer} 0%, ${token.colorBgLayout} 100%)`,
          padding: '20px 24px',
        }}
      >
        {formRender}
        <Divider style={{ margin: '16px 0' }} />
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
          }}
        >
          <Text
            strong
            style={{
              fontSize: '15px',
              color: token.colorText,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span
              style={{
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                width: '4px',
                height: '16px',
                borderRadius: '2px',
                display: 'inline-block',
              }}
            />
            条件接口列表
          </Text>
          <Dropdown
            arrow
            menu={{ items: dropdownItems }}
            placement="bottomRight"
          >
            <Button
              type="primary"
              icon={<PlusOutlined />}
              style={{
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.35)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              添加接口
            </Button>
          </Dropdown>
        </div>
        <DragSortTable
          actionRef={actionRef}
          columns={columns}
          rowKey="id"
          request={fetchConditionAPIS}
          search={false}
          pagination={false}
          dataSource={conditionAPI}
          dragSortKey="sort"
          onDragSortEnd={handleDragSortEnd}
          style={{
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        />
      </div>
      <MyDrawer width={'75%'} open={showAPIDetail} setOpen={setShowAPIDetail}>
        <InterfaceApiDetail interfaceId={currentApiId} callback={() => {}} />
      </MyDrawer>
      <MyDrawer open={choiceGroupOpen} setOpen={setChoiceGroupOpen}>
        <GroupApiChoiceTable
          projectId={projectId}
          refresh={refresh}
          condition_api_id={caseContent.id}
        />
      </MyDrawer>
      <MyDrawer open={choiceOpen} setOpen={setChoiceOpen}>
        <InterfaceCaseChoiceApiTable
          projectId={projectId}
          radio={false}
          onSelect={handleSelectInterface2Condition}
        />
      </MyDrawer>
    </>
  );
};

export default ApiCondition;

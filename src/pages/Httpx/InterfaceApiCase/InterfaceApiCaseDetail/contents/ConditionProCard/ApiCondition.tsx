import {
  getConditionContentInfo,
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
import React, { FC, useCallback, useEffect, useRef, useState } from 'react';

const { Text } = Typography;
const { useToken } = theme;

interface SelfProps {
  case_id: number;
  caseContent: IInterfaceCaseContent;
  projectId?: number;
  setKey: React.Dispatch<React.SetStateAction<string | undefined>>;
  setValue: React.Dispatch<React.SetStateAction<string | undefined>>;
  setOperator: React.Dispatch<React.SetStateAction<string | undefined>>;
}

const OperatorOption: { [key: number]: string } = {
  0: '等于',
  1: '不等于',
  2: '大于',
  3: '小于',
  4: '大于等于',
  5: '小于等于',
  6: '包含',
  7: '不包含',
};
const ApiCondition: FC<SelfProps> = ({
  projectId,
  setValue,
  setOperator,
  setKey,
  case_id,
  caseContent,
}) => {
  const { token } = useToken();
  const timeoutRef = useRef<any>(null);
  const [conditionForm] = Form.useForm();
  const [choiceGroupOpen, setChoiceGroupOpen] = useState(false);
  const [choiceOpen, setChoiceOpen] = useState(false);
  const [conditionAPI, setConditionAPI] = useState<IInterfaceAPI[]>([]);
  const actionRef = useRef<ActionType>();
  const [showAPIDetail, setShowAPIDetail] = useState(false);
  const [currentApiId, setCurrentApiId] = useState<number>();
  const [showValueInput, setShowValueInput] = useState(true);
  const refresh = () => {
    actionRef.current?.reload();
    setChoiceGroupOpen(false);
    setChoiceOpen(false);
  };

  const fetchConditionAPIS = useCallback(async () => {
    const { code, data } = await queryConditionAPI(caseContent.target_id);
    return queryData(code, data, setConditionAPI);
  }, [caseContent]);

  useEffect(() => {
    if (!caseContent) return;
    getConditionContentInfo(caseContent.target_id).then(
      async ({ code, data }) => {
        if (code === 0) {
          setKey(data.condition_key);
          setValue(data.condition_value);
          setOperator(OperatorOption[data.condition_operator]);

          conditionForm.setFieldsValue(data);
          if (data.condition_operator === 3 || data.condition_operator === 4) {
            setShowValueInput(false);
          }
        }
      },
    );
  }, [caseContent]);

  const handleDragSortEnd = async (
    _: number,
    __: number,
    newDataSource: IInterfaceAPI[],
  ) => {
    setConditionAPI(newDataSource);
    const reorderIds: number[] = newDataSource.map((item) => item.id);
    await reorderAssociationAPI({
      interface_id_list: reorderIds,
      condition_id: caseContent.target_id,
    });
  };

  const removeAssociation = async (apiId: number) => {
    const { code, msg } = await removerAssociationAPI({
      interface_id: apiId,
      condition_id: caseContent.target_id,
    });
    if (code === 0) {
      message.success(msg);
      refresh();
    }
  };

  const columns: ProColumns<IInterfaceAPI>[] = [
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
      render: (_, record) => {
        return (
          <a
            onClick={() => {
              setCurrentApiId(record.id);
              setShowAPIDetail(true);
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
      title: '优先级',
      dataIndex: 'level',
      valueType: 'select',
      valueEnum: CONFIG.API_LEVEL_ENUM,
      width: 100,
      align: 'center',
      render: (_, record) => {
        return (
          <Tag
            style={{
              background: token.colorPrimaryBg,
              color: token.colorPrimary,
              border: `1px solid ${token.colorPrimaryBorder}`,
              borderRadius: token.borderRadiusSM,
            }}
          >
            {record.level}
          </Tag>
        );
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueType: 'select',
      width: 100,
      align: 'center',
      valueEnum: CONFIG.API_STATUS_ENUM,
      render: (_, record) => {
        return CONFIG.API_STATUS_ENUM[record.status].tag;
      },
    },
    {
      title: '创建人',
      dataIndex: 'creatorName',
      width: 100,
      align: 'center',
      render: (_, record) => {
        return (
          <Tag
            style={{
              background: token.colorBgLayout,
              border: `1px solid ${token.colorBorder}`,
              borderRadius: token.borderRadiusSM,
            }}
          >
            {record.creatorName}
          </Tag>
        );
      },
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      width: 80,
      align: 'center',
      render: (_, record) => {
        return (
          <Popconfirm
            title="确认移除"
            description="确定要移除这个接口吗？"
            onConfirm={async () => await removeAssociation(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="text" danger size="small" icon={<DeleteOutlined />} />
          </Popconfirm>
        );
      },
    },
  ];

  const items: MenuProps['items'] = [
    {
      key: 'choice_common',
      label: '选择公共API',
      icon: <SelectOutlined style={{ color: token.colorPrimary }} />,
      onClick: () => setChoiceOpen(true),
    },
  ];

  const onValuesChange = (_: any, allValues: any) => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(async () => {
      const { code, data } = await updateConditionContentInfo({
        id: caseContent.target_id,
        ...allValues,
      });
      if (code === 0) {
        conditionForm.setFieldsValue(data);
      }
    }, 2000);
  };
  const formRender = (
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
  );

  const selectInterface2Condition = async (values: number[]) => {
    const { code, msg } = await selectCommonAPI2ConditionAPI({
      condition_id: caseContent.target_id,
      interface_id_list: values,
    });

    if (code === 0) {
      message.success(msg);
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
          <Dropdown arrow menu={{ items }} placement="bottomRight">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              style={{
                borderRadius: token.borderRadius,
              }}
            >
              添加接口
            </Button>
          </Dropdown>
        </div>
        <DragSortTable
          actionRef={actionRef}
          columns={columns}
          options={false}
          rowKey="id"
          request={fetchConditionAPIS}
          search={false}
          pagination={false}
          dataSource={conditionAPI}
          dragSortKey="sort"
          onDragSortEnd={handleDragSortEnd}
          style={{
            border: `1px solid ${token.colorBorder}`,
            borderRadius: token.borderRadius,
          }}
        />
      </div>
      <MyDrawer width={'75%'} open={showAPIDetail} setOpen={setShowAPIDetail}>
        <InterfaceApiDetail interfaceId={currentApiId} callback={() => {}} />;
      </MyDrawer>
      <MyDrawer open={choiceGroupOpen} setOpen={setChoiceGroupOpen}>
        <GroupApiChoiceTable
          projectId={projectId}
          refresh={refresh}
          currentCaseId={case_id}
          condition_api_id={caseContent.id}
        />
      </MyDrawer>
      <MyDrawer open={choiceOpen} setOpen={setChoiceOpen}>
        <InterfaceCaseChoiceApiTable
          projectId={projectId}
          onSelect={selectInterface2Condition}
        />
      </MyDrawer>
    </>
  );
};

export default ApiCondition;

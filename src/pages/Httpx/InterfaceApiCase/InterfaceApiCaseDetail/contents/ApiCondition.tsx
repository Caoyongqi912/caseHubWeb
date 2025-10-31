import {
  getConditionContentInfo,
  queryConditionAPI,
  removerAssociationAPI,
  reorderAssociationAPI,
  updateConditionContentInfo,
} from '@/api/inter/interCase';
import MyDrawer from '@/components/MyDrawer';
import InterfaceApiDetail from '@/pages/Httpx/Interface/InterfaceApiDetail';
import GroupApiChoiceTable from '@/pages/Httpx/Interface/interfaceApiGroup/GroupApiChoiceTable';
import InterfaceCaseChoiceApiTable from '@/pages/Httpx/InterfaceApiCaseResult/InterfaceCaseChoiceApiTable';
import { IInterfaceAPI, IInterfaceCaseContent } from '@/pages/Httpx/types';
import { CONFIG } from '@/utils/config';
import { queryData } from '@/utils/somefunc';
import { SelectOutlined } from '@ant-design/icons';
import {
  ActionType,
  DragSortTable,
  ProCard,
  ProColumns,
  ProForm,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { Button, Dropdown, Form, MenuProps, message, Space, Tag } from 'antd';
import React, { FC, useCallback, useEffect, useRef, useState } from 'react';

interface SelfProps {
  case_id: number;
  caseContent: IInterfaceCaseContent;
  projectId?: number;
  setKey: React.Dispatch<React.SetStateAction<string | undefined>>;
  setValue: React.Dispatch<React.SetStateAction<string | undefined>>;
  setOperator: React.Dispatch<React.SetStateAction<string | undefined>>;
}

const OperatorOption: { [key: number]: string } = {
  1: '等于',
  2: '不等于',
  3: '为空',
  4: '不为空',
  5: '大于',
  6: '小与',
};
const ApiCondition: FC<SelfProps> = ({
  projectId,
  setValue,
  setOperator,
  setKey,
  case_id,
  caseContent,
}) => {
  const [conditionForm] = Form.useForm();
  const [choiceGroupOpen, setChoiceGroupOpen] = useState(false);
  const [choiceOpen, setChoiceOpen] = useState(false);
  const [conditionAPI, setConditionAPI] = useState<IInterfaceAPI[]>([]);
  const actionRef = useRef<ActionType>(); //Table action 的引用，便于自定义触发
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

  const onSaveInfo = async () => {
    const values = await conditionForm.validateFields();
    const { code, data, msg } = await updateConditionContentInfo({
      id: caseContent.target_id,
      ...values,
    });
    if (code === 0) {
      conditionForm.setFieldsValue(data);
      message.success(msg);
    }
  };
  const handleDragSortEnd = async (
    beforeIndex: number,
    afterIndex: number,
    newDataSource: IInterfaceAPI[],
  ) => {
    console.log('排序后的数据', newDataSource);
    setConditionAPI(newDataSource);
    const reorderIds: number[] = newDataSource.map((item) => item.id);
    const { code } = await reorderAssociationAPI({
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
      width: '5%',
    },
    {
      title: '接口编号',
      dataIndex: 'uid',
      key: 'uid',
      width: '10%',
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
      width: '15%',
    },
    {
      title: '优先级',
      dataIndex: 'level',
      valueType: 'select',
      valueEnum: CONFIG.API_LEVEL_ENUM,
      width: '10%',
      render: (_, record) => {
        return <Tag color={'blue'}>{record.level}</Tag>;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueType: 'select',
      width: '10%',
      valueEnum: CONFIG.API_STATUS_ENUM,
      render: (_, record) => {
        return CONFIG.API_STATUS_ENUM[record.status].tag;
      },
    },
    {
      title: '创建人',
      dataIndex: 'creatorName',
      width: '10%',
      render: (_, record) => {
        return <Tag>{record.creatorName}</Tag>;
      },
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      width: '10%',
      render: (_, record) => {
        return (
          <a onClick={async () => await removeAssociation(record.id)}>移除</a>
        );
      },
    },
  ];

  const items: MenuProps['items'] = [
    // {
    //   key: 'choice_group',
    //   label: '选择公共组',
    //   icon: <UngroupOutlined style={{ color: 'blue' }} />,
    //   onClick: () => setChoiceGroupOpen(true),
    // },
    {
      key: 'choice_common',
      label: '选择公共API',
      icon: <SelectOutlined style={{ color: 'blue' }} />,
      onClick: () => setChoiceOpen(true),
    },
  ];

  const formRender = (
    <ProForm form={conditionForm} submitter={false} style={{ padding: 30 }}>
      <Space>
        判断条件
        <ProFormText
          noStyle
          name={'condition_key'}
          placeholder={'条件值，支持{{变量名}}'}
          rules={[{ required: true, message: '变量名不能为空 !' }]}
          required={true}
          fieldProps={{
            onChange: (e: any) => {
              setKey(e.target.value);
            },
          }}
        />
        <ProFormSelect
          noStyle
          name={'condition_operator'}
          required={true}
          initialValue={1}
          rules={[{ required: true, message: '条件不能为空 !' }]}
          onChange={(_: any, option: any) => {
            setOperator(option.label);
            if (option.value === 3 || option.value === 4) {
              setShowValueInput(false);
            } else {
              setShowValueInput(true);
            }
          }}
          options={[
            { label: '等于', value: 1 },
            { label: '不等于', value: 2 },
            { label: '为空', value: 3 },
            { label: '不为空', value: 4 },
            { label: '大于', value: 5 },
            { label: '小于', value: 6 },
          ]}
        />
        {showValueInput && (
          <ProFormText
            noStyle
            placeholder={'输入比较值'}
            name={'condition_value'}
            rules={[{ required: true, message: '比较值不能为空 !' }]}
            fieldProps={{
              onChange: (e: any) => {
                setValue(e.target.value);
              },
            }}
          />
        )}
      </Space>
    </ProForm>
  );

  return (
    <>
      <ProCard
        actions={
          <Dropdown arrow menu={{ items }} placement="top">
            <Button>添加</Button>
          </Dropdown>
        }
      >
        <DragSortTable
          actionRef={actionRef}
          toolBarRender={() => [<a onClick={onSaveInfo}>保存</a>]}
          headerTitle={formRender}
          columns={columns}
          options={false}
          rowKey="id"
          request={fetchConditionAPIS}
          search={false}
          pagination={false}
          dataSource={conditionAPI}
          dragSortKey="sort"
          onDragSortEnd={handleDragSortEnd}
        />
      </ProCard>
      <MyDrawer
        width={'75%'}
        name={''}
        open={showAPIDetail}
        setOpen={setShowAPIDetail}
      >
        <InterfaceApiDetail interfaceId={currentApiId} callback={() => {}} />;
      </MyDrawer>
      <MyDrawer name={''} open={choiceGroupOpen} setOpen={setChoiceGroupOpen}>
        <GroupApiChoiceTable
          projectId={projectId}
          refresh={refresh}
          currentCaseId={case_id.toString()}
          condition_api_id={caseContent.id}
        />
      </MyDrawer>
      <MyDrawer name={''} open={choiceOpen} setOpen={setChoiceOpen}>
        <InterfaceCaseChoiceApiTable
          projectId={projectId}
          currentCaseApiId={case_id.toString()}
          condition_id={caseContent.target_id}
          refresh={refresh}
        />
      </MyDrawer>
    </>
  );
};

export default ApiCondition;

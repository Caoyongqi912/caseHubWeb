import { IUser } from '@/api';
import { pageUsers, removeUser, updateUser } from '@/api/base';
import { queryDepart, queryDepartTags } from '@/api/base/depart';
import MyProTable from '@/components/Table/MyProTable';
import AddUser from '@/components/UserOpt/AddUser';
import { IDepart, IDepartTag } from '@/pages/User/Depart/depart';
import { pageData } from '@/utils/somefunc';
import {
  ActionType,
  ProColumns,
  ProFormSelect,
} from '@ant-design/pro-components';
import { Avatar, message, Space, Tag } from 'antd';
import React, { useEffect, useRef, useState } from 'react';

interface Props {
  projectId?: number;
}

const Index: React.FC<Props> = ({ projectId }) => {
  const actionRef = useRef<ActionType>(); //Table action 的引用，便于自定义触发
  const [departmentOptions, setDepartmentOptions] =
    useState<{ label: string; value: number }[]>();
  const [departmentEnums, setDepartmentEnums] = useState<{
    [key: number]: string;
  }>();

  const [currentDepartId, setCurrentDepartId] = useState<number>();
  const departIdToNameMap = useRef(new Map());
  const [tagEnum, setTagEnum] = useState<{ [key: string]: string }>();
  useEffect(() => {
    if (currentDepartId) {
      console.log(currentDepartId);
      queryDepartTags(currentDepartId).then(async ({ code, data }) => {
        if (code === 0) {
          setTagEnum(
            data.reduce((acc: any, obj: IDepartTag) => {
              acc[obj.tag_name] = obj.tag_name;
              return acc;
            }, {}),
          );
        }
      });
    }
  }, [currentDepartId]);
  useEffect(() => {
    queryDepart().then(({ code, data }) => {
      if (code === 0) {
        const options = data.map((user: IDepart) => ({
          label: user.name,
          value: user.id,
        }));
        const mapData = data.reduce((acc: any, obj: any) => {
          acc[obj.id] = { text: obj.name };
          // 缓存映射关系
          departIdToNameMap.current.set(obj.id, obj.name);
          return acc;
        }, {});
        setDepartmentOptions(options);
        setDepartmentEnums(mapData);
      }
    });
  }, []);

  const fetchUsers = async (params: any, sort: any) => {
    const searchInfo: any = {
      ...params,
      sort: sort,
    };

    const { code, data } = await pageUsers(searchInfo);
    return pageData(code, data);
  };

  const onSave = async (_: any, record: IUser) => {
    const value = {
      username: record.username,
      phone: record.phone,
      depart_id: record.depart_id,
      depart_name: departIdToNameMap.current.get(record.depart_id),
    };
    console.log(value);
    const { code } = await updateUser(record);
    if (code === 0) {
      reload();
    }
  };

  const reload = () => {
    actionRef.current?.reload();
  };

  const onDelete = async (_: any, record: IUser) => {
    const { code, msg } = await removeUser(record.id!);
    if (code === 0) {
      message.success(msg);
      if (code === 0) {
        actionRef.current?.reload();
      }
    }
  };
  const isReload = (value: boolean) => {
    if (value) {
      actionRef.current?.reload();
    }
  };

  const columns: ProColumns<IUser>[] = [
    {
      title: 'username',
      copyable: true,
      dataIndex: 'username',
      ellipsis: true, //是否自动缩略
      render: (text: any, record: IUser) => {
        return (
          <Space>
            <Avatar src={record.avatar}>
              {record.username ? record.username[0] : null}
            </Avatar>
            {record.username}
          </Space>
        );
      },
      formItemProps: {
        rules: [
          {
            required: true,
            message: '此项为必填项',
          },
        ],
      },
    },
    {
      title: '电话',
      dataIndex: 'phone',
      ellipsis: true, //是否自动缩略
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      ellipsis: true, //是否自动缩略
      editable: false,
    },
    {
      title: '部门',
      dataIndex: 'depart_id',
      valueType: 'select',
      valueEnum: departmentEnums,
      render: (text, record) => {
        return (
          departIdToNameMap.current.get(record.depart_id) || record.depart_id
        );
      },
      renderFormItem: (item, { type, defaultRender, ...rest }, form) => {
        if (type === 'form') {
          return (
            <ProFormSelect
              noStyle
              name="depart_id"
              placeholder="请选择部门"
              options={departmentOptions}
              fieldProps={{
                showSearch: true,
                optionFilterProp: 'label',
                onChange: (value, option) => {
                  console.log(value, option);
                  setCurrentDepartId(value as number);
                  const depart_name =
                    departIdToNameMap.current.get(value) || '';
                  // 直接设置表单字段值
                  form.setFieldValue('depart_name', depart_name);
                },
              }}
            />
          );
        }
        return defaultRender(item);
      },
    },
    {
      dataIndex: 'depart_name',
      hideInTable: true, // 在表格中隐藏，只在编辑时使用
      hideInSearch: true,
      editable: false, // 不可直接编辑，通过 admin_id 变化自动更新
    },
    {
      title: 'tag',
      dataIndex: 'tagName',
      valueType: 'select',
      search: false,
      valueEnum: tagEnum,
      render: (text) => {
        return <Tag color={'blue'}>{text}</Tag>;
      },
    },
    {
      title: '创建时间',
      key: 'showTime',
      dataIndex: 'create_time',
      valueType: 'dateTime',
      sorter: true,
      hideInSearch: true,
      editable: false,
    },
    {
      title: '更新时间',
      key: 'showTime',
      dataIndex: 'update_time',
      valueType: 'dateTime',
      sorter: true,
      hideInSearch: true,
      editable: false,
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      fixed: 'right',
      width: '8%',
      render: (text, record, _, action) => [
        <a
          key="editable"
          onClick={async () => {
            setCurrentDepartId(record.depart_id);
            action?.startEditable?.(record.uid);
          }}
        >
          编辑
        </a>,
      ],
    },
  ];

  return (
    <MyProTable
      headerTitle={'用户表'}
      columns={columns}
      actionRef={actionRef}
      request={fetchUsers}
      rowKey={'uid'}
      onDelete={onDelete}
      onSave={onSave}
      toolBarRender={() => [<AddUser reload={isReload} />]}
    />
  );
};

export default Index;

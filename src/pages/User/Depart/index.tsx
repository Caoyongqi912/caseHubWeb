import { IUser } from '@/api';
import { queryUser } from '@/api/base';
import { pageDepart, removeDepart, updateDepart } from '@/api/base/depart';
import MyProTable from '@/components/Table/MyProTable';
import AddDepart from '@/pages/User/Depart/AddDepart';
import { IDepart } from '@/pages/User/Depart/depart';
import DepartTags from '@/pages/User/Depart/DepartTags';
import { pageData } from '@/utils/somefunc';
import { useModel } from '@@/exports';
import {
  ActionType,
  ProColumns,
  ProFormSelect,
} from '@ant-design/pro-components';
import { useCallback, useEffect, useRef, useState } from 'react';

const Index = () => {
  const actionRef = useRef<ActionType>();
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState ?? {};
  const [userOptions, setUserOptions] = useState<any[]>([]);
  const userIdToNameMap = useRef(new Map());
  const [users, setUsers] = useState<any>();
  const fetchDeparts = useCallback(async (values: any) => {
    const { code, data } = await pageDepart(values);
    return pageData(code, data);
  }, []);

  const fetchUser: any = async () => {
    const { code, data } = await queryUser();
    if (code === 0) {
      // 创建 valueEnum
      const mapData = data.reduce((acc: any, obj: any) => {
        acc[obj.id] = { text: obj.username };
        // 缓存映射关系
        userIdToNameMap.current.set(obj.id, obj.username);
        return acc;
      }, {});
      setUsers(mapData);
      // 创建选项数据用于 ProFormSelect
      const options = data.map((user: IUser) => ({
        label: user.username,
        value: user.id,
      }));
      setUserOptions(options);
    }
  };
  useEffect(() => {
    fetchUser();
  }, []);
  const reload = () => {
    actionRef.current?.reload();
  };
  const columns: ProColumns<IDepart>[] = [
    {
      title: '部门',
      dataIndex: 'name',
    },
    {
      title: '描述',
      dataIndex: 'description',
      valueType: 'textarea',
      search: true,
      fieldProps: {
        rows: 1,
      },
    },
    {
      title: '负责人',
      dataIndex: 'admin_id',
      valueType: 'select',
      valueEnum: users,
      // 编辑时显示用户名而不是ID
      render: (text, record) => {
        return userIdToNameMap.current.get(record.admin_id) || record.admin_id;
      },
      fieldProps: {
        showSearch: true,
      },
      formItemRender: (item, { type, defaultRender, ...rest }, form) => {
        if (type === 'form') {
          return (
            <ProFormSelect
              noStyle
              name="admin_id"
              placeholder="请选择部门管理员"
              options={userOptions}
              fieldProps={{
                showSearch: true,
                optionFilterProp: 'label',
                onChange: (value) => {
                  const adminName = userIdToNameMap.current.get(value) || '';
                  // 直接设置表单字段值
                  form.setFieldValue('admin_name', adminName);
                },
              }}
            />
          );
        }
        return defaultRender(item);
      },
    },
    {
      title: '负责人名',
      dataIndex: 'admin_name',
      valueType: 'select',
      hideInTable: true, // 在表格中隐藏，只在编辑时使用
      search: true,
      editable: false, // 不可直接编辑，通过 admin_id 变化自动更新
    },
    {
      title: '操作',
      valueType: 'option',
      width: '10%',
      render: (text, record, _, action) => [
        <>
          {(currentUser?.isAdmin || currentUser?.id === record.admin_id) && (
            <a
              key="editable"
              onClick={() => {
                action?.startEditable?.(record.uid);
              }}
            >
              编辑
            </a>
          )}
        </>,
      ],
    },
  ];

  const tagArea = (record: IDepart) => {
    return <DepartTags depart_id={record.id} />;
  };
  return (
    <MyProTable
      columns={columns}
      // @ts-ignore
      expandedRowRender={tagArea}
      x={1000}
      actionRef={actionRef}
      request={fetchDeparts}
      rowKey={'uid'}
      onSave={async (_: any, record: IDepart) => {
        const { code } = await updateDepart(record);
        if (code === 0) {
          reload();
          return true;
        }
      }}
      onDelete={async (id: number, record: IDepart) => {
        const { code } = await removeDepart({ id: id });
        if (code === 0) {
          reload();
          return true;
        }
      }}
      toolBarRender={() => [<AddDepart callback={reload} />]}
    />
  );
};

export default Index;

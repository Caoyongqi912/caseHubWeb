import MohuSearch from '@/components/UserOpt/MohuSearch';
import { PlusOutlined } from '@ant-design/icons';
import {
  ModalForm,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { Button } from 'antd';
import React from 'react';

interface selfProps {
  reload: Function | undefined;
}

const AddDepartment: React.FC<selfProps> = (props) => {
  let { reload } = props;

  return (
    <ModalForm<{
      name: string;
      desc: string;
      adminID: number;
      tags: Array<string>;
    }>
      title="添加部门"
      trigger={
        <Button type={'primary'}>
          <PlusOutlined />
          添加部门
        </Button>
      }
      autoFocusFirstInput
      // onFinish={async (values: IDepartment) => {
      //   const res = await departmentOpt(values, 'POST');
      //   message.success(res.msg);
      //   reload!(true);
      //   return true;
      // }}
    >
      <ProFormText
        name="name"
        label="部门名称"
        placeholder="input username"
        required={true}
      />
      <ProFormText
        name="desc"
        label="描述"
        placeholder="input username"
        required={false}
      />
      <ProFormSelect
        showSearch
        name="adminID"
        label="项目负责人"
        placeholder="input your admin name to search"
        rules={[{ required: false, message: 'Please select !' }]}
        debounceTime={2000}
        request={async (values) => {
          return await MohuSearch(values);
        }}
      />
      <ProFormSelect
        name="tags"
        label="标签"
        placeholder="input tags"
        mode="tags"
        required={false}
      />
    </ModalForm>
  );
};

export default AddDepartment;

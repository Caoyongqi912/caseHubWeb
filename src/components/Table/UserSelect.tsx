import { searchUser } from '@/api/base';
import { ProFormSelect } from '@ant-design/pro-components';
import { Spin } from 'antd';
import { useState } from 'react';

// 远程搜索 Select 组件
const UserSelect = () => {
  const [fetching, setFetching] = useState(false);
  const queryUser: any = async (value: any) => {
    const { keyWords } = value;
    if (keyWords) {
      const { code, data } = await searchUser({ username: keyWords });
      if (code === 0) {
        setFetching(false);
        return data.map((item) => ({
          avatar: item.avatar,
          label: item.username,
          value: item.id,
        }));
      }
    }
  };

  return (
    <ProFormSelect
      fieldProps={{
        optionFilterProp: 'label',
        labelInValue: false,
        notFoundContent: fetching ? <Spin size="small" /> : 'No results found',
        optionItemRender: (item: any) => {
          return (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {item.label}
            </div>
          );
        },
      }}
      showSearch
      request={queryUser}
      debounceTime={500}
    />
  );
};

export default UserSelect;

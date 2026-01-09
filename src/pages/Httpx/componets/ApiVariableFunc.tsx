import { IUserVar } from '@/api';
import { queryUserVars } from '@/api/base';
import {
  queryInterGlobalFunc,
  queryInterGlobalVariable,
} from '@/api/inter/interGlobal';
import MyTabs from '@/components/MyTabs';
import VarModalForm from '@/pages/Httpx/InterfaceConfig/VarModalForm';
import {
  IInterfaceGlobalFunc,
  IInterfaceGlobalVariable,
} from '@/pages/Httpx/types';
import { GoogleSquareFilled, SearchOutlined } from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import { Button, Popover, Select, Space, Typography } from 'antd';
import React, { FC, useEffect, useState } from 'react';

interface ISelfProps {
  value?: string | undefined;
  setValue?: ((rowIndex: string | number, data: any) => void) | undefined;
  index?: React.Key | undefined;
}

const ApiVariableFunc: FC<ISelfProps> = ({ value, index, setValue }) => {
  const [open, setOpen] = useState(false);
  const [currentActiveKey, setCurrentActiveKey] = useState<string>('1');
  const [currentValue, setCurrentValue] = useState<IInterfaceGlobalFunc>();
  const [currentData, setCurrentData] = useState<IInterfaceGlobalVariable>();
  const [currentMyData, setCurrentMyData] = useState<IUserVar>();
  const [selectValue, setSelectValue] = useState<string>();
  const [funcData, setFuncData] = useState<any[]>([]);
  const [varData, setVarData] = useState<any[]>([]);
  const [myData, setMyData] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const fetch_func_data = async () => {
    queryInterGlobalFunc().then(async ({ code, data }) => {
      if (code === 0) {
        const func = data.map((item: IInterfaceGlobalFunc) => {
          return {
            label: (
              <Typography.Text
                onMouseEnter={() => {
                  setCurrentValue(item);
                }}
              >
                <Typography.Text>
                  <Space size={'small'}>
                    <GoogleSquareFilled style={{ color: 'blue' }} />
                    {item.label}
                  </Space>
                </Typography.Text>
              </Typography.Text>
            ),
            value: item.value,
            desc: item.description,
          };
        });
        setFuncData(func);
      }
    });
  };
  const fetch_var_data = async () => {
    queryInterGlobalVariable().then(async ({ code, data }) => {
      if (code === 0) {
        const var_data = data.map((item: IInterfaceGlobalVariable) => {
          return {
            label: (
              <span
                onMouseEnter={(event) => {
                  event.stopPropagation();
                  setCurrentData(item);
                }}
              >
                <Space>
                  <GoogleSquareFilled style={{ color: 'blue' }} />
                  {item.key}
                </Space>
              </span>
            ),
            value: `{{$g_${item.key}}}`,
          };
        });
        setVarData(var_data);
      }
    });
  };
  const fetch_my_var_data = async () => {
    queryUserVars().then(async ({ code, data }) => {
      if (code === 0) {
        const value = data.map((item: IUserVar) => {
          return {
            label: (
              <span
                onMouseEnter={(event) => {
                  event.stopPropagation();
                  setCurrentMyData(item);
                }}
              >
                <Space>
                  <GoogleSquareFilled style={{ color: 'blue' }} />
                  {item.key}
                </Space>
              </span>
            ),
            id: item.id,
            key: item.key,
            value: item.value,
          };
        });
        setMyData(value);
      }
    });
  };

  useEffect(() => {
    Promise.all([
      fetch_func_data(),
      fetch_var_data(),
      fetch_my_var_data(),
    ]).then(() => {});
  }, [refresh]);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };
  const renderContentPanel = (data: any, type: 'func' | 'var' | 'my') => (
    <ProCard bodyStyle={{ padding: 5 }}>
      {data && (
        <Space direction="vertical" size="middle">
          <Typography.Text type="secondary">
            {type === 'func' ? '表达式' : '变量名'}
          </Typography.Text>
          <Typography.Text code copyable>
            {type === 'func' ? selectValue : data.key}
          </Typography.Text>
          <Typography.Text type="secondary">变量值</Typography.Text>
          <Typography.Text code ellipsis={{ tooltip: data.value }}>
            {data.value?.length > 40
              ? `${data.value.substring(0, 40)}...`
              : data.value}
          </Typography.Text>
          {type === 'func' && (
            <>
              <Typography.Text type="secondary">描述</Typography.Text>
              <Typography.Text>{data.description}</Typography.Text>
            </>
          )}
        </Space>
      )}
    </ProCard>
  );
  const renderDetailPanel = (data: any, type: 'func' | 'var' | 'my') => (
    <ProCard bodyStyle={{ padding: 5 }}>
      {data && (
        <Space direction="vertical" size="small">
          <Typography.Text type="secondary">变量名</Typography.Text>
          <Typography.Text code>{data.label || data.key}</Typography.Text>
          <Typography.Text type="secondary">变量值</Typography.Text>
          <Typography.Text code ellipsis={true}>
            {type === 'func'
              ? data.description
              : data.description?.length > 15
              ? `${data.description.substring(0, 15)}...`
              : data.description}
            {type === 'var'
              ? data.value
              : data.value?.length > 15
              ? `${data.value.substring(0, 15)}...`
              : data.value}
          </Typography.Text>
          {type === 'func' && (
            <>
              <Typography.Text type="secondary">预览</Typography.Text>
              <Typography.Text code>{data.demo}</Typography.Text>
            </>
          )}
        </Space>
      )}
    </ProCard>
  );
  const items = [
    {
      key: '1',
      label: '引用变量',
      children: (
        <ProCard split={'horizontal'}>
          <ProCard bodyStyle={{ padding: 5 }}>
            <Select
              allowClear
              showSearch
              onChange={(value) => {
                setSelectValue(value);
              }}
              onClear={() => {
                setSelectValue(undefined);
                setCurrentValue(undefined);
              }}
              options={funcData}
              dropdownRender={(menu) => (
                <>
                  <ProCard split={'vertical'}>
                    <ProCard bodyStyle={{ padding: 0 }}>{menu}</ProCard>
                    {renderDetailPanel(currentValue, 'func')}
                  </ProCard>
                </>
              )}
            />
          </ProCard>
          {renderContentPanel(currentValue, 'func')}
        </ProCard>
      ),
    },
    {
      key: '2',
      label: '固定值',
      children: (
        <ProCard split={'horizontal'} bodyStyle={{ minHeight: 100 }}>
          <ProCard bodyStyle={{ padding: 5 }}>
            <Select
              allowClear
              showSearch
              onChange={(value) => {
                setSelectValue(value);
              }}
              onClear={() => {
                setSelectValue(undefined);
                setCurrentData(undefined);
              }}
              options={varData}
              dropdownRender={(menu) => (
                <>
                  <ProCard split={'vertical'}>
                    <ProCard bodyStyle={{ padding: 0 }}>{menu}</ProCard>
                    {renderDetailPanel(currentData, 'var')}
                  </ProCard>
                </>
              )}
            />
          </ProCard>
          {renderContentPanel(currentData, 'var')}
        </ProCard>
      ),
    },
    {
      key: '3',
      label: '我的',
      children: (
        <ProCard split={'horizontal'} bodyStyle={{ minHeight: 100 }}>
          <ProCard bodyStyle={{ padding: 5 }}>
            <Select
              allowClear
              showSearch
              autoFocus
              onChange={(value) => {
                setSelectValue(value);
              }}
              onClear={() => {
                setSelectValue(undefined);
                setCurrentMyData(undefined);
              }}
              options={myData}
              dropdownRender={(menu) => (
                <>
                  <ProCard split={'vertical'}>
                    <ProCard bodyStyle={{ padding: 0 }}>{menu}</ProCard>
                    {renderDetailPanel(currentMyData, 'my')}
                  </ProCard>
                </>
              )}
            />
          </ProCard>
          {renderContentPanel(currentMyData, 'my')}
        </ProCard>
      ),
    },
  ];
  const Content = (
    <ProCard split="horizontal" style={{ height: 'auto', width: 450 }}>
      <MyTabs
        items={items}
        defaultActiveKey={currentActiveKey}
        onChangeKey={(key) => setCurrentActiveKey(key)}
      />
      <ProCard style={{ marginTop: 20, padding: '10px 0' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {selectValue && (
            <Space>
              <Button
                onClick={() => {
                  if (selectValue && index) {
                    setValue?.(index, { value: selectValue });
                  }
                  setOpen(false);
                }}
              >
                添加
              </Button>
              <Button
                onClick={() => {
                  if (selectValue && index) {
                    if (value) {
                      setValue?.(index, { value: value + selectValue });
                    } else {
                      setValue?.(index, { value: selectValue });
                    }
                  }
                  setOpen(false);
                }}
              >
                插入
              </Button>
            </Space>
          )}
          {currentActiveKey === '2' && (
            <Button
              type="primary"
              onClick={() => {
                setIsModalOpen(true);
              }}
            >
              新增
            </Button>
          )}
        </div>
      </ProCard>
    </ProCard>
  );

  return (
    <>
      <VarModalForm
        open={isModalOpen}
        setOpen={setIsModalOpen}
        callBack={() => setRefresh(!refresh)}
      />
      <Popover
        content={Content}
        trigger="click"
        open={open}
        onOpenChange={handleOpenChange}
        style={{ borderRadius: 8 }}
      >
        <SearchOutlined style={{ color: '#1890ff' }} />
      </Popover>
    </>
  );
};
export default ApiVariableFunc;

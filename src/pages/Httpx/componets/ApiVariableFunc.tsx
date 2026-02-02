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

const { Text } = Typography;

interface ISelfProps {
  value?: string | undefined;
  setValue?: ((rowIndex: string | number, data: any) => void) | undefined;
  index?: React.Key | undefined;
}

/**
 * 公共样式配置
 */
const commonStyles = {
  cardBody: {
    padding: '8px',
  },
  cardBodyCompact: {
    padding: '4px',
  },
  cardBodyMinimal: {
    padding: 0,
  },
  popover: {
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },
  button: {
    borderRadius: '6px',
    transition: 'all 0.3s ease',
  },
  buttonPrimary: {
    borderRadius: '6px',
    boxShadow: '0 2px 0 rgba(24, 144, 255, 0.2)',
    transition: 'all 0.3s ease',
  },
  icon: {
    color: '#1890ff',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  iconHover: {
    color: '#40a9ff',
    transform: 'scale(1.1)',
  },
  label: {
    color: '#8c8c8c',
    fontSize: '12px',
    marginBottom: '4px',
  },
  code: {
    fontSize: '12px',
    padding: '4px 8px',
    backgroundColor: '#f5f5f5',
    borderRadius: '4px',
    fontFamily: 'monospace',
  },
  googleIcon: {
    color: '#1890ff',
    fontSize: '14px',
  },
};

/**
 * API变量和函数选择组件
 * 用于快速插入变量、函数和自定义变量到接口参数中
 */
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

  /**
   * 通用数据获取函数
   * 减少代码冗余，统一数据处理逻辑
   */
  const fetchData = async <T,>(
    fetchFn: () => Promise<any>,
    mapper: (item: T) => any,
    setter: (data: any[]) => void,
  ) => {
    try {
      const { code, data } = await fetchFn();
      if (code === 0 && data) {
        const mappedData = data.map(mapper);
        setter(mappedData);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  /**
   * 获取函数数据
   */
  const fetch_func_data = async () => {
    fetchData(
      queryInterGlobalFunc,
      (item: IInterfaceGlobalFunc) => ({
        label: (
          <Text
            onMouseEnter={() => {
              setCurrentValue(item);
            }}
            style={{
              cursor: 'pointer',
            }}
          >
            <Space size={'small'}>
              <GoogleSquareFilled style={commonStyles.googleIcon} />
              {item.label}
            </Space>
          </Text>
        ),
        value: item.value,
        desc: item.description,
      }),
      setFuncData,
    );
  };

  /**
   * 获取变量数据
   */
  const fetch_var_data = async () => {
    fetchData(
      queryInterGlobalVariable,
      (item: IInterfaceGlobalVariable) => ({
        label: (
          <span
            onMouseEnter={(event) => {
              event.stopPropagation();
              setCurrentData(item);
            }}
            style={{
              cursor: 'pointer',
            }}
          >
            <Space>
              <GoogleSquareFilled style={commonStyles.googleIcon} />
              {item.key}
            </Space>
          </span>
        ),
        value: `{{$g_${item.key}}}`,
      }),
      setVarData,
    );
  };

  /**
   * 获取用户自定义变量数据
   */
  const fetch_my_var_data = async () => {
    fetchData(
      queryUserVars,
      (item: IUserVar) => ({
        label: (
          <span
            onMouseEnter={(event) => {
              event.stopPropagation();
              setCurrentMyData(item);
            }}
            style={{
              cursor: 'pointer',
            }}
          >
            <Space>
              <GoogleSquareFilled style={commonStyles.googleIcon} />
              {item.key}
            </Space>
          </span>
        ),
        id: item.id,
        key: item.key,
        value: item.value,
      }),
      setMyData,
    );
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

  /**
   * 渲染内容面板
   * 统一渲染逻辑，减少代码重复
   */
  const renderContentPanel = (data: any, type: 'func' | 'var' | 'my') => (
    <ProCard bodyStyle={commonStyles.cardBodyCompact}>
      {data && (
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <Text style={commonStyles.label}>
            {type === 'func' ? '表达式' : '变量名'}
          </Text>
          <Text code copyable style={commonStyles.code}>
            {type === 'func' ? selectValue : data.key}
          </Text>
          <Text style={commonStyles.label}>变量值</Text>
          <Text
            code
            ellipsis={{ tooltip: data.value }}
            style={commonStyles.code}
          >
            {data.value?.length > 40
              ? `${data.value.substring(0, 40)}...`
              : data.value}
          </Text>
          {type === 'func' && (
            <>
              <Text style={commonStyles.label}>描述</Text>
              <Text>{data.description}</Text>
            </>
          )}
        </Space>
      )}
    </ProCard>
  );

  /**
   * 渲染详情面板
   * 统一渲染逻辑，减少代码重复
   */
  const renderDetailPanel = (data: any, type: 'func' | 'var' | 'my') => (
    <ProCard bodyStyle={commonStyles.cardBodyCompact}>
      {data && (
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <Text style={commonStyles.label}>变量名</Text>
          <Text code style={commonStyles.code}>
            {data.label || data.key}
          </Text>
          <Text style={commonStyles.label}>变量值</Text>
          <Text
            code
            ellipsis={{
              tooltip: type === 'func' ? data.description : data.value,
            }}
            style={commonStyles.code}
          >
            {type === 'func'
              ? data.description
              : type === 'var'
              ? data.value
              : data.value?.length > 15
              ? `${data.value.substring(0, 15)}...`
              : data.value}
          </Text>
          {type === 'func' && (
            <>
              <Text style={commonStyles.label}>预览</Text>
              <Text code style={commonStyles.code}>
                {data.demo}
              </Text>
            </>
          )}
        </Space>
      )}
    </ProCard>
  );

  /**
   * 创建选择器配置
   * 统一选择器配置，减少代码重复
   */
  const createSelectConfig = (
    options: any[],
    currentData: any,
    setCurrentData: (data: any) => void,
    type: 'func' | 'var' | 'my',
  ) => ({
    allowClear: true,
    showSearch: true,
    placeholder: '请选择',
    style: { width: '100%' },
    onChange: (value: string) => {
      setSelectValue(value);
    },
    onClear: () => {
      setSelectValue(undefined);
      setCurrentData(undefined);
    },
    options,
    dropdownRender: (menu: React.ReactNode) => (
      <ProCard split={'vertical'} style={{ minWidth: '400px' }}>
        <ProCard bodyStyle={commonStyles.cardBodyMinimal}>{menu}</ProCard>
        {renderDetailPanel(currentData, type)}
      </ProCard>
    ),
  });
  const items = [
    {
      key: '1',
      label: '引用变量',
      children: (
        <ProCard split={'horizontal'}>
          <ProCard bodyStyle={commonStyles.cardBodyCompact}>
            <Select
              {...createSelectConfig(
                funcData,
                currentValue,
                setCurrentValue,
                'func',
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
          <ProCard bodyStyle={commonStyles.cardBodyCompact}>
            <Select
              {...createSelectConfig(
                varData,
                currentData,
                setCurrentData,
                'var',
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
          <ProCard bodyStyle={commonStyles.cardBodyCompact}>
            <Select
              {...createSelectConfig(
                myData,
                currentMyData,
                setCurrentMyData,
                'my',
              )}
              autoFocus={true}
            />
          </ProCard>
          {renderContentPanel(currentMyData, 'my')}
        </ProCard>
      ),
    },
  ];

  /**
   * 渲染主内容区域
   */
  const Content = (
    <ProCard
      split="horizontal"
      style={{
        height: 'auto',
        width: 480,
        maxWidth: '90vw',
      }}
    >
      <MyTabs
        items={items}
        defaultActiveKey={currentActiveKey}
        onChangeKey={(key) => setCurrentActiveKey(key)}
      />
      <ProCard style={{ marginTop: 20, padding: '12px 0' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
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
                style={commonStyles.button}
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
                style={commonStyles.button}
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
              style={commonStyles.buttonPrimary}
            >
              新增
            </Button>
          )}
        </div>
      </ProCard>
    </ProCard>
  );

  /**
   * 渲染触发按钮
   */
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
        overlayStyle={commonStyles.popover}
        placement="bottomRight"
      >
        <SearchOutlined
          style={commonStyles.icon}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = commonStyles.iconHover.color;
            e.currentTarget.style.transform = commonStyles.iconHover.transform;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = commonStyles.icon.color;
            e.currentTarget.style.transform = 'scale(1)';
          }}
        />
      </Popover>
    </>
  );
};
export default ApiVariableFunc;

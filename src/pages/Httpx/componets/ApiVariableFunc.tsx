import {
  queryInterGlobalFunc,
  queryInterGlobalVariable,
} from '@/api/inter/interGlobal';
import MyTabs from '@/components/MyTabs';
import {
  IInterfaceGlobalFunc,
  IInterfaceGlobalVariable,
} from '@/pages/Httpx/types';
import { GoogleSquareFilled, SearchOutlined } from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import { Button, Popover, Select, Space, Typography } from 'antd';
import Title from 'antd/es/typography/Title';
import React, { FC, useEffect, useState } from 'react';

interface ISelfProps {
  value?: string | undefined;
  setValue?: ((rowIndex: string | number, data: any) => void) | undefined;
  index?: React.Key | undefined;
}

const ApiVariableFunc: FC<ISelfProps> = ({ value, index, setValue }) => {
  const [open, setOpen] = useState(false);
  const [currentValue, setCurrentValue] = useState<IInterfaceGlobalFunc>();
  const [currentData, setCurrentData] = useState<IInterfaceGlobalVariable>();
  const [selectValue, setSelectValue] = useState<string>();
  const [funcData, setFuncData] = useState<any[]>([]);
  const [varData, setVarData] = useState<any[]>([]);

  useEffect(() => {
    queryInterGlobalFunc().then(async ({ code, data }) => {
      if (code === 0) {
        const func = data.map((item: IInterfaceGlobalFunc) => {
          return {
            label: (
              <span
                onMouseEnter={() => {
                  setCurrentValue(item);
                }}
              >
                <GoogleSquareFilled style={{ color: 'blue' }} />
                {item.label}
              </span>
            ),
            value: item.value,
          };
        });
        setFuncData(func);
      }
    });
    queryInterGlobalVariable().then(async ({ code, data }) => {
      if (code === 0) {
        const func = data.map((item: IInterfaceGlobalVariable) => {
          return {
            label: (
              <span
                onMouseEnter={() => {
                  setCurrentData(item);
                }}
              >
                <GoogleSquareFilled style={{ color: 'blue' }} />
                {item.key}
              </span>
            ),
            value: `{{${item.key}}}`,
          };
        });
        setVarData(func);
      }
    });
  }, []);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  const items = [
    {
      key: '1',
      label: 'Func',
      children: (
        <ProCard split={'horizontal'}>
          <ProCard bodyStyle={{ padding: 5 }}>
            <Select
              allowClear
              showSearch
              listHeight={180}
              autoFocus
              onChange={(value) => {
                setSelectValue(value);
              }}
              style={{ width: 500 }}
              options={funcData}
              dropdownRender={(menu) => (
                <>
                  <ProCard split={'vertical'}>
                    <ProCard bodyStyle={{ padding: 0 }}>{menu}</ProCard>
                    <ProCard bodyStyle={{ padding: 5 }}>
                      {currentValue && (
                        <Space direction="vertical">
                          <Typography.Text type={'secondary'}>
                            变量名
                          </Typography.Text>
                          <Typography.Text code>
                            {currentValue.label}
                          </Typography.Text>
                          <Typography.Text type={'secondary'}>
                            变量值
                          </Typography.Text>
                          <Typography.Text code>
                            {currentValue?.value}
                          </Typography.Text>
                          <Typography.Text type={'secondary'}>
                            预览
                          </Typography.Text>
                          <Typography.Text code>
                            {currentValue?.demo}
                          </Typography.Text>
                        </Space>
                      )}
                    </ProCard>
                  </ProCard>
                </>
              )}
            />
          </ProCard>
          <ProCard bodyStyle={{ padding: 5 }}>
            <Space
              direction={'vertical'}
              style={{
                width: '100%',
                marginTop: 20,
              }}
            >
              <Typography.Text type={'secondary'}>表达式</Typography.Text>
              <Typography.Text code copyable>
                {selectValue}
              </Typography.Text>
              <Typography.Text type={'secondary'}>预览</Typography.Text>
              <Typography.Text code>{currentValue?.demo}</Typography.Text>
            </Space>
          </ProCard>
        </ProCard>
      ),
    },
    {
      key: '2',
      label: 'Var',
      children: (
        <ProCard split={'horizontal'}>
          <ProCard bodyStyle={{ padding: 5 }}>
            <Select
              allowClear
              showSearch
              listHeight={180}
              autoFocus
              onChange={(value) => {
                setSelectValue(value);
              }}
              style={{ width: 500 }}
              options={varData}
              dropdownRender={(menu) => (
                <>
                  <ProCard split={'vertical'}>
                    <ProCard bodyStyle={{ padding: 0 }}>{menu}</ProCard>
                    <ProCard bodyStyle={{ padding: 5 }}>
                      {currentData && (
                        <Space direction="vertical">
                          <Typography.Text type={'secondary'}>
                            变量名
                          </Typography.Text>
                          <Typography.Text code>
                            {currentData.key}
                          </Typography.Text>
                          <Typography.Text type={'secondary'}>
                            变量值
                          </Typography.Text>
                          <Typography.Text code>
                            {currentData?.value}
                          </Typography.Text>
                        </Space>
                      )}
                    </ProCard>
                  </ProCard>
                </>
              )}
            />
          </ProCard>
          <ProCard bodyStyle={{ padding: 5 }}>
            <Space
              direction={'vertical'}
              style={{
                width: '100%',
                marginTop: 20,
              }}
            >
              <Typography.Text type={'secondary'}>表达式</Typography.Text>
              <Typography.Text code copyable>
                {selectValue}
              </Typography.Text>
              <Typography.Text type={'secondary'}>变量值</Typography.Text>
              <Typography.Text code>
                {currentData?.value && currentData?.value.length > 40
                  ? currentData?.value.substring(0, 40) + '...'
                  : currentData?.value}
              </Typography.Text>
            </Space>
          </ProCard>
        </ProCard>
      ),
    },
  ];
  const Content = (
    <ProCard split={'horizontal'}>
      <MyTabs items={items} defaultActiveKey={'1'} />
      <ProCard style={{ marginTop: 200 }}>
        <Space direction={'horizontal'}>
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
      </ProCard>
    </ProCard>
  );

  return (
    <>
      <Popover
        content={Content}
        title={<Title level={5}>引用变量</Title>}
        trigger="click"
        open={open}
        onOpenChange={handleOpenChange}
      >
        <SearchOutlined />
      </Popover>
    </>
  );
};
export default ApiVariableFunc;

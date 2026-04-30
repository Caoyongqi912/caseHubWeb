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
import { FunctionOutlined, GoogleSquareFilled } from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import { Button, Popover, Select, Space, theme, Typography } from 'antd';
import React, { FC, useEffect, useMemo, useState } from 'react';

const { Text } = Typography;

interface ISelfProps {
  value?: string | undefined;
  setValue?: ((rowIndex: string | number, data: any) => void) | undefined;
  index?: string | number;
}

/**
 * API变量和函数选择组件
 * 用于快速插入变量、函数和自定义变量到接口参数中
 */
const ApiVariableFunc: FC<ISelfProps> = ({ value, index, setValue }) => {
  const { token } = theme.useToken();
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
  const [hoveredIcon, setHoveredIcon] = useState(false);

  const commonStyles = useMemo(
    () => ({
      cardBody: {
        padding: token.paddingMD,
      },
      cardBodyCompact: {
        padding: token.paddingSM,
      },
      cardBodyMinimal: {
        padding: 0,
      },
      popover: {
        borderRadius: token.borderRadiusLG,
        boxShadow: token.boxShadow,
        overflow: 'hidden',
      },
      button: {
        borderRadius: token.borderRadiusSM,
        transition: 'all 0.2s ease',
        fontWeight: 500,
      },
      buttonPrimary: {
        borderRadius: token.borderRadiusSM,
        boxShadow: `0 2px 8px ${token.colorPrimaryBg}`,
        transition: 'all 0.2s ease',
        fontWeight: 500,
      },
      icon: {
        color: token.colorTextSecondary,
        fontSize: '16px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        padding: '4px',
      },
      iconHover: {
        color: token.colorPrimary,
        transform: 'scale(1.15)',
      },
      label: {
        color: token.colorTextTertiary,
        fontSize: '12px',
        marginBottom: 4,
        fontWeight: 500,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
      },
      code: {
        fontSize: '13px',
        padding: `${token.paddingXS}px ${token.paddingSM}px`,
        backgroundColor: token.colorBgContainer,
        borderRadius: token.borderRadiusSM,
        fontFamily: "'Fira Code', 'Monaco', 'Consolas', monospace",
      },
      codeHighlight: {
        fontSize: '14px',
        padding: '8px 12px',
        borderRadius: token.borderRadiusSM,
        fontFamily: "'Fira Code', 'Monaco', 'Consolas', monospace",
        color: token.colorPrimary,
        fontWeight: 500,
      },
      googleIcon: {
        color: token.colorPrimary,
        fontSize: '13px',
        opacity: 0.8,
      },
      tabItem: {
        padding: '8px 16px',
        borderRadius: token.borderRadiusSM,
        transition: 'all 0.2s ease',
      },
      selectWrapper: {
        borderRadius: token.borderRadiusSM,
        overflow: 'hidden',
      },
      detailPanel: {
        background: token.colorBgContainer,
        borderLeft: `1px solid ${token.colorBorderSecondary}`,
      },
      buttonGroup: {
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
      },
      emptyText: {
        color: token.colorTextQuaternary,
        fontSize: '13px',
      },
      infoItem: {
        marginBottom: 16,
      },
      infoItemLast: {
        marginBottom: 0,
      },
      badge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '2px 8px',
        borderRadius: 4,
        fontSize: '12px',
        fontWeight: 500,
      },
      badgeFunc: {
        backgroundColor: token.colorPrimaryBg,
        color: token.colorPrimary,
      },
      badgeVar: {
        backgroundColor: token.colorSuccessBg,
        color: token.colorSuccess,
      },
      badgeMy: {
        backgroundColor: token.colorWarningBg,
        color: token.colorWarning,
      },
      sectionDivider: {
        height: 1,
        backgroundColor: token.colorBorderSecondary,
        margin: '12px 0',
      },
      iconBadge: {
        width: 32,
        height: 32,
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: token.colorPrimaryBg,
        marginBottom: 12,
      },
    }),
    [token],
  );

  const iconStyle: React.CSSProperties = {
    ...commonStyles.icon,
    ...(hoveredIcon ? commonStyles.iconHover : {}),
  };

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
  const renderContentPanel = (data: any, type: 'func' | 'var' | 'my') => {
    return (
      <ProCard
        bodyStyle={commonStyles.cardBodyCompact}
        style={commonStyles.detailPanel}
      >
        {data ? (
          <div style={{ width: '100%' }}>
            <div style={commonStyles.infoItem}>
              <Text style={commonStyles.label}>
                {type === 'func' ? '表达式' : '变量名'}
              </Text>
              <Text code copyable style={commonStyles.codeHighlight}>
                {type === 'func' ? selectValue : data.key}
              </Text>
            </div>
            <div style={commonStyles.sectionDivider} />
            {/* <div style={commonStyles.infoItem}>
              <Text style={commonStyles.label}>变量值</Text>
              <Text
                code
                copyable
                ellipsis={{ tooltip: data.value }}
                style={commonStyles.code}
              >
                {data.value?.length > 35
                  ? `${data.value.substring(0, 35)}...`
                  : data.value}
              </Text>
            </div> */}
            {type === 'func' && (
              <>
                <div style={commonStyles.infoItem}>
                  <Text
                    style={{
                      fontSize: '13px',
                      color: token.colorTextSecondary,
                      lineHeight: 1.6,
                    }}
                  >
                    {data.description}
                  </Text>
                </div>
                <div style={commonStyles.infoItem}>
                  <Text style={commonStyles.label}>使用示例</Text>
                  <Text code style={commonStyles.code}>
                    {data.demo}
                  </Text>
                </div>
              </>
            )}
          </div>
        ) : (
          <div
            style={{
              textAlign: 'center',
              color: token.colorTextQuaternary,
              padding: '20px 0',
            }}
          >
            <div style={{ marginBottom: 8 }}>
              <GoogleSquareFilled
                style={{ fontSize: '24px', color: token.colorTextQuaternary }}
              />
            </div>
            <Text style={commonStyles.emptyText}>请从左侧选择变量</Text>
          </div>
        )}
      </ProCard>
    );
  };

  /**
   * 渲染详情面板
   * 统一渲染逻辑，减少代码重复
   */
  const renderDetailPanel = (data: any, type: 'func' | 'var' | 'my') => (
    <ProCard
      bodyStyle={commonStyles.cardBodyCompact}
      style={commonStyles.detailPanel}
    >
      {data ? (
        <div style={{ width: '100%' }}>
          <div style={commonStyles.iconBadge}>
            <GoogleSquareFilled
              style={{ color: token.colorPrimary, fontSize: '16px' }}
            />
          </div>
          <div style={commonStyles.infoItem}>
            <Text style={commonStyles.label}>变量名</Text>
            <Text code style={commonStyles.codeHighlight}>
              {data.label || data.key}
            </Text>
          </div>
          <div style={commonStyles.sectionDivider} />
          <div style={commonStyles.infoItem}>
            <Text style={commonStyles.label}>预览值</Text>
            <Text
              code
              copyable
              ellipsis={{
                tooltip: type === 'func' ? data.description : data.value,
              }}
              style={commonStyles.code}
            >
              {type === 'func'
                ? data.description
                : type === 'var'
                ? data.value
                : data.value?.length > 20
                ? `${data.value.substring(0, 20)}...`
                : data.value}
            </Text>
          </div>
          {type === 'func' && (
            <div style={commonStyles.infoItemLast}>
              <Text style={commonStyles.label}>使用示例</Text>
              <Text code style={commonStyles.code}>
                {data.demo}
              </Text>
            </div>
          )}
        </div>
      ) : (
        <div
          style={{
            textAlign: 'center',
            color: token.colorTextQuaternary,
            padding: '20px 0',
          }}
        >
          <div style={{ marginBottom: 8 }}>
            <GoogleSquareFilled
              style={{ fontSize: '24px', color: token.colorTextQuaternary }}
            />
          </div>
          <Text style={commonStyles.emptyText}>悬停查看详情</Text>
        </div>
      )}
    </ProCard>
  );

  /**
   * 创建选择器配置
   * 统一选择器配置，减少代码重复
   */
  const createSelectConfig = (
    options: any[],
    setCurrentData: (data: any) => void,
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
    popupMatchSelectWidth: 400,
    listHeight: 300,
  });

  const dropdownRender = (
    menu: React.ReactNode,
    type: 'func' | 'var' | 'my',
  ) => (
    <ProCard split={'vertical'} style={{ minWidth: '400px' }}>
      <ProCard bodyStyle={commonStyles.cardBodyMinimal}>{menu}</ProCard>
      {renderDetailPanel(
        type === 'func'
          ? currentValue
          : type === 'var'
          ? currentData
          : currentMyData,
        type,
      )}
    </ProCard>
  );
  const items = [
    {
      key: '1',
      label: '引用变量',
      children: (
        <ProCard split={'horizontal'}>
          <ProCard bodyStyle={commonStyles.cardBodyCompact}>
            <Select
              {...createSelectConfig(funcData, setCurrentValue)}
              dropdownRender={(menu) => dropdownRender(menu, 'func')}
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
              {...createSelectConfig(varData, setCurrentData)}
              dropdownRender={(menu) => dropdownRender(menu, 'var')}
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
              {...createSelectConfig(myData, setCurrentMyData)}
              dropdownRender={(menu) => dropdownRender(menu, 'my')}
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
        <FunctionOutlined
          style={iconStyle}
          onMouseEnter={() => setHoveredIcon(true)}
          onMouseLeave={() => setHoveredIcon(false)}
        />
      </Popover>
    </>
  );
};
export default ApiVariableFunc;

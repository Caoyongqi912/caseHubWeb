import { IEnv } from '@/api';
import { queryEnvBy } from '@/api/base';
import {
  detailInterApiById,
  insertInterApi,
  tryInterApi,
  updateInterApiById,
} from '@/api/inter';
import MyDrawer from '@/components/MyDrawer';
import MyTabs from '@/components/MyTabs';
import InterAssertList from '@/pages/Httpx/componets/InterAssertList';
import InterAuth from '@/pages/Httpx/componets/InterAuth';
import InterDoc from '@/pages/Httpx/componets/InterDoc';
import InterExtractList from '@/pages/Httpx/componets/InterExtractList';
import InterOtherSetting from '@/pages/Httpx/componets/InterOtherSetting';
import InterPerf from '@/pages/Httpx/componets/InterPerf';
import ApiBaseForm from '@/pages/Httpx/Interface/InterfaceApiDetail/ApiBaseForm';
import ApiBeforeItems from '@/pages/Httpx/Interface/InterfaceApiDetail/ApiBeforeItems';
import ApiDetailForm from '@/pages/Httpx/Interface/InterfaceApiDetail/ApiDetailForm';
import InterfaceApiResponseDetail from '@/pages/Httpx/InterfaceApiResponse/InterfaceApiResponseDetail';
import { IInterfaceAPI, IResponseInfo } from '@/pages/Httpx/types';
import {
  ApiOutlined,
  CheckCircleOutlined,
  DownOutlined,
  EditOutlined,
  KeyOutlined,
  LineChartOutlined,
  MoreOutlined,
  QuestionCircleOutlined,
  SaveOutlined,
  SendOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { ProCard, ProForm } from '@ant-design/pro-components';
import {
  Button,
  FloatButton,
  Form,
  message,
  Select,
  Space,
  Spin,
  TabsProps,
  Tooltip,
} from 'antd';
import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { history, useParams } from 'umi';

interface SelfProps {
  interfaceId?: number;
  callback?: () => void;
}

const Index: FC<SelfProps> = ({ interfaceId, callback }) => {
  const { interId, moduleId, projectId } = useParams<{
    interId: string;
    projectId: string;
    moduleId: string;
  }>();
  const responseRef = useRef<any>(null);
  const containerRef = useRef<any>(null);
  const [interApiForm] = Form.useForm<IInterfaceAPI>();
  // 1详情 2新增 3 修改
  const [currentMode, setCurrentMode] = useState(1);
  const [currentProjectId, setCurrentProjectId] = useState<number>();
  const [tryEnvs, setTryEnvs] = useState<{ value: number; label: string }[]>(
    [],
  );
  const [apiEnvs, setApiEnvs] = useState<{ value: number; label: string }[]>(
    [],
  );
  const [tryLoading, setTryLoading] = useState(false);
  const [responseInfo, setResponseInfo] = useState<IResponseInfo[]>();
  const [currentInterAPIId, setCurrentInterAPIId] = useState<number>();
  const [openDoc, setOpenDoc] = useState(false);
  const [runningEnv, setRunningEnv] = useState<number>();
  const [activeKey, setActiveKey] = useState('2');
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200,
  );

  // 监听窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // 响应式配置
  const responsiveConfig: any = useMemo(() => {
    const isTablet = windowWidth >= 768 && windowWidth < 1024;
    const isDesktop = windowWidth >= 1024;

    return {
      isTablet,
      isDesktop,
      cardPadding: 24,
      tabBarPadding: 24,
      buttonSize: 'middle',
      selectWidth: 160,
    };
  }, [windowWidth]);
  //路由进入。空白页
  useEffect(() => {
    if (projectId && moduleId) {
      interApiForm.setFieldsValue({
        project_id: parseInt(projectId),
        module_id: parseInt(moduleId),
      });
    }
    if (projectId) {
      setCurrentProjectId(parseInt(projectId));
    }
  }, [moduleId, projectId]);

  //路由用例详情打开
  useEffect(() => {
    if (interId) {
      setCurrentMode(1);
      fetchInterfaceDetails(interId).then();
    } else {
      setCurrentMode(2);
    }
  }, [interId]);

  //用例详情Drawer打开
  useEffect(() => {
    // 如果存在接口API信息，则设置当前模式、表单值、数据长度和当前接口API ID
    if (interfaceId) {
      setCurrentInterAPIId(interfaceId);
      setCurrentMode(1); // 设置当前模式为查看模式
      fetchInterfaceDetails(interfaceId).then(); //请求接口信息
    }
  }, [interfaceId]);

  // 根据API 所属项目 查询 ENV Module
  useEffect(() => {
    if (currentProjectId) {
      queryEnvBy({ project_id: currentProjectId } as IEnv).then(
        async ({ code, data }) => {
          if (code === 0) {
            setTryEnvs(
              data.map((item: IEnv) => ({
                value: item.id,
                label: item.name,
              })),
            );
            setApiEnvs([
              { label: '自定义', value: 99999 },
              ...data.map((item: IEnv) => ({
                value: item.id,
                label: item.name,
              })),
            ]);
          }
        },
      );
      // queryEnvByProjectIdFormApi(currentProjectId, setEnvs, true).then();
    }
  }, [currentProjectId]);

  /**
   * 对用例的新增与修改
   * 区别 公共新增修改 与 从用例新增与修改
   * addFromCase 从用例新增与修改
   * addFromGroup 从API GROUP新增与修改
   */
  const SaveOrUpdate = async () => {
    await interApiForm.validateFields();
    const values = interApiForm.getFieldsValue(true);
    if (interId !== undefined || values.id !== undefined) {
      //修改
      const { code, msg } = await updateInterApiById(values);
      if (code === 0) {
        message.success(msg);
        setCurrentMode(1);
        callback?.();
        return true;
      }
    } else {
      values.is_common = 1;
      //新增
      const { code, data } = await insertInterApi(values);
      if (code === 0) {
        history.push(`/interface/interApi/detail/interId=${data.id}`);
      }
    }
  };

  /**
   * 查询接口喜信息
   * @param id
   */
  const fetchInterfaceDetails = async (id: string | number) => {
    const { code, data } = await detailInterApiById({ interface_id: id });
    if (code === 0) {
      interApiForm.setFieldsValue(data);
      setCurrentProjectId(data.project_id);
    }
  };

  // 滚动到底部的函数
  const scrollToResponse = () => {
    if (responseRef.current) {
      responseRef.current.scrollIntoView({
        behavior: 'smooth', // 平滑滚动
        block: 'start', // 滚动到顶部对齐
      });
    } else {
      // 如果response还没有渲染，滚动到容器底部
      if (containerRef.current) {
        containerRef.current.scrollTo({
          top: containerRef.current.scrollHeight,
          behavior: 'smooth',
        });
      }
    }
  };

  /**
   * 接口 try
   * @constructor
   */
  const TryClick = async () => {
    if (!runningEnv) {
      message.error('请选择运行环境');
      return;
    }
    setTryLoading(true);
    // 请求完成后滚动到响应区域
    setTimeout(() => {
      scrollToResponse();
    }, 100); // 延迟确保DOM已更新
    const interfaceId = interId || currentInterAPIId;
    if (!interfaceId) {
      setTryLoading(false);
      return;
    }
    tryInterApi({
      interface_id: interfaceId,
      env_id: runningEnv,
    }).then(({ code, data }) => {
      if (code === 0) {
        console.log('try interface response', data);
        setResponseInfo(data);
        setTryLoading(false);
      }
    });
  };

  const TabItems: TabsProps['items'] = [
    {
      key: '1',
      label: <Tooltip title="依次执行 设置变量、脚本、SQL">前置操作</Tooltip>,
      icon: <SettingOutlined />,
      children: <ApiBeforeItems interApiForm={interApiForm} />,
    },
    {
      key: '2',
      label: '接口基础',
      icon: <ApiOutlined />,
      children: (
        <ApiDetailForm
          interApiForm={interApiForm}
          envs={apiEnvs}
          interfaceApiInfo={interApiForm.getFieldsValue(true)}
          currentMode={currentMode}
        />
      ),
    },
    {
      key: '7',
      label: '认证',
      icon: <KeyOutlined />,
      // disabled: true,
      children: <InterAuth form={interApiForm} currentMode={currentMode} />,
    },
    {
      key: '3',
      label: '出参提取',
      icon: <EditOutlined />,
      children: <InterExtractList form={interApiForm} readonly={false} />,
    },
    {
      key: '4',
      label: '断言',
      icon: <CheckCircleOutlined />,
      children: <InterAssertList form={interApiForm} readonly={false} />,
    },
    // {
    //   key: '5',
    //   label: '后置动作',
    //   icon: <FormOutlined />,
    //   children: (
    //     <ApiAfterItems interApiForm={interApiForm} currentMode={currentMode} />
    //   ),
    // },
    {
      key: '8',
      label: '其他',
      icon: <MoreOutlined />,
      children: (
        <InterOtherSetting currentMode={currentMode} form={interApiForm} />
      ),
    },
    ...(interId
      ? [
          {
            key: '6',
            label: '压力测试',
            disabled: true,
            icon: <LineChartOutlined />,
            children: <InterPerf interfaceId={interId} />,
          },
        ]
      : []),
  ];

  const DetailExtra: FC<{ currentMode: number }> = ({ currentMode }) => {
    const getModeActions = () => {
      switch (currentMode) {
        case 1: // 用例详情 - 编辑按钮
          return interId || interfaceId ? (
            <Button
              type="default"
              variant={'outlined'}
              onClick={() => setCurrentMode(3)}
              icon={<EditOutlined />}
              size={responsiveConfig.buttonSize}
              style={{ borderRadius: 8 }}
            >
              编辑
            </Button>
          ) : null;
        case 2: // 新增模式 - 保存按钮
          return (
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={SaveOrUpdate}
              size={responsiveConfig.buttonSize}
              style={{
                borderRadius: 8,
                boxShadow: '0 2px 8px rgba(24, 144, 255, 0.3)',
              }}
            >
              保存用例
            </Button>
          );
        case 3: // 编辑模式 - 保存/取消
          return (
            <Space size={'middle'}>
              <Button
                size={responsiveConfig.buttonSize}
                type="primary"
                icon={<SaveOutlined />}
                onClick={SaveOrUpdate}
                style={{ borderRadius: 8 }}
              >
                保存
              </Button>
              <Button
                size={responsiveConfig.buttonSize}
                type="default"
                onClick={() => setCurrentMode(1)}
                style={{
                  borderRadius: 8,
                  borderColor: '#d9d9d9',
                }}
              >
                取消
              </Button>
            </Space>
          );

        default:
          return null;
      }
    };

    return <>{getModeActions()}</>;
  };

  const tabBarExtraContent = (
    // 右侧：操作按钮区域
    <Space size="middle">
      {/* 模式特定操作 */}
      <DetailExtra currentMode={currentMode} />
      {/* 调试功能区 */}
      <Space size="small">
        {/* 环境选择器 */}
        <Select
          size={responsiveConfig.buttonSize}
          allowClear
          variant={'outlined'}
          placeholder="选择环境"
          disabled={currentMode !== 1}
          suffixIcon={<DownOutlined />}
          options={tryEnvs}
          onChange={(value) => {
            setRunningEnv(value);
          }}
          style={{ minWidth: responsiveConfig.selectWidth }}
        />

        {/* 发送按钮 */}
        <Button
          type="primary"
          icon={<SendOutlined />}
          loading={tryLoading}
          disabled={currentMode !== 1}
          onClick={TryClick}
          size={responsiveConfig.buttonSize}
          style={{
            boxShadow: '0 2px 8px rgba(24, 144, 255, 0.3)',
            borderRadius: 8,
            padding: '0 20px',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow =
              '0 4px 16px rgba(24, 144, 255, 0.4)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow =
              '0 2px 8px rgba(24, 144, 255, 0.3)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          Try
        </Button>
      </Space>
    </Space>
  );
  return (
    <>
      <MyDrawer
        name={'API Doc'}
        width={'60%'}
        open={openDoc}
        setOpen={setOpenDoc}
      >
        <InterDoc />
      </MyDrawer>
      <ProCard
        ref={containerRef}
        bodyStyle={{
          minHeight: '100vh',
          padding: responsiveConfig.cardPadding,
        }}
        style={{
          borderRadius: 16,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
          overflow: 'hidden',
        }}
      >
        <ProForm form={interApiForm} submitter={false}>
          <ApiBaseForm />
          <ProCard
            bordered
            style={{
              marginTop: 24,
              borderRadius: 16,
              overflow: 'hidden',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
            }}
            headStyle={{
              backgroundColor: '#f6f8fa',
              borderBottom: '1px solid #e8e8e8',
              padding: '16px 24px',
            }}
          >
            <MyTabs
              defaultActiveKey={'2'}
              items={TabItems}
              tabBarExtraContent={tabBarExtraContent}
              style={{
                marginBottom: 0,
                paddingLeft: responsiveConfig.tabBarPadding,
                paddingRight: responsiveConfig.tabBarPadding,
                borderBottom: '1px solid #e8e8e8',
                flexWrap: 'nowrap',
              }}
              activeKey={activeKey}
              onChangeKey={setActiveKey}
            />
          </ProCard>
        </ProForm>
        <div ref={responseRef}>
          <Spin tip={'接口请求中...'} size="large" spinning={tryLoading}>
            {responseInfo && (
              <InterfaceApiResponseDetail responses={responseInfo} />
            )}
          </Spin>
        </div>
        <FloatButton
          icon={<QuestionCircleOutlined style={{ fontSize: 20 }} />}
          type="primary"
          tooltip="查看文档"
          onClick={() => setOpenDoc(true)}
          style={{
            right: 32,
            bottom: 32,
            width: 52,
            height: 52,
            boxShadow: '0 4px 16px rgba(22, 119, 255, 0.4)',
            borderRadius: '50%',
          }}
          shape="circle"
        />
      </ProCard>
    </>
  );
};

export default Index;

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
import ApiBaseForm from '@/pages/Httpx/Interface/InterfaceApiDetail/ApiBaseForm';
import ApiBeforeItems from '@/pages/Httpx/Interface/InterfaceApiDetail/ApiBeforeItems';
import ApiDetailForm from '@/pages/Httpx/Interface/InterfaceApiDetail/ApiDetailForm';
import InterfaceApiResponseDetail from '@/pages/Httpx/InterfaceApiResponse/InterfaceApiResponseDetail';
import { IInterfaceAPI, IResponseInfo } from '@/pages/Httpx/types';
import {
  ApiOutlined,
  CheckCircleOutlined,
  CommentOutlined,
  DownOutlined,
  EditOutlined,
  KeyOutlined,
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
  Spin,
  TabsProps,
  Tooltip,
} from 'antd';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { history, useParams } from 'umi';
import ApiRemark from './ApiRemark';

interface SelfProps {
  interfaceId?: number;
  callback?: () => void;
}

const CUSTOM_ENV_VALUE = 99999;

const TAB_KEYS = {
  BEFORE: '1',
  BASE: '2',
  AUTH: '7',
  EXTRACT: '3',
  ASSERT: '4',
  OTHER: '8',
} as const;

const MODE = {
  DETAIL: 1,
  ADD: 2,
  EDIT: 3,
} as const;

type TabKey = (typeof TAB_KEYS)[keyof typeof TAB_KEYS];
type ModeType = (typeof MODE)[keyof typeof MODE];

const Index: FC<SelfProps> = ({ interfaceId, callback }) => {
  const { interId, moduleId, projectId } = useParams<{
    interId: string;
    projectId: string;
    moduleId: string;
  }>();
  const responseRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [interApiForm] = Form.useForm<IInterfaceAPI>();
  const [currentMode, setCurrentMode] = useState<ModeType>(MODE.DETAIL);
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
  const [drawers, setDrawers] = useState({
    remark: false,
    doc: false,
  });
  const [runningEnv, setRunningEnv] = useState<number>();
  const [activeKey, setActiveKey] = useState<TabKey>(TAB_KEYS.BASE);

  const fetchInterfaceDetails = useCallback(
    async (id: string | number) => {
      const { code, data } = await detailInterApiById({ interface_id: id });
      if (code === 0) {
        interApiForm.setFieldsValue(data);
        setCurrentProjectId(data.project_id);
      }
    },
    [interApiForm],
  );

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
  }, [moduleId, projectId, interApiForm]);

  useEffect(() => {
    if (interId) {
      setCurrentMode(MODE.DETAIL);
      fetchInterfaceDetails(interId);
    } else if (!interfaceId) {
      setCurrentMode(MODE.ADD);
    }
  }, [interId, interfaceId, fetchInterfaceDetails]);

  useEffect(() => {
    if (interfaceId) {
      setCurrentInterAPIId(interfaceId);
      setCurrentMode(MODE.DETAIL);
      fetchInterfaceDetails(interfaceId);
    }
  }, [interfaceId, fetchInterfaceDetails]);

  useEffect(() => {
    if (currentProjectId) {
      queryEnvBy({ project_id: currentProjectId } as IEnv).then(
        ({ code, data }) => {
          if (code === 0) {
            const envOptions = data.map((item: IEnv) => ({
              value: item.id,
              label: item.name,
            }));
            setTryEnvs(envOptions);
            setApiEnvs([
              { label: '自定义', value: CUSTOM_ENV_VALUE },
              ...envOptions,
            ]);
          }
        },
      );
    }
  }, [currentProjectId]);

  const SaveOrUpdate = useCallback(async () => {
    await interApiForm.validateFields();
    const values = interApiForm.getFieldsValue(true);

    if (interId !== undefined || values.id !== undefined) {
      const { code, msg } = await updateInterApiById(values);
      if (code === 0) {
        message.success(msg);
        setCurrentMode(MODE.DETAIL);
        callback?.();
      }
    } else {
      values.is_common = 1;
      const { code, data } = await insertInterApi(values);
      if (code === 0) {
        history.push(`/interface/interApi/detail/interId=${data.id}`);
      }
    }
  }, [interId, interApiForm, callback]);

  const scrollToResponse = useCallback(() => {
    if (responseRef.current) {
      responseRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    } else if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, []);

  const TryClick = useCallback(async () => {
    if (!runningEnv) {
      message.error('请选择运行环境');
      return;
    }

    const interfaceId = interId || currentInterAPIId;
    if (!interfaceId) return;

    setTryLoading(true);
    setTimeout(scrollToResponse, 100);

    const { code, data } = await tryInterApi({
      interface_id: interfaceId,
      env_id: runningEnv,
    });

    if (code === 0) {
      console.log('try interface response', data);
      setResponseInfo(data);
    }
    setTryLoading(false);
  }, [runningEnv, interId, currentInterAPIId, scrollToResponse]);

  const isInterfaceActionDisabled = currentMode !== MODE.DETAIL;

  const TabItems: TabsProps['items'] = useMemo(
    () => [
      {
        key: TAB_KEYS.BEFORE,
        label: <Tooltip title="依次执行 设置变量、脚本、SQL">前置操作</Tooltip>,
        icon: <SettingOutlined />,
        children: <ApiBeforeItems interApiForm={interApiForm} />,
      },
      {
        key: TAB_KEYS.BASE,
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
        key: TAB_KEYS.AUTH,
        label: '认证',
        icon: <KeyOutlined />,
        children: <InterAuth form={interApiForm} currentMode={currentMode} />,
      },
      {
        key: TAB_KEYS.EXTRACT,
        label: '出参提取',
        icon: <EditOutlined />,
        children: (
          <InterExtractList
            form={interApiForm}
            readonly={isInterfaceActionDisabled}
          />
        ),
      },
      {
        key: TAB_KEYS.ASSERT,
        label: '断言',
        icon: <CheckCircleOutlined />,
        children: (
          <InterAssertList
            form={interApiForm}
            readonly={isInterfaceActionDisabled}
          />
        ),
      },
      {
        key: TAB_KEYS.OTHER,
        label: '其他',
        icon: <MoreOutlined />,
        children: (
          <InterOtherSetting currentMode={currentMode} form={interApiForm} />
        ),
      },
    ],
    [interApiForm, apiEnvs, currentMode, isInterfaceActionDisabled],
  );

  const DetailExtra = useMemo(() => {
    const buttonBaseStyle = { borderRadius: 8 };

    const renderDetailActions = () => {
      if (interId || interfaceId) {
        return (
          <Button
            type="default"
            variant="outlined"
            onClick={() => setCurrentMode(MODE.EDIT)}
            icon={<EditOutlined />}
            style={buttonBaseStyle}
          >
            编辑
          </Button>
        );
      }
      return null;
    };

    const renderAddActions = () => (
      <Button
        type="primary"
        icon={<SaveOutlined />}
        onClick={SaveOrUpdate}
        style={{
          ...buttonBaseStyle,
          boxShadow: '0 2px 8px rgba(24, 144, 255, 0.3)',
        }}
      >
        保存用例
      </Button>
    );

    const renderEditActions = () => (
      <>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          onClick={SaveOrUpdate}
          style={buttonBaseStyle}
        >
          保存
        </Button>
        <Button
          type="default"
          onClick={() => setCurrentMode(MODE.DETAIL)}
          style={{ ...buttonBaseStyle, borderColor: '#d9d9d9' }}
        >
          取消
        </Button>
      </>
    );

    return () => {
      switch (currentMode) {
        case MODE.DETAIL:
          return renderDetailActions();
        case MODE.ADD:
          return renderAddActions();
        case MODE.EDIT:
          return renderEditActions();
        default:
          return null;
      }
    };
  }, [currentMode, interId, interfaceId, SaveOrUpdate]);

  const tabBarExtraContent = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <DetailExtra />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Select
          allowClear
          variant="outlined"
          placeholder="选择环境"
          disabled={isInterfaceActionDisabled}
          suffixIcon={<DownOutlined />}
          options={tryEnvs}
          onChange={setRunningEnv}
          style={{ minWidth: 120 }}
        />
        <Button
          type="primary"
          icon={<SendOutlined />}
          loading={tryLoading}
          disabled={isInterfaceActionDisabled}
          onClick={TryClick}
        >
          Try
        </Button>
      </div>
    </div>
  );

  const handleOpenDrawer = (key: 'remark' | 'doc') => {
    setDrawers((prev) => ({ ...prev, [key]: true }));
  };

  const handleCloseDrawer = (key: 'remark' | 'doc') => {
    setDrawers((prev) => ({ ...prev, [key]: false }));
  };

  const handleTabChange = (key: string) => {
    setActiveKey(key as TabKey);
  };

  return (
    <>
      <MyDrawer
        width="25%"
        open={drawers.remark}
        setOpen={() => handleCloseDrawer('remark')}
      >
        <ApiRemark inteface_id={interId || currentInterAPIId} />
      </MyDrawer>
      <MyDrawer
        name="API Doc"
        width="60%"
        open={drawers.doc}
        setOpen={() => handleCloseDrawer('doc')}
      >
        <InterDoc />
      </MyDrawer>
      <ProCard ref={containerRef} style={{ minHeight: '90vh' }}>
        <ProForm form={interApiForm} submitter={false}>
          <ApiBaseForm />
          <div
            style={{
              marginTop: 24,
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <MyTabs
              defaultActiveKey={TAB_KEYS.BASE}
              items={TabItems}
              tabBarExtraContent={tabBarExtraContent}
              activeKey={activeKey}
              onChangeKey={handleTabChange}
            />
          </div>
        </ProForm>
        <div ref={responseRef}>
          <Spin size="large" spinning={tryLoading}>
            <div
              style={{
                position: 'relative',
                minHeight: tryLoading ? 400 : 'auto',
              }}
            >
              {tryLoading && (
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 1,
                    color: '#1890ff',
                  }}
                >
                  接口请求中...
                </div>
              )}
              {responseInfo && (
                <InterfaceApiResponseDetail responses={responseInfo} />
              )}
            </div>
          </Spin>
        </div>
        <>
          <FloatButton.Group shape="circle" style={{ insetInlineEnd: 94 }}>
            <FloatButton
              icon={<QuestionCircleOutlined style={{ fontSize: 20 }} />}
              type="primary"
              tooltip="方法文档"
              onClick={() => handleOpenDrawer('doc')}
            />
            <FloatButton
              tooltip="查看记录"
              onClick={() => handleOpenDrawer('remark')}
              type="primary"
              icon={<CommentOutlined style={{ fontSize: 20 }} />}
            />
            <FloatButton.BackTop type="primary" visibilityHeight={0} />
          </FloatButton.Group>
        </>
      </ProCard>
    </>
  );
};

export default Index;

import {
  addCaseContent,
  add_empty_api,
  add_empty_db,
  associationApis,
  baseInfoApiCase,
  initAPICondition,
  queryContentsByCaseId,
  reorderCaseContents,
  runApiCaseBack,
  selectCommonGroups2Case,
  updateApiCase,
} from '@/api/inter/interCase';
import DnDDraggable from '@/components/DnDDraggable';
import MyDrawer from '@/components/MyDrawer';
import MyTabs from '@/components/MyTabs';
import GroupApiChoiceTable from '@/pages/Httpx/Interface/interfaceApiGroup/GroupApiChoiceTable';
import ApiCaseBaseForm from '@/pages/Httpx/InterfaceApiCase/InterfaceApiCaseDetail/ApiCaseBaseForm';
import CaseContentCollapsible from '@/pages/Httpx/InterfaceApiCase/InterfaceApiCaseDetail/CaseContentCollapsible';
import LoopForm from '@/pages/Httpx/InterfaceApiCase/InterfaceApiCaseDetail/contents/LoopProCard/LoopForm';
import InterfaceApiCaseVars from '@/pages/Httpx/InterfaceApiCase/InterfaceApiCaseDetail/InterfaceApiCaseVars';
import RunConfig from '@/pages/Httpx/InterfaceApiCase/InterfaceApiCaseDetail/RunConfig';
import InterfaceApiCaseResultDrawer from '@/pages/Httpx/InterfaceApiCaseResult/InterfaceApiCaseResultDrawer';
import InterfaceApiCaseResultTable from '@/pages/Httpx/InterfaceApiCaseResult/InterfaceApiCaseResultTable';
import InterfaceCaseChoiceApiTable from '@/pages/Httpx/InterfaceApiCaseResult/InterfaceCaseChoiceApiTable';
import {
  IInterfaceAPI,
  IInterfaceAPICase,
  IInterfaceCaseContent,
} from '@/pages/Httpx/types';
import { useParams } from '@@/exports';
import {
  AimOutlined,
  ApiOutlined,
  BranchesOutlined,
  CloseOutlined,
  DatabaseOutlined,
  DownOutlined,
  FieldTimeOutlined,
  MessageTwoTone,
  PlayCircleOutlined,
  PlusOutlined,
  PythonOutlined,
  RetweetOutlined,
  SelectOutlined,
  SyncOutlined,
  UngroupOutlined,
} from '@ant-design/icons';
import { ProCard, ProForm } from '@ant-design/pro-components';
import {
  Button,
  Drawer,
  Dropdown,
  Empty,
  FloatButton,
  Form,
  message,
  Space,
  TabsProps,
  theme,
  Tooltip,
} from 'antd';
import { RadioChangeEvent } from 'antd/lib/radio/interface';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import CaseDynamic from './caseDynamic';

const CONTENT_TYPE_MAP = {
  WAIT: 6,
  SCRIPT: 4,
  ASSERT: 8,
  DB_SCRIPT: 5,
} as const;

interface SelfProps {
  interfaceCase?: IInterfaceAPICase;
  hiddenRunButton?: boolean;
}

const Index: FC<SelfProps> = ({ interfaceCase, hiddenRunButton }) => {
  const { caseApiId, projectId, moduleId } = useParams<{
    caseApiId: string;
    projectId: string;
    moduleId: string;
  }>();
  const { token } = theme.useToken();

  const [form] = Form.useForm<IInterfaceAPICase>();
  const [caseContentElements, setCaseContentElements] = useState<any[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<number>();
  const [currentModuleId, setCurrentModuleId] = useState<number>();
  const [currentCaseId, setCurrentCaseId] = useState<number>();
  const [caseContents, setCaseContents] = useState<IInterfaceCaseContent[]>([]);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [isRunDrawerOpen, setIsRunDrawerOpen] = useState(false);
  const [isChoiceDrawerOpen, setIsChoiceDrawerOpen] = useState(false);
  const [isChoiceGroupDrawerOpen, setIsChoiceGroupDrawerOpen] = useState(false);
  const [resultReloadCount, setResultReloadCount] = useState(0);
  const [selectedEnvId, setSelectedEnvId] = useState<number>();
  const [isErrorStop, setIsErrorStop] = useState(false);
  const [runMode, setRunMode] = useState(1);
  const [activeKey, setActiveKey] = useState('2');
  const [emptyApi, setEmptyApi] = useState<IInterfaceAPI>();
  const [isLoopModalOpen, setIsLoopModalOpen] = useState(false);
  const [openDynamicHistoryDrawer, setOpenDynamicHistoryDrawer] =
    useState(false);
  const [isRunConfigVisible, setIsRunConfigVisible] = useState(false);
  useEffect(() => {
    if (projectId && moduleId) {
      setCurrentProjectId(parseInt(projectId));
      setCurrentModuleId(parseInt(moduleId));
    }
  }, [projectId, moduleId]);

  useEffect(() => {
    if (!interfaceCase) return;
    setCurrentCaseId(interfaceCase.id);
    setCurrentModuleId(interfaceCase.module_id);
    setCurrentProjectId(interfaceCase.project_id);
    queryCaseContentSteps(interfaceCase.id);
  }, [interfaceCase]);

  useEffect(() => {
    if (!caseApiId) return;
    baseInfoApiCase(caseApiId).then(({ code, data }) => {
      if (code === 0) {
        form.setFieldsValue(data);
      }
    });
    setCurrentCaseId(parseInt(caseApiId));
    queryCaseContentSteps(caseApiId);
  }, [refreshCounter, caseApiId]);

  useEffect(() => {
    const init = caseContents.map((item, index) => ({
      id: index,
      api_Id: item.id,
      content: (
        <CaseContentCollapsible
          key={item.id}
          id={index}
          apiOpen={item.target_id === emptyApi?.id}
          moduleId={currentModuleId}
          projectId={currentProjectId}
          step={index + 1}
          collapsible
          callback={refresh}
          caseContent={item}
          caseId={currentCaseId!}
        />
      ),
    }));
    setCaseContentElements(init);
  }, [
    caseContents,
    currentModuleId,
    currentProjectId,
    currentCaseId,
    emptyApi,
  ]);

  const queryCaseContentSteps = useCallback(
    async (case_id: number | string) => {
      const { code, data } = await queryContentsByCaseId(case_id);
      if (code === 0) {
        setCaseContents(data);
      }
    },
    [],
  );

  const handleRefreshSteps = useCallback(async () => {
    if (!currentCaseId) return;
    await queryCaseContentSteps(currentCaseId);
  }, [currentCaseId, queryCaseContentSteps]);

  const refresh = useCallback(async () => {
    setRefreshCounter((prev) => prev + 1);
    setIsChoiceDrawerOpen(false);
    setIsChoiceGroupDrawerOpen(false);
    setIsLoopModalOpen(false);
    setEmptyApi(undefined);
  }, []);

  const onMenuClick = useCallback((e: RadioChangeEvent) => {
    setRunMode(e.target.value);
  }, []);

  const onEnvChange = useCallback((value: number) => {
    setSelectedEnvId(value);
  }, []);

  const onErrorJumpChange = useCallback((value: boolean) => {
    console.log('isErrorStop', value);
    setIsErrorStop(value);
  }, []);

  const onDragEnd = useCallback(
    (reorderedUIContents: any[]) => {
      setCaseContentElements(reorderedUIContents);
      if (!currentCaseId) return;

      const reorderData = reorderedUIContents.map((item) => item.api_Id);
      reorderCaseContents({
        case_id: currentCaseId,
        content_step_order: reorderData,
      }).then(({ code }) => {
        if (code === 0) {
          refresh();
        }
      });
    },
    [currentCaseId, refresh],
  );

  const updateBaseInfo = useCallback(async () => {
    if (!caseApiId) return;
    const values = await form.validateFields();
    const { code, msg } = await updateApiCase({
      ...values,
      id: parseInt(caseApiId),
    });
    if (code === 0) {
      message.success(msg);
    }
  }, [caseApiId, form]);

  const executeTestCase = useCallback(async () => {
    if (!selectedEnvId) {
      message.error('请选择运行环境');
      return;
    }
    if (!currentCaseId) return;

    try {
      if (runMode === 1) {
        setActiveKey('3');
        const { code } = await runApiCaseBack({
          env_id: selectedEnvId,
          error_stop: isErrorStop,
          case_id: currentCaseId,
        });
        if (code === 0) {
          setResultReloadCount((prev) => prev + 1);
          message.success('后台运行中');
          setIsRunConfigVisible(false);
        }
      } else {
        setResultReloadCount((prev) => prev + 1);
        setIsRunDrawerOpen(true);
        setIsRunConfigVisible(false);
      }
    } catch {
      message.error('运行失败，请重试');
    }
  }, [selectedEnvId, currentCaseId, runMode, isErrorStop]);

  const addCaseContentByType = useCallback(
    async (contentType: number) => {
      if (!currentCaseId) return;
      const { code } = await addCaseContent({
        case_id: currentCaseId,
        content_type: contentType,
      });
      if (code === 0) {
        refresh();
      }
    },
    [currentCaseId, refresh],
  );

  const handleAddEmptyApi = useCallback(async () => {
    if (!currentCaseId) return;
    const { code, data } = await add_empty_api({ case_id: currentCaseId });
    if (code === 0) {
      await refresh();
      setEmptyApi(data);
    }
  }, [currentCaseId, refresh]);

  const handleAddEmptyDB = useCallback(async () => {
    if (!currentCaseId) return;
    const { code, data } = await add_empty_db({ case_id: currentCaseId });
    if (code === 0) {
      await refresh();
      setEmptyApi(data);
    }
  }, [currentCaseId, refresh]);

  const handleInitCondition = useCallback(async () => {
    if (!currentCaseId) return;
    const { code } = await initAPICondition({ case_id: currentCaseId });
    if (code === 0) {
      refresh();
    }
  }, [currentCaseId, refresh]);

  const selectInterface2Case = useCallback(
    async (values: number[], copy: boolean) => {
      if (!currentCaseId) return;
      const { code, msg } = await associationApis({
        case_id: currentCaseId,
        interface_id_list: values,
        is_copy: copy,
      });
      if (code === 0) {
        message.success(msg);
        refresh();
      }
    },
    [currentCaseId, refresh],
  );

  const selectGroup2Case = useCallback(
    async (values: number[]) => {
      if (!currentCaseId) return;
      const { code } = await selectCommonGroups2Case({
        case_id: currentCaseId,
        group_id_list: values,
      });
      if (code === 0) {
        refresh();
      }
    },
    [currentCaseId, refresh],
  );

  const dropdownMenuItems = useMemo(
    () => [
      {
        key: 'choice_group',
        label: '选择公共组',
        icon: <UngroupOutlined style={{ color: '#1890ff' }} />,
        onClick: () => setIsChoiceGroupDrawerOpen(true),
      },
      {
        key: 'choice_api',
        label: '选择公共接口',
        icon: <SelectOutlined style={{ color: '#1890ff' }} />,
        onClick: () => setIsChoiceDrawerOpen(true),
      },
      { type: 'divider' as const },
      {
        key: 'add_api',
        label: '添加 API',
        icon: <ApiOutlined style={{ color: '#fa8c16' }} />,
        onClick: handleAddEmptyApi,
      },
      {
        key: 'add_condition',
        label: '添加条件',
        icon: <BranchesOutlined style={{ color: '#fa8c16' }} />,
        onClick: handleInitCondition,
      },
      {
        key: 'wait',
        label: '等待',
        icon: <FieldTimeOutlined style={{ color: '#fa8c16' }} />,
        onClick: () => addCaseContentByType(CONTENT_TYPE_MAP.WAIT),
      },
      {
        key: 'add_script',
        label: '添加脚本',
        icon: <PythonOutlined style={{ color: '#fa8c16' }} />,
        onClick: () => addCaseContentByType(CONTENT_TYPE_MAP.SCRIPT),
      },
      {
        key: 'add_assert',
        label: '添加断言',
        icon: <AimOutlined style={{ color: '#fa8c16' }} />,
        onClick: () => addCaseContentByType(CONTENT_TYPE_MAP.ASSERT),
      },
      {
        key: 'add_db_script',
        label: '添加数据库脚本',
        icon: <DatabaseOutlined style={{ color: '#fa8c16' }} />,
        onClick: handleAddEmptyDB,
      },
      {
        key: 'add_loop',
        label: '添加循环',
        icon: <RetweetOutlined style={{ color: '#fa8c16' }} />,
        onClick: () => setIsLoopModalOpen(true),
      },
    ],
    [
      handleAddEmptyApi,
      handleAddEmptyDB,
      handleInitCondition,
      addCaseContentByType,
    ],
  );

  const APIStepItems: TabsProps['items'] = useMemo(
    () => [
      {
        key: '0',
        label: '基本信息',
        children: (
          <ProCard
            extra={
              <Button onClick={updateBaseInfo} type="primary">
                保存
              </Button>
            }
          >
            <ProForm form={form} submitter={false}>
              <ApiCaseBaseForm />
            </ProForm>
          </ProCard>
        ),
      },
      {
        key: '1',
        label: '前置变量',
        children: <InterfaceApiCaseVars currentCaseId={currentCaseId} />,
      },
      {
        key: '2',
        label: `步骤 (${caseContents.length})`,
        children:
          caseContentElements.length === 0 ? (
            <Empty description={'暂无步骤，请点击上方"添加"按钮添加步骤'} />
          ) : (
            <div
              style={{
                height: 'calc(120vh - 280px)',
                overflowY: 'auto',
                overflowX: 'hidden',
                padding: '12px 16px',
                background: 'transparent',
                borderRadius: 12,
                border: '1px solid rgba(0, 0, 0, 0.1)',
              }}
            >
              <DnDDraggable
                items={caseContentElements}
                setItems={setCaseContentElements}
                orderFetch={onDragEnd}
              />
            </div>
          ),
      },
      {
        key: '3',
        label: '执行历史',
        children: currentCaseId ? (
          <InterfaceApiCaseResultTable
            apiCaseId={currentCaseId}
            reload={resultReloadCount}
          />
        ) : (
          <Empty description="暂无执行历史" />
        ),
      },
    ],
    [
      caseContents.length,
      caseContentElements,
      currentCaseId,
      form,
      onDragEnd,
      resultReloadCount,
      updateBaseInfo,
    ],
  );

  const ApisCardExtra = useMemo(
    () => (
      <Space size={12}>
        <Tooltip title="修改历史">
          <Button
            type="text"
            icon={<MessageTwoTone style={{ fontSize: 14 }} />}
            onClick={() => setOpenDynamicHistoryDrawer(true)}
            style={{
              height: 32,
              width: 32,
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#8c8c8c',
              borderRadius: 6,
            }}
          />
        </Tooltip>
        <Button
          icon={<SyncOutlined style={{ fontSize: 14 }} />}
          onClick={handleRefreshSteps}
          style={{
            height: 32,
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          刷新
        </Button>

        <Dropdown
          menu={{
            items: dropdownMenuItems,
            style: {
              minWidth: '180px',
            },
          }}
          trigger={['click']}
          placement="bottomRight"
          overlayStyle={{
            borderRadius: 8,
          }}
        >
          <Button
            type="primary"
            style={{
              height: 32,
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontWeight: 500,
            }}
          >
            <PlusOutlined style={{ fontSize: 14 }} />
            <span>添加步骤</span>
            <DownOutlined style={{ fontSize: 10, opacity: 0.85 }} />
          </Button>
        </Dropdown>

        {!hiddenRunButton && (
          <Button
            type="primary"
            icon={<PlayCircleOutlined style={{ fontSize: 14 }} />}
            onClick={() => setIsRunConfigVisible(true)}
            style={{
              height: 32,
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontWeight: 500,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow =
                '0 4px 12px rgba(102, 126, 234, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow =
                '0 2px 8px rgba(102, 126, 234, 0.3)';
            }}
          >
            运行配置
          </Button>
        )}
      </Space>
    ),
    [dropdownMenuItems, handleRefreshSteps],
  );

  return (
    <>
      <MyDrawer
        name="修改历史"
        width={'25%'}
        open={openDynamicHistoryDrawer}
        setOpen={setOpenDynamicHistoryDrawer}
      >
        <CaseDynamic case_id={currentCaseId!} />
      </MyDrawer>

      <LoopForm
        open={isLoopModalOpen}
        setOpen={setIsLoopModalOpen}
        callback={refresh}
        case_id={parseInt(caseApiId!)}
      />

      <MyDrawer
        name="测试结果"
        width={'80%'}
        open={isRunDrawerOpen}
        setOpen={setIsRunDrawerOpen}
      >
        <InterfaceApiCaseResultDrawer
          openStatus={isRunDrawerOpen}
          caseApiId={currentCaseId!}
          error_stop={isErrorStop}
          env_id={selectedEnvId!}
        />
      </MyDrawer>

      <MyDrawer
        open={isChoiceGroupDrawerOpen}
        setOpen={setIsChoiceGroupDrawerOpen}
      >
        <GroupApiChoiceTable
          projectId={currentProjectId}
          refresh={refresh}
          onSelect={selectGroup2Case}
        />
      </MyDrawer>

      <MyDrawer open={isChoiceDrawerOpen} setOpen={setIsChoiceDrawerOpen}>
        <InterfaceCaseChoiceApiTable
          projectId={parseInt(projectId!)}
          radio={false}
          onSelect={selectInterface2Case}
        />
      </MyDrawer>

      <Drawer
        placement="right"
        width={400}
        open={isRunConfigVisible}
        onClose={() => setIsRunConfigVisible(false)}
        closable={true}
        closeIcon={<CloseOutlined />}
        styles={{
          body: { padding: 0 },
          header: {
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
            padding: '16px 24px',
          },
        }}
        style={{
          background: token.colorBgContainer,
        }}
      >
        <RunConfig
          onMenuClick={onMenuClick}
          run={executeTestCase}
          onEnvChange={onEnvChange}
          onErrorJumpChange={onErrorJumpChange}
          errorStop={isErrorStop}
          currentProjectId={currentProjectId}
        />
      </Drawer>

      <div
        style={{
          height: '100vh',
          overflow: 'hidden',
          background: token.colorBgLayout,
          position: 'relative',
        }}
      >
        <ProCard
          style={{ height: '100%' }}
          bodyStyle={{ height: '100%', padding: 16, overflow: 'hidden' }}
        >
          <MyTabs
            defaultActiveKey={activeKey}
            onChangeKey={setActiveKey}
            activeKey={activeKey}
            items={APIStepItems}
            tabBarExtraContent={ApisCardExtra}
            style={{
              padding: '0 16px',
              borderBottom: '1px solid #f0f0f0',
              flexWrap: 'nowrap',
              marginBottom: 16,
            }}
          />
        </ProCard>

        <FloatButton.BackTop
          style={{
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            right: 24,
            bottom: 24,
          }}
        />
      </div>
    </>
  );
};

export default Index;

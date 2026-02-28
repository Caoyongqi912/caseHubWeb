import {
  addCaseContent,
  add_empty_api,
  associationApis,
  baseInfoApiCase,
  initAPICondition,
  queryContentsByCaseId,
  reorderCaseContents,
  runApiCaseBack,
  setApiCase,
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
  AlignLeftOutlined,
  ApiOutlined,
  BranchesOutlined,
  DatabaseOutlined,
  FieldTimeOutlined,
  PythonOutlined,
  RetweetOutlined,
  SelectOutlined,
  UngroupOutlined,
} from '@ant-design/icons';
import { ProCard, ProForm } from '@ant-design/pro-components';
import {
  Button,
  Dropdown,
  Empty,
  FloatButton,
  Form,
  message,
  Splitter,
  TabsProps,
} from 'antd';
import { RadioChangeEvent } from 'antd/lib/radio/interface';
import { debounce } from 'lodash';
import RcResizeObserver from 'rc-resize-observer';
import { FC, useCallback, useEffect, useState } from 'react';

interface Self {
  interfaceCase?: IInterfaceAPICase;
  hiddenRunButton?: boolean;
}

const Index: FC<Self> = ({ interfaceCase, hiddenRunButton }) => {
  const { caseApiId, projectId, moduleId } = useParams<{
    caseApiId: string;
    projectId: string;
    moduleId: string;
  }>();
  const [form] = Form.useForm<IInterfaceAPICase>();
  const [caseContentElements, setCaseContentElements] = useState<any[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<number>();
  const [currentModuleId, setCurrentModuleId] = useState<number>();
  const [currentCaseId, setCurrentCaseId] = useState<number>();
  const [caseContents, setCaseContents] = useState<IInterfaceCaseContent[]>([]);
  const [caseContentsStepLength, setCaseContentsStepLength] =
    useState<number>(0);

  const [refreshCounter, setRefreshCounter] = useState<number>(0);
  const [isRunDrawerOpen, setIsRunDrawerOpen] = useState(false);
  const [isChoiceDrawerOpen, setIsChoiceDrawerOpen] = useState(false);
  const [isChoiceGroupDrawerOpen, setIsChoiceGroupDrawerOpen] = useState(false);
  const [resultReloadCount, setResultReloadCount] = useState(0);

  const [selectedEnvId, setSelectedEnvId] = useState<number>();
  const [isErrorStop, setIsErrorStop] = useState<boolean>(false);
  const [runMode, setRunMode] = useState<number>(1);
  const [drawerWidth, setDrawerWidth] = useState('80%');
  const [activeKey, setActiveKey] = useState('2'); // 默认选中步骤标签
  const [emptyApi, setEmptyApi] = useState<IInterfaceAPI>();
  const [isLoopModalOpen, setIsLoopModalOpen] = useState(false);
  // 固定配置，不再根据屏幕尺寸动态调整
  const config = {
    cardPadding: 24,
  };
  // 防抖处理，避免频繁重渲染
  const handleResize = useCallback(
    debounce(({ width }) => {
      const breakpoints = [
        { max: 768, size: '75%' }, // 平板及以下
        { max: 1030, size: '75%' }, // 小笔记本
        { max: 1440, size: '80%' }, // 普通显示器
        { max: 1920, size: '85%' }, // 1K显示器
        { max: 2560, size: '90%' }, // 2K显示器
        { max: Infinity, size: '95%' }, // 4K+显示器
      ];

      const breakpoint = breakpoints.find((bp) => width <= bp.max);
      setDrawerWidth(breakpoint?.size || '80%');
    }, 100),
    [],
  );
  useEffect(() => {
    if (projectId && moduleId) {
      setCurrentProjectId(parseInt(projectId));
      setCurrentModuleId(parseInt(moduleId));
    }
  }, [projectId, moduleId]);
  // drawer 页
  useEffect(() => {
    if (!interfaceCase) return;
    setCurrentCaseId(interfaceCase.id);
    setCurrentModuleId(interfaceCase.module_id);
    setCurrentProjectId(interfaceCase.project_id);
    queryCaseContentSteps(interfaceCase.id).then();
  }, [interfaceCase]);

  useEffect(() => {
    if (!caseApiId) return;
    baseInfoApiCase(caseApiId).then(async ({ code, data }) => {
      if (code === 0) {
        form.setFieldsValue(data);
      }
    });
    setCurrentCaseId(parseInt(caseApiId));
    queryCaseContentSteps(caseApiId).then();
  }, [refreshCounter, caseApiId]);
  // 使用 useEffect 确保在 caseContentElement 更新后执行滚动操作
  /**
   * 刷新页面数据和状态
   */
  const refresh = async () => {
    setRefreshCounter((prev) => prev + 1);
    setIsChoiceDrawerOpen(false);
    setIsChoiceGroupDrawerOpen(false);
    setIsLoopModalOpen(false);
    setEmptyApi(undefined);
  };
  useEffect(() => {
    setCaseContentsStepLength(caseContents.length);
    const init = caseContents.map((item, index) => ({
      id: index,
      api_Id: item.id,
      content: (
        <CaseContentCollapsible
          id={index}
          apiOpen={item.target_id === emptyApi?.id}
          moduleId={currentModuleId}
          projectId={currentProjectId}
          step={index + 1}
          collapsible={true}
          callback={refresh}
          caseContent={item}
          caseId={currentCaseId!}
        />
      ),
    }));
    setCaseContentElements(init);
  }, [caseContents]); // 确保所有相关变量在依赖数组中

  /**
   * 步骤查询
   * @param case_id
   */
  const queryCaseContentSteps = async (case_id: number | string) => {
    const { code, data } = await queryContentsByCaseId(case_id);
    if (code === 0) {
      setCaseContents(data);
    }
  };

  /**
   * 处理运行模式选择
   * @param e 单选按钮变更事件
   */
  const onMenuClick = async (e: RadioChangeEvent) => {
    const { value } = e.target;
    setRunMode(value);
  };

  /**
   * 执行测试用例
   */
  const executeTestCase = async () => {
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
        }
      } else {
        setResultReloadCount((prev) => prev + 1);
        setIsRunDrawerOpen(true);
      }
    } catch (error) {
      message.error('运行失败，请重试');
    }
  };

  /**
   * 处理运行环境变更
   * @param value 环境ID
   */
  const onEnvChange = (value: number) => {
    setSelectedEnvId(value);
  };
  /**
   * 处理错误停止选项变更
   * @param value 是否在错误时停止
   */
  const onErrorJumpChange = (value: boolean) => {
    setIsErrorStop(value);
  };
  /**
   * 处理步骤拖拽结束事件
   * @param reorderedUIContents 重新排序后的UI内容
   */
  const onDragEnd = (reorderedUIContents: any[]) => {
    setCaseContentElements(reorderedUIContents);
    if (currentCaseId) {
      const reorderData = reorderedUIContents.map((item) => item.api_Id);
      reorderCaseContents({
        case_id: currentCaseId,
        content_step_order: reorderData,
      }).then(async ({ code }) => {
        if (code === 0) {
          console.log('reorder success');
          await refresh();
        }
      });
    }
  };

  /**
   * 更新测试用例基本信息
   */
  const updateBaseInfo = async () => {
    if (caseApiId) {
      // 验证表单字段
      const values = await form.validateFields();
      // 调用API更新测试用例信息
      const { code, msg } = await setApiCase({
        ...values,
        id: parseInt(caseApiId),
      });
      // 显示成功消息
      if (code === 0) {
        await message.success(msg);
      }
    }
  };
  /**
   * API步骤卡片额外操作按钮
   */
  const ApisCardExtra = () => {
    return (
      <Dropdown.Button
        type={'primary'}
        style={{
          boxShadow: '0 2px 8px rgba(24, 144, 255, 0.3)',
          borderRadius: 8,
          transition: 'all 0.3s ease',
        }}
        menu={{
          items: [
            {
              key: 'choice_group',
              label: '选择公共组',
              icon: <UngroupOutlined style={{ color: 'blue' }} />,
              onClick: () => setIsChoiceGroupDrawerOpen(true),
            },
            {
              key: 'choice_api',
              label: '选择公共接口',
              icon: <SelectOutlined style={{ color: 'blue' }} />,
              onClick: () => setIsChoiceDrawerOpen(true),
            },
            {
              type: 'divider',
            },
            {
              key: 'add_api',
              label: '添加API',
              icon: <ApiOutlined style={{ color: 'orange' }} />,
              onClick: async () => {
                if (currentCaseId && currentProjectId && currentModuleId) {
                  const { code, data } = await add_empty_api({
                    case_id: currentCaseId,
                    project_id: currentProjectId,
                    module_id: currentModuleId,
                  });
                  if (code === 0) {
                    await refresh();
                    setEmptyApi(data);
                  }
                }
              },
            },
            {
              key: 'add_condition',
              label: '添加条件',
              icon: <BranchesOutlined style={{ color: 'orange' }} />,
              onClick: async () => {
                if (currentCaseId) {
                  const { code } = await initAPICondition({
                    interface_case_id: currentCaseId,
                  });
                  if (code === 0) {
                    await refresh();
                  }
                }
              },
            },
            {
              key: 'wait',
              label: '等待',
              icon: <FieldTimeOutlined style={{ color: 'orange' }} />,
              onClick: async () => {
                if (currentCaseId) {
                  const { code } = await addCaseContent({
                    case_id: currentCaseId,
                    content_type: 6,
                  });
                  if (code === 0) {
                    await refresh();
                  }
                }
              },
            },
            {
              key: 'add_script',
              label: '添加脚本',
              icon: <PythonOutlined style={{ color: 'orange' }} />,
              onClick: async () => {
                if (currentCaseId) {
                  const { code } = await addCaseContent({
                    case_id: currentCaseId,
                    content_type: 4,
                  });
                  if (code === 0) {
                    await refresh();
                  }
                }
              },
            },
            {
              key: 'add_assert',
              label: '添加断言',
              icon: <AimOutlined style={{ color: 'orange' }} />,
              onClick: async () => {
                if (currentCaseId) {
                  const { code } = await addCaseContent({
                    case_id: currentCaseId,
                    content_type: 8,
                  });
                  if (code === 0) {
                    await refresh();
                  }
                }
              },
            },
            {
              key: 'add_db_script',
              label: '添加数据库脚本',
              icon: <DatabaseOutlined style={{ color: 'orange' }} />,
              onClick: async () => {
                if (currentCaseId) {
                  const { code } = await addCaseContent({
                    case_id: currentCaseId,
                    content_type: 5,
                  });
                  if (code === 0) {
                    await refresh();
                  }
                }
              },
            },
            {
              key: 'add_loop',
              label: '添加循环',
              icon: <RetweetOutlined style={{ color: 'orange' }} />,
              onClick: () => {
                setIsLoopModalOpen(true);
              },
            },
          ],
        }}
        icon={<AlignLeftOutlined />}
      >
        添加
      </Dropdown.Button>
    );
  };

  /**
   * API步骤标签页配置
   */
  const APIStepItems: TabsProps['items'] = [
    {
      key: '0',
      label: '基本信息',
      children: (
        <ProCard
          extra={
            <Button onClick={updateBaseInfo} type={'primary'}>
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
      label: `步骤 (${caseContentsStepLength})`,
      children: (
        <>
          {caseContentElements.length === 0 ? (
            <Empty
              description={
                <span style={{ fontSize: '14px', color: '#666' }}>
                  暂无步骤，请点击上方"添加"按钮添加步骤
                </span>
              }
            />
          ) : (
            <DnDDraggable
              items={caseContentElements}
              setItems={setCaseContentElements}
              orderFetch={onDragEnd}
            />
          )}
        </>
      ),
    },
    {
      key: '3',
      label: '执行历史',
      children: (
        <>
          {currentCaseId ? (
            <InterfaceApiCaseResultTable
              apiCaseId={currentCaseId}
              reload={resultReloadCount}
            />
          ) : (
            <Empty
              description={
                <span style={{ fontSize: '14px', color: '#666' }}>
                  暂无执行历史
                </span>
              }
            />
          )}
        </>
      ),
    },
  ];

  const selectInterface2Case = async (values: number[]) => {
    if (!currentCaseId) return;
    const { code, msg } = await associationApis({
      interface_case_id: currentCaseId,
      interface_id_list: values,
    });
    if (code === 0) {
      message.success(msg);
      refresh();
    }
  };
  return (
    <>
      <LoopForm
        open={isLoopModalOpen}
        setOpen={setIsLoopModalOpen}
        callback={refresh}
        case_id={parseInt(caseApiId!)}
      />
      <MyDrawer
        name={'测试结果'}
        width={drawerWidth}
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
          currentCaseId={currentCaseId!}
        />
      </MyDrawer>

      <MyDrawer open={isChoiceDrawerOpen} setOpen={setIsChoiceDrawerOpen}>
        <InterfaceCaseChoiceApiTable
          projectId={parseInt(projectId!)}
          mutable={true}
          onSelect={selectInterface2Case}
        />
      </MyDrawer>
      <RcResizeObserver onResize={handleResize}>
        <ProCard
          style={{ height: '100%' }}
          bodyStyle={{ height: '100%', padding: '10px', minHeight: '100vh' }}
        >
          <Splitter
            style={{ height: '100%', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }}
          >
            <Splitter.Panel size={drawerWidth} max="100%">
              <ProCard bodyStyle={{ minHeight: '100hv', overflow: 'auto' }}>
                <MyTabs
                  defaultActiveKey={activeKey}
                  onChangeKey={setActiveKey}
                  activeKey={activeKey}
                  items={APIStepItems}
                  tabBarExtraContent={<ApisCardExtra />}
                  style={{
                    padding: '0 16px',
                    borderBottom: '1px solid #f0f0f0',
                    flexWrap: 'nowrap',
                    marginBottom: 16,
                  }}
                />
              </ProCard>
            </Splitter.Panel>
            {!hiddenRunButton && (
              <Splitter.Panel
                resizable={true}
                style={{ padding: config.cardPadding }}
              >
                <RunConfig
                  onMenuClick={onMenuClick}
                  run={executeTestCase}
                  onEnvChange={onEnvChange}
                  onErrorJumpChange={onErrorJumpChange}
                  currentProjectId={currentProjectId}
                />
              </Splitter.Panel>
            )}
          </Splitter>
        </ProCard>

        <FloatButton.BackTop
          style={{
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            borderRadius: '50%',
            background: '#1890ff',
            transition: 'all 0.3s ease',
          }}
        />
      </RcResizeObserver>
    </>
  );
};

export default Index;

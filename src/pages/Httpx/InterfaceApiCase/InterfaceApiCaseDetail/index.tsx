import {
  addCaseContent,
  add_empty_api,
  baseInfoApiCase,
  initAPICondition,
  queryContentsByCaseId,
  reorderCaseContents,
  runApiCaseBack,
} from '@/api/inter/interCase';
import DnDDraggable from '@/components/DnDDraggable';
import MyDrawer from '@/components/MyDrawer';
import GroupApiChoiceTable from '@/pages/Httpx/Interface/interfaceApiGroup/GroupApiChoiceTable';
import CaseContentCollapsible from '@/pages/Httpx/InterfaceApiCase/InterfaceApiCaseDetail/CaseContentCollapsible';
import InterfaceApiCaseVars from '@/pages/Httpx/InterfaceApiCase/InterfaceApiCaseDetail/InterfaceApiCaseVars';
import RunConfig from '@/pages/Httpx/InterfaceApiCase/InterfaceApiCaseDetail/RunConfig';
import InterfaceApiCaseResultDrawer from '@/pages/Httpx/InterfaceApiCaseResult/InterfaceApiCaseResultDrawer';
import InterfaceCaseChoiceApiTable from '@/pages/Httpx/InterfaceApiCaseResult/InterfaceCaseChoiceApiTable';
import { IInterfaceCaseContent } from '@/pages/Httpx/types';
import { useParams } from '@@/exports';
import {
  AimOutlined,
  AlignLeftOutlined,
  ApiOutlined,
  BranchesOutlined,
  FieldTimeOutlined,
  PythonOutlined,
  SelectOutlined,
  UngroupOutlined,
} from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import {
  Dropdown,
  Empty,
  FloatButton,
  Form,
  message,
  Splitter,
  Tabs,
  TabsProps,
} from 'antd';
import { RadioChangeEvent } from 'antd/lib/radio/interface';
import { useEffect, useState } from 'react';

const Index = () => {
  const { caseApiId, projectId, moduleId } = useParams<{
    caseApiId: string;
    projectId: string;
    moduleId: string;
  }>();
  const [baseForm] = Form.useForm();
  const [caseContentElement, setCaseContentElement] = useState<any[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<number>();
  const [currentModuleId, setCurrentModuleId] = useState<number>();

  const [caseContents, setCaseContents] = useState<IInterfaceCaseContent[]>([]);
  const [caseContentsStepLength, setCaseContentsStepLength] =
    useState<number>(0);

  const [editCase, setEditCase] = useState<number>(0);
  const [runOpen, setRunOpen] = useState(false);
  const [choiceOpen, setChoiceOpen] = useState(false);
  const [choiceGroupOpen, setChoiceGroupOpen] = useState(false);
  const [reloadResult, setReloadResult] = useState(0);

  const [runningEnvId, setRunningEnvId] = useState<number>();
  const [errorJump, setErrorJump] = useState<boolean>(false);
  const [runningStyle, setRunningStyle] = useState<number>(1);
  //路由进入。空白页
  useEffect(() => {
    if (projectId && moduleId) {
      baseForm.setFieldsValue({
        project_id: parseInt(projectId),
        module_id: parseInt(moduleId),
      });
    }
    if (projectId) {
      setCurrentProjectId(parseInt(projectId));
    }
  }, [moduleId, projectId]);

  useEffect(() => {
    if (caseApiId) {
      Promise.all([
        baseInfoApiCase(caseApiId),
        queryContentsByCaseId(caseApiId),
      ]).then(([baseInfo, apisInfo]) => {
        if (baseInfo.code === 0) {
          baseForm.setFieldsValue(baseInfo.data);
          setCurrentProjectId(baseInfo.data.project_id);
          setCurrentModuleId(baseInfo.data.module_id);
        }
        if (apisInfo.code === 0) {
          setCaseContents(apisInfo.data);
        }
      });
    }
  }, [editCase, caseApiId]);

  useEffect(() => {
    if (caseContents) {
      setCaseContentsStepLength(caseContents.length);
      const init = caseContents.map((item, index) => ({
        id: index,
        api_Id: item.id,
        content: (
          <CaseContentCollapsible
            moduleId={currentModuleId}
            projectId={currentProjectId}
            step={index + 1}
            collapsible={true}
            callback={refresh}
            caseContent={item}
            caseId={parseInt(caseApiId!)}
          />
        ),
      }));
      setCaseContentElement(init);
    }
  }, [caseContents]); // 确保所有相关变量在依赖数组中

  // 使用 useEffect 确保在 caseContentElement 更新后执行滚动操作
  const refresh = async () => {
    setEditCase(editCase + 1);
    setChoiceOpen(false);
    setChoiceGroupOpen(false);
  };

  const onMenuClick = async (e: RadioChangeEvent) => {
    const { value } = e.target;
    setRunningStyle(value);
  };

  const debugCase = async () => {
    if (!runningEnvId) {
      message.error('请选择运行环境');
      return;
    }
    if (!caseApiId) return;
    if (runningStyle === 1) {
      await runApiCaseBack({
        env_id: runningEnvId,
        error_stop: errorJump,
        case_id: caseApiId,
      }).then(async ({ code }) => {
        if (code === 0) {
          setReloadResult(reloadResult + 1);
          message.success('后台运行中。。');
        }
      });
    } else {
      setReloadResult(reloadResult + 1);
      setRunOpen(true);
    }
  };

  const onEnvChange = (value: number) => {
    setRunningEnvId(value);
  };
  const onErrorJumpChange = (value: boolean) => {
    setErrorJump(value);
  };
  const onDragEnd = (reorderedUIContents: any[]) => {
    setCaseContentElement(reorderedUIContents);
    if (caseApiId) {
      const reorderData = reorderedUIContents.map((item) => item.api_Id);
      reorderCaseContents({
        case_id: caseApiId,
        content_step_order: reorderData,
      }).then(async ({ code }) => {
        if (code === 0) {
          console.log('reorder success');
          await refresh();
        }
      });
    }
  };

  const ApisCardExtra = () => {
    return (
      <Dropdown.Button
        type={'primary'}
        menu={{
          items: [
            {
              key: 'choice_group',
              label: '选择公共组',
              icon: <UngroupOutlined style={{ color: 'blue' }} />,
              onClick: () => setChoiceGroupOpen(true),
            },
            {
              key: 'choice_api',
              label: '选择公共接口',
              icon: <SelectOutlined style={{ color: 'blue' }} />,
              onClick: () => setChoiceOpen(true),
            },
            {
              type: 'divider',
            },
            {
              key: 'add_api',
              label: '添加API',
              icon: <ApiOutlined style={{ color: 'orange' }} />,
              onClick: async () => {
                if (caseApiId && currentProjectId && currentModuleId) {
                  const { code } = await add_empty_api({
                    case_id: parseInt(caseApiId),
                    project_id: currentProjectId,
                    module_id: currentModuleId,
                  });
                  if (code === 0) {
                    await refresh();
                  }
                }
              },
            },
            {
              key: 'add_condition',
              label: '添加条件',
              icon: <BranchesOutlined style={{ color: 'orange' }} />,
              onClick: async () => {
                if (caseApiId) {
                  const { code } = await initAPICondition({
                    interface_case_id: parseInt(caseApiId),
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
                if (caseApiId) {
                  const { code } = await addCaseContent({
                    case_id: parseInt(caseApiId),
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
                if (caseApiId) {
                  const { code } = await addCaseContent({
                    case_id: parseInt(caseApiId),
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
                if (caseApiId) {
                  const { code } = await addCaseContent({
                    case_id: parseInt(caseApiId),
                    content_type: 8,
                  });
                  if (code === 0) {
                    await refresh();
                  }
                }
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

  const APIStepItems: TabsProps['items'] = [
    {
      key: '1',
      label: 'Vars',
      children: <InterfaceApiCaseVars currentCaseId={caseApiId} />,
    },
    {
      key: '2',
      label: `STEP (${caseContentsStepLength})`,
      children: (
        <>
          {caseContentElement.length === 0 ? (
            <Empty />
          ) : (
            <DnDDraggable
              items={caseContentElement}
              setItems={setCaseContentElement}
              orderFetch={onDragEnd}
            />
          )}
        </>
      ),
    },
  ];

  return (
    <>
      <MyDrawer
        name={'测试结果'}
        width={'80%'}
        open={runOpen}
        setOpen={setRunOpen}
      >
        <InterfaceApiCaseResultDrawer
          openStatus={runOpen}
          caseApiId={caseApiId!}
          error_stop={errorJump}
          env_id={runningEnvId!}
        />
      </MyDrawer>

      <MyDrawer name={''} open={choiceGroupOpen} setOpen={setChoiceGroupOpen}>
        <GroupApiChoiceTable
          projectId={currentProjectId}
          refresh={refresh}
          currentCaseId={caseApiId!}
        />
      </MyDrawer>

      <MyDrawer name={''} open={choiceOpen} setOpen={setChoiceOpen}>
        <InterfaceCaseChoiceApiTable
          projectId={currentProjectId}
          currentCaseApiId={caseApiId}
          refresh={refresh}
        />
      </MyDrawer>
      <Splitter
        style={{ height: '100%', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }}
      >
        <Splitter.Panel
          resizable
          collapsible={{ start: true, end: true }}
          defaultSize="90%"
          min="90%"
          max="100%"
        >
          <ProCard extra={<ApisCardExtra />}>
            <Tabs
              defaultActiveKey={'2'}
              defaultValue={'2'}
              size={'large'}
              type={'card'}
              items={APIStepItems}
            />
          </ProCard>
        </Splitter.Panel>
        <Splitter.Panel resizable collapsible={{ start: true, end: true }}>
          <RunConfig
            onMenuClick={onMenuClick}
            run={debugCase}
            onEnvChange={onEnvChange}
            onErrorJumpChange={onErrorJumpChange}
            currentProjectId={currentProjectId}
          />
        </Splitter.Panel>
      </Splitter>

      {/*{caseApiId ? (*/}
      {/*  <InterfaceApiCaseResultTable*/}
      {/*    apiCaseId={caseApiId}*/}
      {/*    reload={reloadResult}*/}
      {/*  />*/}
      {/*) : null}*/}
      <FloatButton.BackTop />
    </>
  );
};

export default Index;

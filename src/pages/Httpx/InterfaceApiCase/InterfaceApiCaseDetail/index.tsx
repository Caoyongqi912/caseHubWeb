import {
  addCaseContent,
  add_empty_api,
  initAPICondition,
  queryContentsByCaseId,
  reorderCaseContents,
  runApiCaseBack,
} from '@/api/inter/interCase';
import DnDDraggable from '@/components/DnDDraggable';
import MyDrawer from '@/components/MyDrawer';
import MyTabs from '@/components/MyTabs';
import GroupApiChoiceTable from '@/pages/Httpx/Interface/interfaceApiGroup/GroupApiChoiceTable';
import CaseContentCollapsible from '@/pages/Httpx/InterfaceApiCase/InterfaceApiCaseDetail/CaseContentCollapsible';
import InterfaceApiCaseVars from '@/pages/Httpx/InterfaceApiCase/InterfaceApiCaseDetail/InterfaceApiCaseVars';
import RunConfig from '@/pages/Httpx/InterfaceApiCase/InterfaceApiCaseDetail/RunConfig';
import InterfaceApiCaseResultDrawer from '@/pages/Httpx/InterfaceApiCaseResult/InterfaceApiCaseResultDrawer';
import InterfaceApiCaseResultTable from '@/pages/Httpx/InterfaceApiCaseResult/InterfaceApiCaseResultTable';
import InterfaceCaseChoiceApiTable from '@/pages/Httpx/InterfaceApiCaseResult/InterfaceCaseChoiceApiTable';
import { IInterfaceAPICase, IInterfaceCaseContent } from '@/pages/Httpx/types';
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
  const [caseContentElement, setCaseContentElement] = useState<any[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<number>();
  const [currentModuleId, setCurrentModuleId] = useState<number>();
  const [currentCaseId, setCurrentCaseId] = useState<number>();
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

  const [defaultSize, setDefaultSize] = useState('80%');

  const [activeKey, setActiveKey] = useState('2'); // 默认选中 b

  // 防抖处理，避免频繁重渲染
  const handleResize = useCallback(
    debounce(({ width }) => {
      console.log('=====', width);
      const breakpoints = [
        { max: 768, size: '75%' }, // 平板及以下
        { max: 1030, size: '75%' }, // 小笔记本
        { max: 1440, size: '80%' }, // 普通显示器
        { max: 1920, size: '90%' }, // 1K显示器
        { max: 2560, size: '90%' }, // 2K显示器
        { max: Infinity, size: '95%' }, // 4K+显示器
      ];

      const breakpoint = breakpoints.find((bp) => width <= bp.max);
      console.log(breakpoint?.size);
      setDefaultSize(breakpoint?.size || '80%');
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
    setCurrentCaseId(parseInt(caseApiId));
    queryCaseContentSteps(caseApiId).then();
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
            caseId={currentCaseId!}
          />
        ),
      }));
      setCaseContentElement(init);
    }
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
    if (!currentCaseId) return;
    if (runningStyle === 1) {
      setActiveKey('3');
      await runApiCaseBack({
        env_id: runningEnvId,
        error_stop: errorJump,
        case_id: currentCaseId,
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
                if (currentCaseId && currentProjectId && currentModuleId) {
                  const { code } = await add_empty_api({
                    case_id: currentCaseId,
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
      label: '前置变量',
      children: <InterfaceApiCaseVars currentCaseId={currentCaseId} />,
    },
    {
      key: '2',
      label: `步骤 (${caseContentsStepLength})`,
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
    {
      key: '3',
      label: '执行历史',
      children: (
        <>
          {currentCaseId ? (
            <InterfaceApiCaseResultTable
              apiCaseId={currentCaseId}
              reload={reloadResult}
            />
          ) : (
            <Empty />
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
          caseApiId={currentCaseId!}
          error_stop={errorJump}
          env_id={runningEnvId!}
        />
      </MyDrawer>

      <MyDrawer open={choiceGroupOpen} setOpen={setChoiceGroupOpen}>
        <GroupApiChoiceTable
          projectId={currentProjectId}
          refresh={refresh}
          currentCaseId={currentCaseId!}
        />
      </MyDrawer>

      <MyDrawer open={choiceOpen} setOpen={setChoiceOpen}>
        <InterfaceCaseChoiceApiTable
          projectId={parseInt(projectId!)}
          currentCaseApiId={currentCaseId}
          refresh={refresh}
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
            <Splitter.Panel resizable={false} size={defaultSize} max="100%">
              <ProCard
                bodyStyle={{
                  padding: 2,
                  borderRadius: '12px',
                }}
                extra={<ApisCardExtra />}
              >
                <MyTabs
                  defaultActiveKey={activeKey}
                  onChangeKey={setActiveKey}
                  activeKey={activeKey}
                  items={APIStepItems}
                />
              </ProCard>
            </Splitter.Panel>
            {!hiddenRunButton && (
              <Splitter.Panel resizable={false}>
                <RunConfig
                  onMenuClick={onMenuClick}
                  run={debugCase}
                  onEnvChange={onEnvChange}
                  onErrorJumpChange={onErrorJumpChange}
                  currentProjectId={currentProjectId}
                />
              </Splitter.Panel>
            )}
          </Splitter>
        </ProCard>

        <FloatButton.BackTop />
      </RcResizeObserver>
    </>
  );
};

export default Index;

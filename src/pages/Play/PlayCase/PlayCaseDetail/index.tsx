import {
  addCaseContent,
  associationInterface,
  queryPlayCaseVars,
  queryPlayStepContentByCaseId,
  reorderCaseStep,
} from '@/api/play/playCase';
import { executePlayCaseByBack } from '@/api/play/result';
import DnDDraggable from '@/components/DnDDraggable';
import { DraggableItem } from '@/components/DnDDraggable/type';
import MyDrawer from '@/components/MyDrawer';
import MyTabs from '@/components/MyTabs';
import InterfaceCaseChoiceApiTable from '@/pages/Httpx/InterfaceApiCaseResult/InterfaceCaseChoiceApiTable';
import { IPlayStepContent } from '@/pages/Play/componets/uiTypes';
import PlayCaseStepContents from '@/pages/Play/PlayCase/PlayCaseDetail/PlayCaseStepContents';
import PlayCaseVars from '@/pages/Play/PlayCase/PlayCaseDetail/PlayCaseVars';
import PlayCommonChoiceTable from '@/pages/Play/PlayCase/PlayCaseDetail/PlayCommonChoiceTable';
import PlayGroupChoiceTable from '@/pages/Play/PlayCase/PlayCaseDetail/PlayGroupChoiceTable';
import RunConfig from '@/pages/Play/PlayCase/PlayCaseDetail/RunConfig';
import PlayCaseResultDetail from '@/pages/Play/PlayResult/PlayCaseResultDetail';
import PlayCaseResultTable from '@/pages/Play/PlayResult/PlayCaseResultTable';
import PlayStepDetail from '@/pages/Play/PlayStep/PlayStepDetail';
import { useParams } from '@@/exports';
import {
  ApiOutlined,
  DatabaseOutlined,
  EditOutlined,
  PythonOutlined,
  QuestionOutlined,
  SelectOutlined,
  UngroupOutlined,
} from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import { Dropdown, Empty, FloatButton, message, Splitter } from 'antd';
import { RadioChangeEvent } from 'antd/lib/radio/interface';
import { debounce } from 'lodash';
import RcResizeObserver from 'rc-resize-observer';
import { useCallback, useEffect, useState } from 'react';

const Index = () => {
  const { caseId, projectId, moduleId } = useParams<{
    caseId: string;
    projectId: string;
    moduleId: string;
  }>();

  const [uiStepsContent, setUIStepsContent] = useState<DraggableItem[]>([]);
  const [uiSteps, setUISteps] = useState<IPlayStepContent[]>([]);
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [openAddStepDrawer, setOpenAddStepDrawer] = useState(false);
  const [openChoiceStepDrawer, setOpenChoiceStepDrawer] = useState(false);
  const [openChoiceAPIDrawer, setOpenChoiceAPIDrawer] = useState(false);
  const [openChoiceGroupStepDrawer, setOpenChoiceGroupStepDrawer] =
    useState(false);
  const [refresh, setRefresh] = useState<number>(0);
  const [runOpen, setRunOpen] = useState(false);
  const [varsNum, setVarsNum] = useState(0);
  const [defaultSize, setDefaultSize] = useState('80%');
  const [errorStop, setErrorStop] = useState<boolean>(true);
  const [runningStyle, setRunningStyle] = useState<number>(1);

  useEffect(() => {
    if (!caseId) return;
    const abortController = new AbortController();
    Promise.all([
      queryPlayStepContentByCaseId(caseId),
      queryPlayCaseVars(caseId),
    ]).then(([steps, vars]) => {
      if (steps.code === 0 && steps) {
        setUISteps(steps.data);
      }
      if (vars.code === 0 && vars.data) {
        setVarsNum(vars.data.length);
      }
    });
    return () => {
      abortController.abort();
    };
  }, [caseId, refresh]);

  //set case steps content
  useEffect(() => {
    if (!caseId || !projectId || !moduleId) return;
    if (uiSteps && uiSteps.length > 0) {
      console.log('=====', uiSteps);
      setUIStepsContent(
        uiSteps.map((item, index) => ({
          id: index,
          step_id: item.id,
          content: (
            <PlayCaseStepContents
              id={index}
              step={index + 1}
              caseId={parseInt(caseId)}
              projectId={parseInt(projectId)}
              moduleId={parseInt(moduleId)}
              callback={handelRefresh}
              stepContent={item}
              collapsible={true}
            />
          ),
        })),
      );
    }
  }, [uiSteps]);

  const onErrorJumpChange = (value: boolean) => {
    setErrorStop(value);
  };
  const onDragEnd = async (reorderedUIContents: any[]) => {
    console.log(reorderedUIContents);
    if (caseId) {
      const reorderData = reorderedUIContents.map((item) => item.step_id);
      reorderCaseStep({
        case_id: parseInt(caseId),
        content_id_list: reorderData,
      }).then(async () => setRefresh(refresh + 1));
    }
  };
  const handelRefresh = async () => {
    setRefresh(refresh + 1);
    setOpenAddStepDrawer(false);
    setOpenChoiceStepDrawer(false);
    setOpenChoiceGroupStepDrawer(false);
    setOpenChoiceAPIDrawer(false);
  };

  const onMenuClick = (e: RadioChangeEvent) => {
    const { value } = e.target;
    setRunningStyle(value);
  };
  const AddUIStep = () => {
    setOpenAddStepDrawer(true);
    const currStepIndex = stepIndex + 1;
    setStepIndex(currStepIndex);
  };

  const AddContent = async (content_type: number) => {
    if (!caseId) return;
    const { code } = await addCaseContent({
      case_id: parseInt(caseId),
      content_type: content_type,
    });
    if (code === 0) {
      await handelRefresh();
    }
  };
  const AddStepExtra = () => {
    return (
      <>
        <Dropdown.Button
          type={'primary'}
          menu={{
            items: [
              {
                key: 'add_step',
                label: '添加私有步骤',
                icon: <EditOutlined style={{ color: 'orange' }} />,
                onClick: AddUIStep,
              },
              {
                key: 'add_script',
                label: '添加脚本',
                icon: <PythonOutlined style={{ color: 'orange' }} />,
                onClick: async () => await AddContent(4),
              },
              {
                key: 'add_db_script',
                label: '添加数据库脚本',
                icon: <DatabaseOutlined style={{ color: 'orange' }} />,
                onClick: async () => await AddContent(8),
              },
              {
                key: 'add_interface',
                label: '添加接口',
                icon: <ApiOutlined style={{ color: 'orange' }} />,
                onClick: () => {
                  setOpenChoiceAPIDrawer(true);
                },
              },
              {
                key: 'add_asserts',
                label: '添加可视化断言',
                icon: <QuestionOutlined style={{ color: 'orange' }} />,
                onClick: async () => await AddContent(6),
              },

              {
                type: 'divider',
              },

              {
                key: 'choice_group',
                label: '选择公共组',
                icon: <UngroupOutlined style={{ color: 'blue' }} />,
                onClick: () => setOpenChoiceGroupStepDrawer(true),
              },
              {
                key: 'choice_step',
                label: '选择公共步骤',
                icon: <SelectOutlined style={{ color: 'blue' }} />,
                onClick: () => setOpenChoiceStepDrawer(true),
              },
            ],
          }}
        >
          添加
        </Dropdown.Button>
      </>
    );
  };

  const CornItems = [
    {
      key: '1',
      label: (
        <span>
          变量 (<span style={{ color: 'green' }}>{varsNum}</span>)
        </span>
      ),

      children: <PlayCaseVars currentCaseId={caseId!} />,
    },
    {
      key: '2',
      label: (
        <span>
          步骤 (<span style={{ color: 'green' }}>{uiStepsContent.length}</span>)
        </span>
      ),
      children: (
        <ProCard>
          {uiSteps.length > 0 ? (
            <DnDDraggable
              items={uiStepsContent}
              setItems={setUIStepsContent}
              orderFetch={onDragEnd}
            />
          ) : (
            <Empty description={'暂无数据'} />
          )}
        </ProCard>
      ),
    },
    {
      key: '3',
      label: '调试历史',
      children: <PlayCaseResultTable caseId={parseInt(caseId!)} />,
    },
  ];

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
      setDefaultSize(breakpoint?.size || '80%');
    }, 100),
    [],
  );

  const runCase = async () => {
    if (!caseId) return;
    if (runningStyle === 1) {
      executePlayCaseByBack({ case_id: caseId, error_stop: errorStop }).then(
        async ({ code }) => {
          if (code === 0) {
            message.success('后台运行中。。');
          }
        },
      );
    } else {
      setRunOpen(true);
    }
  };

  /**
   * 关联接口到用例
   * @param values
   */
  const selectAPI2Case = async (values: number[]) => {
    let value;
    if (values.length > 0) value = values[0];
    if (!value || !caseId) return;
    const { code, data } = await associationInterface({
      case_id: parseInt(caseId),
      interface_id: value,
    });
    if (code === 0) {
      await handelRefresh();
    }
  };
  return (
    <>
      <RcResizeObserver onResize={handleResize}>
        <ProCard
          style={{ height: '100%' }}
          bodyStyle={{ height: '100%', padding: '10px', minHeight: '100vh' }}
        >
          <Splitter
            style={{ height: '100%', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }}
          >
            <Splitter.Panel defaultSize={defaultSize} max="100%">
              <ProCard bodyStyle={{ minHeight: '100hv', overflow: 'auto' }}>
                <MyTabs
                  defaultActiveKey={'2'}
                  items={CornItems}
                  tabBarExtraContent={<AddStepExtra />}
                />
              </ProCard>
            </Splitter.Panel>
            <Splitter.Panel>
              <RunConfig
                onMenuClick={onMenuClick}
                run={runCase}
                onErrorJumpChange={onErrorJumpChange}
              />
            </Splitter.Panel>
          </Splitter>
        </ProCard>
      </RcResizeObserver>
      <FloatButton.BackTop />
      <>
        <MyDrawer
          name={'添加私有步骤'}
          width={'auto'}
          open={openAddStepDrawer}
          setOpen={setOpenAddStepDrawer}
        >
          {caseId && (
            <PlayStepDetail
              currentProjectId={parseInt(projectId!)}
              currentModuleId={parseInt(moduleId!)}
              play_case_id={parseInt(caseId)}
              callback={handelRefresh}
            />
          )}
        </MyDrawer>
        <MyDrawer
          name={'关联公共步骤'}
          open={openChoiceStepDrawer}
          setOpen={setOpenChoiceStepDrawer}
        >
          <PlayCommonChoiceTable
            projectId={projectId}
            caseId={caseId}
            callBackFunc={handelRefresh}
          />
        </MyDrawer>

        <MyDrawer
          name={'关联公共步骤组'}
          open={openChoiceGroupStepDrawer}
          setOpen={setOpenChoiceGroupStepDrawer}
        >
          <PlayGroupChoiceTable
            projectId={projectId}
            caseId={caseId}
            callBackFunc={handelRefresh}
          />
        </MyDrawer>
        <MyDrawer name={'UI Case Logs'} open={runOpen} setOpen={setRunOpen}>
          <PlayCaseResultDetail
            caseId={parseInt(caseId!)}
            openStatus={runOpen}
            error_stop={errorStop}
          />
        </MyDrawer>
      </>

      <MyDrawer open={openChoiceAPIDrawer} setOpen={setOpenChoiceAPIDrawer}>
        <InterfaceCaseChoiceApiTable
          projectId={parseInt(projectId!)}
          onSelect={selectAPI2Case}
          radio={true}
        />
      </MyDrawer>
    </>
  );
};

export default Index;

import {
  queryPlayCaseVars,
  queryPlayStepByCaseId,
  reorderCaseStep,
} from '@/api/play/playCase';
import { executePlayCaseByBack } from '@/api/play/result';
import DnDDraggable from '@/components/DnDDraggable';
import { DraggableItem } from '@/components/DnDDraggable/type';
import MyDrawer from '@/components/MyDrawer';
import MyTabs from '@/components/MyTabs';
import { IUICaseSteps } from '@/pages/Play/componets/uiTypes';
import CollapsibleUIStepCard from '@/pages/Play/PlayCase/PlayCaseDetail/CollapsibleUIStepCard';
import PlayCaseVars from '@/pages/Play/PlayCase/PlayCaseDetail/PlayCaseVars';
import PlayCommonChoiceTable from '@/pages/Play/PlayCase/PlayCaseDetail/PlayCommonChoiceTable';
import PlayGroupChoiceTable from '@/pages/Play/PlayCase/PlayCaseDetail/PlayGroupChoiceTable';
import RunConfig from '@/pages/Play/PlayCase/PlayCaseDetail/RunConfig';
import PlayCaseResultDetail from '@/pages/Play/PlayResult/PlayCaseResultDetail';
import PlayCaseResultTable from '@/pages/Play/PlayResult/PlayCaseResultTable';
import PlayStepInfo from '@/pages/Play/PlayStep/PlayStepInfo';
import { useParams } from '@@/exports';
import {
  EditOutlined,
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
  const [uiSteps, setUISteps] = useState<IUICaseSteps[]>([]);
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [openAddStepDrawer, setOpenAddStepDrawer] = useState(false);
  const [openChoiceStepDrawer, setOpenChoiceStepDrawer] = useState(false);
  const [openChoiceGroupStepDrawer, setOpenChoiceGroupStepDrawer] =
    useState(false);
  const [refresh, setRefresh] = useState<number>(0);
  const [runOpen, setRunOpen] = useState(false);
  const [varsNum, setVarsNum] = useState(0);
  const [defaultSize, setDefaultSize] = useState('80%');
  const [errorStop, setErrorStop] = useState<boolean>(true);
  const [runningStyle, setRunningStyle] = useState<number>(1);
  useEffect(() => {
    if (caseId) {
      Promise.all([
        queryPlayStepByCaseId(caseId), // 获取步骤数据
        queryPlayCaseVars(caseId),
      ]).then(([steps, vars]) => {
        if (steps.code === 0 && steps) {
          setUISteps(steps.data);
        }
        if (vars.code === 0 && vars.data) {
          setVarsNum(vars.data.length);
        }
      });
    }
  }, [refresh, caseId]);

  //set case steps content
  useEffect(() => {
    if (uiSteps && uiSteps.length > 0) {
      setUIStepsContent(
        uiSteps.map((item, index) => ({
          id: index,
          step_id: item.id,
          content: (
            <CollapsibleUIStepCard
              step={index + 1}
              caseId={caseId!}
              currentProjectId={projectId}
              callBackFunc={handelRefresh}
              uiStepInfo={item}
            />
          ),
        })),
      );
    }
  }, [refresh, uiSteps]);

  const onErrorJumpChange = (value: boolean) => {
    setErrorStop(value);
  };
  const onDragEnd = async (reorderedUIContents: any[]) => {
    if (caseId) {
      const reorderData = reorderedUIContents.map((item) => item.step_id);
      reorderCaseStep({ caseId: parseInt(caseId), stepIds: reorderData }).then(
        async () => setRefresh(refresh + 1),
      );
    }
  };
  const handelRefresh = async () => {
    setRefresh(refresh + 1);
    setOpenAddStepDrawer(false);
    setOpenChoiceStepDrawer(false);
  };

  const onMenuClick = (e: RadioChangeEvent) => {
    const { value } = e.target;
    setRunningStyle(value);
  };

  const AddStepExtra = () => {
    const AddUIStep = () => {
      setOpenAddStepDrawer(true);
      const currStepIndex = stepIndex + 1;
      setStepIndex(currStepIndex);
    };
    return (
      <>
        <Dropdown.Button
          type={'primary'}
          menu={{
            items: [
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
              {
                type: 'divider',
              },
              {
                key: 'add_step',
                label: '添加私有步骤',
                icon: <EditOutlined style={{ color: 'blue' }} />,
                onClick: AddUIStep,
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
      executePlayCaseByBack({ caseId: caseId, error_stop: errorStop }).then(
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
            <Splitter.Panel resizable={false} size={defaultSize} max="100%">
              <ProCard
                extra={<AddStepExtra />}
                bodyStyle={{ minHeight: '100hv' }}
              >
                <MyTabs defaultActiveKey={'2'} items={CornItems} />
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
            <PlayStepInfo
              readonly={false}
              currentProjectId={parseInt(projectId!)}
              currentModuleId={parseInt(moduleId!)}
              callback={handelRefresh}
              is_common_step={false}
              play_case_id={caseId}
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
            caseId={caseId}
            openStatus={runOpen}
            error_stop={errorStop}
          />
        </MyDrawer>
      </>
    </>
  );
};

export default Index;

import { IModuleEnum } from '@/api';
import {
  queryPlayCaseVars,
  queryPlayStepByCaseId,
  reorderCaseStep,
} from '@/api/play/playCase';
import { executePlayCaseByBack } from '@/api/play/result';
import { queryEnvByProjectIdFormApi } from '@/components/CommonFunc';
import DnDDraggable from '@/components/DnDDraggable';
import { DraggableItem } from '@/components/DnDDraggable/type';
import MyDrawer from '@/components/MyDrawer';
import MyTabs from '@/components/MyTabs';
import { IUICaseSteps } from '@/pages/Play/componets/uiTypes';
import CollapsibleUIStepCard from '@/pages/Play/PlayCase/PlayCaseDetail/CollapsibleUIStepCard';
import PlayCaseVars from '@/pages/Play/PlayCase/PlayCaseDetail/PlayCaseVars';
import PlayCommonChoiceTable from '@/pages/Play/PlayCase/PlayCaseDetail/PlayCommonChoiceTable';
import PlayGroupChoiceTable from '@/pages/Play/PlayCase/PlayCaseDetail/PlayGroupChoiceTable';
import PlayCaseResultDetail from '@/pages/Play/PlayResult/PlayCaseResultDetail';
import PlayCaseResultTable from '@/pages/Play/PlayResult/PlayCaseResultTable';
import PlayStepDetail from '@/pages/Play/PlayStep/PlayStepDetail';
import { ModuleEnum } from '@/utils/config';
import { fetchModulesEnum } from '@/utils/somefunc';
import { useParams } from '@@/exports';
import {
  ArrowRightOutlined,
  SelectOutlined,
  UngroupOutlined,
} from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import { Dropdown, Empty, FloatButton, MenuProps, message } from 'antd';
import { useEffect, useState } from 'react';

const Index = () => {
  const { caseId, projectId, moduleId } = useParams<{
    caseId: string;
    projectId: string;
    moduleId: string;
  }>();

  const [envs, setEnvs] = useState<{ label: string; value: number | null }[]>(
    [],
  );
  const [moduleEnum, setModuleEnum] = useState<IModuleEnum[]>([]);
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
  const [draggableDisabled, setDraggableDisabled] = useState(false);

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

  useEffect(() => {
    if (projectId) {
      // 获取模块枚举和环境数据
      Promise.all([
        fetchModulesEnum(projectId, ModuleEnum.UI_CASE, setModuleEnum),
        queryEnvByProjectIdFormApi(projectId, setEnvs, true),
      ]).then();
    }
  }, [projectId]);

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
              envs={envs}
              caseId={caseId!}
              currentProjectId={projectId}
              callBackFunc={handelRefresh}
              collapsible={true} // 默认折叠
              uiStepInfo={item}
            />
          ),
        })),
      );
    }
  }, [refresh, uiSteps, envs]);

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

  const onMenuClick: MenuProps['onClick'] = (e) => {
    const { key } = e;
    if (caseId) {
      if (key === '1') {
        executePlayCaseByBack({ caseId: caseId }).then(async ({ code }) => {
          if (code === 0) {
            message.success('后台运行中。。');
          }
        });
      } else {
        setRunOpen(true);
      }
    }
  };
  const items = [
    {
      key: '1',
      label: '后台运行',
      icon: <ArrowRightOutlined />,
    },
    {
      key: '2',
      label: '实时日志运行',
      icon: <ArrowRightOutlined />,
    },
  ];

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
                key: 'choice_group',
                label: '选择公共步骤',
                icon: <SelectOutlined style={{ color: 'blue' }} />,
                onClick: () => setOpenChoiceStepDrawer(true),
              },
              {
                type: 'divider',
              },
              {
                key: 'choice_group',
                label: '添加私有步骤',
                icon: <UngroupOutlined style={{ color: 'blue' }} />,
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
      children: <PlayCaseResultTable caseId={parseInt(caseId)} />,
    },
  ];

  return (
    <ProCard split={'horizontal'}>
      <MyDrawer
        name={'Add Self Step'}
        width={'auto'}
        open={openAddStepDrawer}
        setOpen={setOpenAddStepDrawer}
      >
        {caseId && (
          <PlayStepDetail
            callBack={handelRefresh}
            caseId={parseInt(caseId)}
            isCommonStep={false}
            caseProjectId={projectId}
            caseModuleId={moduleId}
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
        <PlayCaseResultDetail caseId={caseId} openStatus={runOpen} />
      </MyDrawer>
      <ProCard extra={<AddStepExtra />} bodyStyle={{ minHeight: '100hv' }}>
        <MyTabs defaultActiveKey={'2'} items={CornItems} />
      </ProCard>
      <FloatButton.BackTop />
    </ProCard>
  );
};

export default Index;

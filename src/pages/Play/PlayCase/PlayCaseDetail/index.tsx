import { IModuleEnum } from '@/api';
import {
  addPlayCaseBasicInfo,
  editPlayCaseBaseInfo,
  playCaseDetailById,
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
import { IUICase, IUICaseSteps } from '@/pages/Play/componets/uiTypes';
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
import { ArrowRightOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import {
  Button,
  Divider,
  Dropdown,
  Empty,
  FloatButton,
  Form,
  MenuProps,
  message,
} from 'antd';
import { FC, useEffect, useState } from 'react';
import { history } from 'umi';

const Index = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const [form] = Form.useForm<IUICase>();
  // 1详情 2新增 3 修改
  const [currentMode, setCurrentMode] = useState(1);
  const [currentProjectId, setCurrentProjectId] = useState<number>();
  const [currentModuleId, setCurrentModuleId] = useState<number>();

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
  /**
   * 如果是caseId 传递 这个证明是case 详情页
   */
  useEffect(() => {
    if (caseId) {
      Promise.all([
        playCaseDetailById(caseId), // 获取 case 详情
        queryPlayStepByCaseId(caseId), // 获取步骤数据
        queryPlayCaseVars(caseId),
      ]).then(([detail, steps, vars]) => {
        if (detail.code === 0) {
          form.setFieldsValue(detail.data);
          setCurrentProjectId(detail.data.project_id);
          setCurrentModuleId(detail.data.module_id);
        }
        if (steps.code === 0 && steps) {
          setUISteps(steps.data);
        }
        if (vars.code === 0 && vars.data) {
          setVarsNum(vars.data.length);
        }
      });
    } else {
      setCurrentMode(2);
    }
  }, [refresh, caseId]);

  useEffect(() => {
    if (currentProjectId) {
      // 获取模块枚举和环境数据
      Promise.all([
        fetchModulesEnum(currentProjectId, ModuleEnum.UI_CASE, setModuleEnum),
        queryEnvByProjectIdFormApi(currentProjectId, setEnvs, true),
      ]).then();
    }
  }, [currentProjectId]);

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
              currentProjectId={currentProjectId}
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
  const SaveOrUpdateCaseInfo = async () => {
    const values = form.getFieldsValue(true);
    console.log(values);
    if (caseId) {
      editPlayCaseBaseInfo(values).then(async ({ code, msg }) => {
        if (code === 0) {
          message.success(msg);
          setCurrentMode(1);
        }
      });
    } else {
      addPlayCaseBasicInfo(values).then(async ({ code, data, msg }) => {
        if (code === 0) {
          message.success(msg);
          history.push(`/ui/case/detail/caseId=${data.id}`);
        }
      });
    }
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
  const CaseButtonExtra: FC<{ currentStatus: number }> = ({
    currentStatus,
  }) => {
    switch (currentStatus) {
      case 1:
        return (
          <div style={{ display: 'flex' }}>
            <Dropdown.Button
              menu={{ items, onClick: onMenuClick }}
              icon={<PlayCircleOutlined />}
            >
              Run By
            </Dropdown.Button>
            <Divider type={'vertical'} />
            <Button
              type={'primary'}
              style={{ marginLeft: 10 }}
              onClick={() => setCurrentMode(3)}
            >
              Edit
            </Button>
          </div>
        );
      case 2:
        return (
          <Button onClick={SaveOrUpdateCaseInfo} type={'primary'}>
            Save
          </Button>
        );
      case 3:
        return (
          <>
            <Button onClick={SaveOrUpdateCaseInfo} type={'primary'}>
              Save
            </Button>
            <Button style={{ marginLeft: 5 }} onClick={() => setCurrentMode(1)}>
              Cancel
            </Button>
          </>
        );
      default:
        return null;
    }
  };
  const AddStepExtra = () => {
    const AddUIStep = () => {
      setOpenAddStepDrawer(true);
      const currStepIndex = stepIndex + 1;
      setStepIndex(currStepIndex);
    };
    return (
      <>
        {caseId && (
          <>
            <Button
              type={'primary'}
              onClick={() => setOpenChoiceGroupStepDrawer(true)}
            >
              Choice Group Step
            </Button>
            <Divider type={'vertical'} />

            <Button
              type={'primary'}
              onClick={() => setOpenChoiceStepDrawer(true)}
            >
              Choice Common Step
            </Button>
            <Divider type={'vertical'} />
            <Button type={'primary'} onClick={AddUIStep}>
              Add Self Step
            </Button>
          </>
        )}
      </>
    );
  };

  const CornItems = [
    {
      key: '1',
      label: (
        <span>
          Vars (<span style={{ color: 'green' }}>{varsNum}</span>)
        </span>
      ),

      children: <PlayCaseVars currentCaseId={caseId!} />,
    },
    {
      key: '2',
      label: (
        <span>
          Steps (<span style={{ color: 'green' }}>{uiStepsContent.length}</span>
          )
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
            caseProjectId={currentProjectId}
            caseModuleId={currentModuleId}
          />
        )}
      </MyDrawer>
      <MyDrawer
        name={'Choice Common Step'}
        open={openChoiceStepDrawer}
        setOpen={setOpenChoiceStepDrawer}
      >
        <PlayCommonChoiceTable
          projectId={currentProjectId}
          caseId={caseId}
          callBackFunc={handelRefresh}
        />
      </MyDrawer>

      <MyDrawer
        name={'Choice Group Step'}
        open={openChoiceGroupStepDrawer}
        setOpen={setOpenChoiceGroupStepDrawer}
      >
        <PlayGroupChoiceTable
          projectId={currentProjectId}
          caseId={caseId}
          callBackFunc={handelRefresh}
        />
      </MyDrawer>
      <MyDrawer name={'UI Case Logs'} open={runOpen} setOpen={setRunOpen}>
        <PlayCaseResultDetail caseId={caseId} openStatus={runOpen} />
      </MyDrawer>
      {/*<ProCard extra={<CaseButtonExtra currentStatus={currentMode} />}>*/}
      {/*  <ProForm*/}
      {/*    disabled={currentMode === 1}*/}
      {/*    layout={'horizontal'}*/}
      {/*    submitter={false}*/}
      {/*    form={form}*/}
      {/*  >*/}
      {/*    <PlayBaseForm*/}
      {/*      setCurrentProjectId={setCurrentProjectId}*/}
      {/*      moduleEnum={moduleEnum}*/}
      {/*    />*/}
      {/*  </ProForm>*/}
      {/*</ProCard>*/}
      <ProCard extra={<AddStepExtra />}>
        <MyTabs defaultActiveKey={'2'} items={CornItems} />
      </ProCard>
      {caseId ? <PlayCaseResultTable caseId={parseInt(caseId)} /> : null}
      <FloatButton.BackTop />
    </ProCard>
  );
};

export default Index;

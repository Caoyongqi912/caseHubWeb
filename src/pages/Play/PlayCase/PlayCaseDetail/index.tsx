import {
  addCaseContent,
  associationInterface,
  associationPlayStep,
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
  BranchesOutlined,
  CloseOutlined,
  DatabaseOutlined,
  EditOutlined,
  PlayCircleOutlined,
  PythonOutlined,
  QuestionOutlined,
  SelectOutlined,
  ThunderboltOutlined,
  UngroupOutlined,
} from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import {
  Button,
  Drawer,
  Dropdown,
  Empty,
  FloatButton,
  message,
  Space,
  TabsProps,
  theme,
} from 'antd';
import { RadioChangeEvent } from 'antd/lib/radio/interface';
import { FC, useEffect, useMemo, useState } from 'react';

const Index: FC = () => {
  const { caseId, projectId, moduleId } = useParams<{
    caseId: string;
    projectId: string;
    moduleId: string;
  }>();
  const { token } = theme.useToken();

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
  const [isRunConfigVisible, setIsRunConfigVisible] = useState(false);
  const [activeKey, setActiveKey] = useState('2');
  const [errorContinue, setErrorContinue] = useState<boolean>(false);
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

  const onErrorContinueChange = (value: boolean) => {
    setErrorContinue(value);
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
      <Space>
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
                key: 'add_condition',
                label: '添加条件分支',
                icon: <BranchesOutlined style={{ color: 'orange' }} />,
                onClick: async () => await AddContent(3),
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
      </Space>
    );
  };

  const CornItems: TabsProps['items'] = useMemo(
    () => [
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
            步骤 (
            <span style={{ color: 'green' }}>{uiStepsContent.length}</span>)
          </span>
        ),
        children: (
          <div
            style={{
              height: 'calc(120vh - 280px)',
              overflowY: 'auto',
              overflowX: 'hidden',
              padding: '12px 16px',
              background: 'transparent',
              borderRadius: 12,
              border: '1px solid rgba(0, 0, 0, 0.1)',
              transition: 'box-shadow 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow =
                '0 4px 12px rgba(24, 144, 255, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(24, 144, 255, 0.3)';
            }}
          >
            {uiSteps.length > 0 ? (
              <DnDDraggable
                items={uiStepsContent}
                setItems={setUIStepsContent}
                orderFetch={onDragEnd}
              />
            ) : (
              <Empty description={'暂无数据'} />
            )}
          </div>
        ),
      },
      {
        key: '3',
        label: '调试历史',
        children: <PlayCaseResultTable caseId={parseInt(caseId!)} />,
      },
    ],
    [caseId, varsNum, uiStepsContent.length, uiSteps.length],
  );

  const runCase = async () => {
    if (!caseId) return;
    if (runningStyle === 1) {
      executePlayCaseByBack({
        case_id: caseId,
        error_continue: errorContinue,
      }).then(async ({ code }) => {
        if (code === 0) {
          message.success('后台运行中。。');
          setIsRunConfigVisible(false);
          setActiveKey('3');
        }
      });
    } else {
      setRunOpen(true);
      setIsRunConfigVisible(false);
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

  const choice_common_steps = async (
    quote: boolean,
    selectedRowKeys: React.Key[],
  ) => {
    if (!caseId) return;
    const { code } = await associationPlayStep({
      case_id: parseInt(caseId),
      play_step_id_list: selectedRowKeys as number[],
      quote: quote,
    });
    if (code === 0) {
      await handelRefresh();
    }
  };

  return (
    <>
      <Drawer
        title={
          <Space>
            <ThunderboltOutlined style={{ color: token.colorPrimary }} />
            <span style={{ fontWeight: 600 }}>运行配置</span>
          </Space>
        }
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
          run={runCase}
          onErrorContinueChange={onErrorContinueChange}
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
            activeKey={activeKey}
            items={CornItems}
            tabBarExtraContent={<AddStepExtra />}
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
          onSelect={choice_common_steps}
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
          errorContinue={errorContinue}
        />
      </MyDrawer>

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

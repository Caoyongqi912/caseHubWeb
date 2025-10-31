import { IModuleEnum } from '@/api';
import {
  addCaseContent,
  baseInfoApiCase,
  initAPICondition,
  insertApiCase,
  queryContentsByCaseId,
  reorderCaseContents,
  runApiCaseBack,
  setApiCase,
} from '@/api/inter/interCase';
import DnDDraggable from '@/components/DnDDraggable';
import MyDrawer from '@/components/MyDrawer';
import GroupApiChoiceTable from '@/pages/Httpx/Interface/interfaceApiGroup/GroupApiChoiceTable';
import ApiCaseBaseForm from '@/pages/Httpx/InterfaceApiCase/InterfaceApiCaseDetail/ApiCaseBaseForm';
import CaseContentCollapsible from '@/pages/Httpx/InterfaceApiCase/InterfaceApiCaseDetail/CaseContentCollapsible';
import InterfaceApiCaseVars from '@/pages/Httpx/InterfaceApiCase/InterfaceApiCaseDetail/InterfaceApiCaseVars';
import InterfaceApiCaseResultDrawer from '@/pages/Httpx/InterfaceApiCaseResult/InterfaceApiCaseResultDrawer';
import InterfaceApiCaseResultTable from '@/pages/Httpx/InterfaceApiCaseResult/InterfaceApiCaseResultTable';
import InterfaceCaseChoiceApiTable from '@/pages/Httpx/InterfaceApiCaseResult/InterfaceCaseChoiceApiTable';
import { IInterfaceCaseContent } from '@/pages/Httpx/types';
import { ModuleEnum } from '@/utils/config';
import { fetchModulesEnum } from '@/utils/somefunc';
import { useParams } from '@@/exports';
import {
  AimOutlined,
  AlignLeftOutlined,
  ArrowRightOutlined,
  BranchesOutlined,
  FieldTimeOutlined,
  PlayCircleOutlined,
  PythonOutlined,
  SelectOutlined,
  UngroupOutlined,
} from '@ant-design/icons';
import { ProCard, ProForm } from '@ant-design/pro-components';
import {
  Button,
  Divider,
  Dropdown,
  Empty,
  FloatButton,
  Form,
  MenuProps,
  message,
  Tabs,
  TabsProps,
} from 'antd';
import { FC, useEffect, useState } from 'react';
import { history } from 'umi';

const Index = () => {
  const { caseApiId } = useParams<{ caseApiId: string }>();
  const [baseForm] = Form.useForm();
  const [caseContentElement, setCaseContentElement] = useState<any[]>([]);
  const [moduleEnum, setModuleEnum] = useState<IModuleEnum[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<number>();
  const [currentModuleId, setCurrentModuleId] = useState<number>();
  const [currentStatus, setCurrentStatus] = useState(1);

  const [caseContents, setCaseContents] = useState<IInterfaceCaseContent[]>([]);
  const [caseContentsStepLength, setCaseContentsStepLength] =
    useState<number>(0);

  const [editCase, setEditCase] = useState<number>(0);
  const [runOpen, setRunOpen] = useState(false);
  const [choiceOpen, setChoiceOpen] = useState(false);
  const [choiceGroupOpen, setChoiceGroupOpen] = useState(false);
  const [reloadResult, setReloadResult] = useState(0);

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
    } else {
      setCurrentStatus(2);
    }
  }, [editCase, caseApiId]);

  useEffect(() => {
    if (currentProjectId) {
      Promise.all([
        fetchModulesEnum(currentProjectId, ModuleEnum.API_CASE, setModuleEnum),
      ]).then();
    }
  }, [currentProjectId]);

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

  /**
   * 保存基本信息
   */
  const saveBaseInfo = async () => {
    const values = await baseForm.getFieldsValue(true);
    if (caseApiId) {
      await setApiCase(values).then(async ({ code, msg }) => {
        if (code === 0) {
          setCurrentStatus(1);
          await message.success(msg);
        }
      });
    } else {
      await insertApiCase(values).then(async ({ code, data }) => {
        if (code === 0) {
          history.push(`/interface/caseApi/detail/caseApiId=${data.id}`);
          message.success('添加成功');
        }
      });
    }
  };

  const onMenuClick: MenuProps['onClick'] = (e) => {
    const { key } = e;
    if (caseApiId) {
      if (key === '1') {
        runApiCaseBack(caseApiId).then(async ({ code }) => {
          if (code === 0) {
            setReloadResult(reloadResult + 1);
            message.success('后台运行中。。');
          }
        });
      } else {
        setRunOpen(true);
      }
    }
  };

  const DetailExtra: FC<{ currentStatus: number }> = ({ currentStatus }) => {
    switch (currentStatus) {
      case 1:
        return (
          <div style={{ display: 'flex' }}>
            <Dropdown.Button
              menu={{
                items: [
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
                ],
                onClick: onMenuClick,
              }}
              icon={<PlayCircleOutlined />}
            >
              Run By
            </Dropdown.Button>
            <Divider type={'vertical'} />
            <Button
              type={'primary'}
              style={{ marginLeft: 10 }}
              onClick={() => setCurrentStatus(3)}
            >
              Edit
            </Button>
          </div>
        );
      case 2:
        return (
          <Button onClick={saveBaseInfo} type={'primary'}>
            Save
          </Button>
        );
      case 3:
        return (
          <>
            <Button onClick={saveBaseInfo} type={'primary'}>
              Save
            </Button>
            <Button
              style={{ marginLeft: 5 }}
              onClick={() => setCurrentStatus(1)}
            >
              Cancel
            </Button>
          </>
        );
      default:
        return null;
    }
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

  const ApisCardExtra: FC<{ current: number }> = ({ current }) => {
    switch (current) {
      case 1:
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
      default:
        return null;
    }
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
      <ProCard
        split={'horizontal'}
        extra={<DetailExtra currentStatus={currentStatus} />}
      >
        <ProCard>
          <ProForm
            disabled={currentStatus === 1}
            form={baseForm}
            submitter={false}
          >
            <ApiCaseBaseForm
              setCurrentProjectId={setCurrentProjectId}
              setCurrentModuleId={setCurrentModuleId}
              moduleEnum={moduleEnum}
            />
          </ProForm>
        </ProCard>
        <ProCard extra={<ApisCardExtra current={currentStatus} />}>
          <Tabs
            defaultActiveKey={'2'}
            defaultValue={'2'}
            size={'large'}
            type={'card'}
            items={APIStepItems}
          />
        </ProCard>
        {caseApiId ? (
          <InterfaceApiCaseResultTable
            apiCaseId={caseApiId}
            reload={reloadResult}
          />
        ) : null}
        <FloatButton.BackTop />
      </ProCard>
    </>
  );
};

export default Index;

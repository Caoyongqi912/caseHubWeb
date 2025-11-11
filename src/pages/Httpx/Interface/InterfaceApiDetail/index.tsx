import { IModuleEnum } from '@/api';
import {
  detailInterApiById,
  insertInterApi,
  tryInterApi,
  updateInterApiById,
} from '@/api/inter';
import { queryEnvByProjectIdFormApi } from '@/components/CommonFunc';
import MyDrawer from '@/components/MyDrawer';
import MyTabs from '@/components/MyTabs';
import InterAssertList from '@/pages/Httpx/componets/InterAssertList';
import InterAuth from '@/pages/Httpx/componets/InterAuth';
import InterDoc from '@/pages/Httpx/componets/InterDoc';
import InterExtractList from '@/pages/Httpx/componets/InterExtractList';
import InterOtherSetting from '@/pages/Httpx/componets/InterOtherSetting';
import InterPerf from '@/pages/Httpx/componets/InterPerf';
import ApiAfterItems from '@/pages/Httpx/Interface/InterfaceApiDetail/ApiAfterItems';
import ApiBaseForm from '@/pages/Httpx/Interface/InterfaceApiDetail/ApiBaseForm';
import ApiBeforeItems from '@/pages/Httpx/Interface/InterfaceApiDetail/ApiBeforeItems';
import ApiDetailForm from '@/pages/Httpx/Interface/InterfaceApiDetail/ApiDetailForm';
import InterfaceApiResponseDetail from '@/pages/Httpx/InterfaceApiResponse/InterfaceApiResponseDetail';
import { IInterfaceAPI, ITryResponseInfo } from '@/pages/Httpx/types';
import { ModuleEnum } from '@/utils/config';
import { fetchModulesEnum } from '@/utils/somefunc';
import {
  ApiOutlined,
  CheckCircleOutlined,
  EditOutlined,
  FormOutlined,
  KeyOutlined,
  LineChartOutlined,
  QuestionCircleOutlined,
  SaveOutlined,
  SendOutlined,
  SettingOutlined,
  SmallDashOutlined,
} from '@ant-design/icons';
import { ProCard, ProForm } from '@ant-design/pro-components';
import {
  Button,
  FloatButton,
  Form,
  message,
  Space,
  Spin,
  TabsProps,
  Tooltip,
} from 'antd';
import { FC, useEffect, useState } from 'react';
import { history, useParams } from 'umi';

interface SelfProps {
  interfaceId?: number;
  callback: () => void;
}

const Index: FC<SelfProps> = ({ interfaceId, callback }) => {
  const { interId, moduleId, projectId } = useParams<{
    interId: string;
    projectId: string;
    moduleId: string;
  }>();
  const [interApiForm] = Form.useForm<IInterfaceAPI>();
  // 1详情 2新增 3 修改
  const [currentMode, setCurrentMode] = useState(1);
  const [currentProjectId, setCurrentProjectId] = useState<number>();
  const [envs, setEnvs] = useState<{ label: string; value: number | null }[]>(
    [],
  );
  const [moduleEnum, setModuleEnum] = useState<IModuleEnum[]>([]);
  const [tryLoading, setTryLoading] = useState(false);
  const [responseInfo, setResponseInfo] = useState<ITryResponseInfo[]>();
  const [currentInterAPIId, setCurrentInterAPIId] = useState<number>();
  const [openDoc, setOpenDoc] = useState(false);
  const [hiddenBaseInfo, setHiddenBaseInfo] = useState(false);

  useEffect(() => {
    if (projectId && moduleId) {
      interApiForm.setFieldsValue({
        project_id: parseInt(projectId),
        module_id: parseInt(moduleId),
      });
    }
    if (projectId) {
      setCurrentProjectId(parseInt(projectId));
    }
  }, [moduleId, projectId]);

  //路由用例详情打开
  useEffect(() => {
    if (interId) {
      setHiddenBaseInfo(false);
      setCurrentMode(1);
      fetchInterfaceDetails(interId).then();
    } else {
      setCurrentMode(2);
    }
  }, [interId]);

  //用例详情Drawer打开
  useEffect(() => {
    // 如果存在接口API信息，则设置当前模式、表单值、数据长度和当前接口API ID
    if (interfaceId) {
      setCurrentInterAPIId(interfaceId);
      setHiddenBaseInfo(true); //不展示基础信息
      setCurrentMode(1); // 设置当前模式为查看模式
      fetchInterfaceDetails(interfaceId).then(); //请求接口信息
    }
  }, [interfaceId]);

  // 根据API 所属项目 查询 ENV Module
  useEffect(() => {
    if (currentProjectId) {
      queryEnvByProjectIdFormApi(currentProjectId, setEnvs, true).then();
      fetchModulesEnum(currentProjectId, ModuleEnum.API, setModuleEnum).then();
    }
  }, [currentProjectId]);

  /**
   * 对用例的新增与修改
   * 区别 公共新增修改 与 从用例新增与修改
   * addFromCase 从用例新增与修改
   * addFromGroup 从API GROUP新增与修改
   */
  const SaveOrUpdate = async () => {
    await interApiForm.validateFields();
    const values = interApiForm.getFieldsValue(true);
    values.is_common = 1;
    if (interId !== undefined || values.id !== undefined) {
      //修改
      const { code, msg, data } = await updateInterApiById(values);
      if (code === 0) {
        message.success(msg);
        setCurrentMode(1);
        return true;
      }
    } else {
      //新增
      const { code, msg, data } = await insertInterApi(values);
      if (code === 0) {
        history.push(`/interface/interApi/detail/interId=${data.id}`);
      }
    }
  };

  /**
   * 查询接口喜信息
   * @param id
   */
  const fetchInterfaceDetails = async (id: string | number) => {
    const { code, data } = await detailInterApiById({ interfaceId: id });
    if (code === 0) {
      interApiForm.setFieldsValue(data);
      setCurrentProjectId(data.project_id);
    }
  };

  /**
   * 接口 try
   * @constructor
   */
  const TryClick = async () => {
    setTryLoading(true);
    const interfaceId = interId || currentInterAPIId;
    if (!interfaceId) {
      setTryLoading(false);
      return;
    }
    tryInterApi({ interfaceId: interfaceId }).then(({ code, data }) => {
      if (code === 0) {
        setResponseInfo(data);
        setTryLoading(false);
      }
    });
  };

  const DetailExtra: FC<{ currentMode: number }> = ({ currentMode }) => {
    switch (currentMode) {
      //用例详情 展示编辑按钮
      case 1:
        return (
          <>
            {interId ? (
              <>
                <Button
                  type={'primary'}
                  style={{ marginLeft: 10 }}
                  onClick={() => setCurrentMode(3)}
                >
                  <EditOutlined />
                  Edit
                </Button>
              </>
            ) : null}
          </>
        );
      //新增模式 显示保存按钮
      case 2:
        return (
          <>
            <Button
              onClick={SaveOrUpdate}
              style={{ marginLeft: 10 }}
              type={'primary'}
            >
              <SaveOutlined />
              Save
            </Button>
          </>
        );
      //编辑
      case 3:
        return (
          <Space>
            <Button onClick={SaveOrUpdate} type={'primary'}>
              <SaveOutlined />
              Save
            </Button>
            <Button style={{ marginLeft: 5 }} onClick={() => setCurrentMode(1)}>
              Cancel
            </Button>
          </Space>
        );
      default:
        return null;
    }
  };

  const TabItems: TabsProps['items'] = [
    {
      key: '1',
      label: <Tooltip title="依次执行 设置变量、脚本、SQL">前置操作</Tooltip>,
      icon: <SettingOutlined />,
      children: <ApiBeforeItems interApiForm={interApiForm} />,
    },
    {
      key: '2',
      label: '接口基础',
      icon: <ApiOutlined />,
      children: (
        <ApiDetailForm
          interApiForm={interApiForm}
          envs={envs}
          interfaceApiInfo={interApiForm.getFieldsValue(true)}
          currentMode={currentMode}
        />
      ),
    },
    {
      key: '7',
      label: '认证',
      icon: <KeyOutlined />,
      disabled: true,
      children: <InterAuth form={interApiForm} />,
    },
    {
      key: '3',
      label: '出参提取',
      icon: <EditOutlined />,
      children: <InterExtractList form={interApiForm} readonly={false} />,
    },
    {
      key: '4',
      label: '断言',
      icon: <CheckCircleOutlined />,
      children: <InterAssertList form={interApiForm} readonly={false} />,
    },
    {
      key: '5',
      label: '后置动作',
      icon: <FormOutlined />,
      children: (
        <ApiAfterItems interApiForm={interApiForm} currentMode={currentMode} />
      ),
    },
    {
      key: '8',
      label: '设置',
      icon: <SmallDashOutlined />,
      children: (
        <InterOtherSetting currentMode={currentMode} form={interApiForm} />
      ),
    },
    ...(interId
      ? [
          {
            key: '6',
            label: '压力测试',
            disabled: true,
            icon: <LineChartOutlined />,
            children: <InterPerf interfaceId={interId} />,
          },
        ]
      : []),
  ];

  return (
    <>
      <MyDrawer
        name={'API Doc'}
        width={'40%'}
        open={openDoc}
        setOpen={setOpenDoc}
      >
        <InterDoc />
      </MyDrawer>
      <ProCard bodyStyle={{ padding: 0 }}>
        <ProForm form={interApiForm} submitter={false}>
          <ApiBaseForm
            hidden={hiddenBaseInfo}
            currentMode={currentMode}
            setCurrentProjectId={setCurrentProjectId}
            moduleEnum={moduleEnum}
          />
          <ProCard>
            <MyTabs
              defaultActiveKey={'2'}
              items={TabItems}
              tabBarExtraContent={
                <Space>
                  <DetailExtra currentMode={currentMode} />
                  <Button
                    size={'middle'}
                    loading={tryLoading}
                    type={'primary'}
                    color={'danger'}
                    disabled={currentMode !== 1}
                    onClick={TryClick}
                  >
                    <SendOutlined />
                    Try
                  </Button>
                </Space>
              }
            />
          </ProCard>
        </ProForm>
        <Spin tip={'接口请求中。。'} size={'large'} spinning={tryLoading}>
          {responseInfo && (
            <InterfaceApiResponseDetail responses={responseInfo} />
          )}
        </Spin>
        <FloatButton
          icon={<QuestionCircleOutlined />}
          type="primary"
          onClick={() => setOpenDoc(true)}
          style={{ insetInlineEnd: 24 }}
        />
      </ProCard>
    </>
  );
};

export default Index;

import { IObjGet } from '@/api';
import {
  copyCommonPlayStep,
  pagePlaySteps,
  queryPlayMethods,
  removePlayStep,
} from '@/api/play/playCase';
import MyDrawer from '@/components/MyDrawer';
import MyProTable from '@/components/Table/MyProTable';
import PlayCaseStepAss from '@/pages/Play/componets/PlayCaseStepAss';
import StepFunc from '@/pages/Play/componets/StepFunc';
import { IUICaseSteps } from '@/pages/Play/componets/uiTypes';
import PlayStepInfo from '@/pages/Play/PlayStep/PlayStepInfo';
import { ModuleEnum } from '@/utils/config';
import { pageData } from '@/utils/somefunc';
import { useModel } from '@@/exports';
import {
  ApiFilled,
  ConsoleSqlOutlined,
  PlusOutlined,
  QuestionOutlined,
} from '@ant-design/icons';
import { ActionType } from '@ant-design/pro-components';
import { ProColumns } from '@ant-design/pro-table/lib/typing';
import { Button, message, Popconfirm, Space, Tag, Tooltip } from 'antd';
import { FC, useEffect, useRef, useState } from 'react';

interface SelfProps {
  currentProjectId?: number;
  currentModuleId?: number;
  perKey: string;
}

const Index: FC<SelfProps> = ({
  currentModuleId,
  currentProjectId,
  perKey,
}) => {
  const { initialState } = useModel('@@initialState');
  const actionRef = useRef<ActionType>(); //Table action 的引用，便于自定义触发
  const [methodEnum, setMethodEnum] = useState<IObjGet>();
  const [addStepOpen, setAddStepOpen] = useState(false);
  const [stepDetailOpen, setStepDetailOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<IUICaseSteps>();
  const [dataOpen, setDataOpen] = useState<boolean>(false);

  useEffect(() => {
    actionRef.current?.reload();
  }, [currentModuleId, currentProjectId]);

  useEffect(() => {
    queryPlayMethods().then(async ({ code, data }) => {
      if (code === 0 && data) {
        // @ts-ignore
        data.sort((a: any, b: any) => {
          if (a.label < b.label) return -1;
          if (a.label > b.label) return 1;
        });
        const methodEnum = data.reduce((acc, item) => {
          const { value, label, description } = item;
          const text = (
            <Tooltip title={description}>
              <span>{label}</span>
            </Tooltip>
          );
          return { ...acc, [value]: { text } };
        }, {});
        setMethodEnum(methodEnum);
      }
    });
  }, []);

  const fetchCommonStepPage = async (values: any) => {
    const { code, data } = await pagePlaySteps({
      ...values,
      module_id: currentModuleId,
      module_type: ModuleEnum.UI_STEP,
      is_common_step: true,
    });
    return pageData(code, data);
  };

  const reload = async () => {
    await actionRef.current?.reload();
  };

  const remove_step = async (record: IUICaseSteps) => {
    const { code, msg } = await removePlayStep({
      stepId: record.id,
    });
    if (code === 0) {
      message.success(msg);
      await reload();
    }
  };

  const copy_step = async (record: IUICaseSteps) => {
    const { code, msg } = await copyCommonPlayStep({
      stepId: record.id,
    });
    if (code === 0) {
      message.success(msg);
      await reload();
    }
  };

  const columns: ProColumns<IUICaseSteps>[] = [
    {
      title: 'ID',
      dataIndex: 'uid',
      width: '10%',
      copyable: true,
      editable: false,
      fixed: 'left',
      render: (_, record) => <Tag color={'blue'}>{record.uid}</Tag>,
    },
    {
      title: '名称',
      valueType: 'text',
      dataIndex: 'name',
      render: (_, record) => <Tag color={'blue'}>{record.name}</Tag>,
    },
    {
      title: '描述',
      dataIndex: 'description',
      valueType: 'textarea',
      search: false,
      ellipsis: true,
    },
    {
      title: '方法',
      dataIndex: 'method',
      valueEnum: { ...methodEnum },
      valueType: 'select',
      render: (text) => <Tag color={'blue'}>{text}</Tag>,
    },
    {
      title: '创建人',
      dataIndex: 'creatorName',
      valueType: 'text',
      editable: false,
      render: (text) => <Tag color={'blue'}>{text}</Tag>,
    },
    {
      title: '其他',
      valueType: 'text',
      search: false,
      width: '20%',
      render: (_, record) => {
        return (
          <Space>
            {record.condition && (
              <Tag color={'green'} icon={<QuestionOutlined />}>
                IF
              </Tag>
            )}
            {record.interface_id && (
              <Tag color={'green'}>
                <Space>
                  <ApiFilled />
                  {record.interface_a_or_b === 1 ? '前' : '后'}
                </Space>
              </Tag>
            )}
            {record.db_id && (
              <Tag color={'green'}>
                <Space>
                  <ConsoleSqlOutlined />
                  {record.db_a_or_b === 1 ? '前' : '后'}
                </Space>
              </Tag>
            )}
          </Space>
        );
      },
    },

    {
      title: 'opt',
      valueType: 'option',
      fixed: 'right',
      render: (_, record, __, ___) => (
        <Space size={'small'}>
          <a
            key={'detail'}
            onClick={() => {
              setCurrentStep(record);
              setStepDetailOpen(true);
            }}
          >
            详情
          </a>
          <a key={'copy'} onClick={async () => await copy_step(record)}>
            复制
          </a>
          <Popconfirm
            title={'确认删除？'}
            description={'删除后会影响被关联的用例！'}
            okText={'确认'}
            cancelText={'点错了'}
            onConfirm={async () => await remove_step(record)}
          >
            <a>删除</a>
          </Popconfirm>
          <a
            onClick={() => {
              setCurrentStep(record);
              setDataOpen(true);
            }}
          >
            关联
          </a>
        </Space>
      ),
    },
  ];

  const addStepButton = (
    <Button
      type={'primary'}
      hidden={!currentModuleId}
      onClick={async () => {
        setAddStepOpen(true);
      }}
    >
      <PlusOutlined />
      添加共有步骤
    </Button>
  );
  const closeDrawer = async () => {
    setAddStepOpen(false);
    setStepDetailOpen(false);
    await reload();
  };
  const expandedRowRender = (record: IUICaseSteps) => {
    return (
      <StepFunc
        currentProjectId={currentProjectId!}
        subStepInfo={record!}
        callback={reload}
      />
    );
  };

  return (
    <>
      <MyDrawer
        name={'步骤详情'}
        width={'auto'}
        open={stepDetailOpen}
        setOpen={setStepDetailOpen}
      >
        {/*// 管理 创建人可编辑*/}
        <PlayStepInfo
          stepInfo={currentStep}
          is_common_step={true}
          callback={closeDrawer}
          readonly={
            !initialState?.currentUser?.isAdmin ||
            initialState.currentUser?.id !== currentStep?.creator
          }
        />
      </MyDrawer>
      <MyDrawer name={'关联用例'} open={dataOpen} setOpen={setDataOpen}>
        <PlayCaseStepAss stepId={currentStep?.id} />
      </MyDrawer>
      <MyDrawer
        name={'添加公共步骤'}
        width={'auto'}
        open={addStepOpen}
        setOpen={setAddStepOpen}
      >
        <PlayStepInfo
          currentProjectId={currentProjectId}
          readonly={false}
          callback={closeDrawer}
          is_common_step={true}
          currentModuleId={currentModuleId}
        />
      </MyDrawer>
      <MyProTable
        persistenceKey={perKey}
        headerTitle={'公共步骤列表'}
        actionRef={actionRef}
        rowKey={'id'}
        expandable={{
          expandedRowRender,
        }}
        x={1000}
        columns={columns}
        toolBarRender={() => [addStepButton]}
        request={fetchCommonStepPage}
      />
    </>
  );
};
export default Index;

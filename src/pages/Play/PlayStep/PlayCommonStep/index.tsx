import { IObjGet } from '@/api';
import {
  copyCommonPlayStep,
  pagePlaySteps,
  queryPlayMethods,
  removePlayStep,
} from '@/api/play/playCase';
import MyDrawer from '@/components/MyDrawer';
import MyProTable from '@/components/Table/MyProTable';
import UserSelect from '@/components/Table/UserSelect';
import PlayCaseStepAss from '@/pages/Play/componets/PlayCaseStepAss';
import { IPlayStepDetail } from '@/pages/Play/componets/uiTypes';
import PlayStepDetail from '@/pages/Play/PlayStep/PlayStepDetail';
import { ModuleEnum } from '@/utils/config';
import { pageData } from '@/utils/somefunc';
import { PlusOutlined } from '@ant-design/icons';
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
  const actionRef = useRef<ActionType>(); //Table action 的引用，便于自定义触发
  const [methodEnum, setMethodEnum] = useState<IObjGet>();
  const [addStepOpen, setStepOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<IPlayStepDetail>();
  const [dataOpen, setDataOpen] = useState<boolean>(false);
  const [drawerTitle, setDrawerTitle] = useState('');

  const reload = async () => {
    setStepOpen(false);
    setCurrentStep(undefined);
    await actionRef.current?.reload();
  };

  useEffect(() => {
    reload().then();
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
      is_common: true,
    });
    return pageData(code, data);
  };

  const remove_step = async (record: IPlayStepDetail) => {
    const { code, msg } = await removePlayStep({
      step_id: record.id,
    });
    if (code === 0) {
      message.success(msg);
      await reload();
    }
  };

  const copy_step = async (record: IPlayStepDetail) => {
    const { code, msg } = await copyCommonPlayStep({
      step_id: record.id,
    });
    if (code === 0) {
      message.success(msg);
      await reload();
    }
  };

  const columns: ProColumns<IPlayStepDetail>[] = [
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
      dataIndex: 'creator',
      valueType: 'text',
      editable: false,
      renderFormItem: () => {
        return <UserSelect />;
      },
      render: (_, record) => {
        return <Tag color={'orange'}>{record.creatorName}</Tag>;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'create_time',
      valueType: 'dateTime',
      search: false,
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
              setDrawerTitle('步骤详情');
              setStepOpen(true);
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
        setCurrentStep(undefined);
        setDrawerTitle('添加共有步骤');
        setStepOpen(true);
      }}
    >
      <PlusOutlined />
      添加共有步骤
    </Button>
  );

  return (
    <>
      <MyDrawer name={'关联用例'} open={dataOpen} setOpen={setDataOpen}>
        <PlayCaseStepAss stepId={currentStep?.id} />
      </MyDrawer>
      <MyDrawer
        name={drawerTitle}
        width={'auto'}
        open={addStepOpen}
        setOpen={setStepOpen}
      >
        <PlayStepDetail
          step_detail={currentStep}
          currentProjectId={currentProjectId}
          currentModuleId={currentModuleId}
          callback={reload}
        />
      </MyDrawer>
      <MyProTable
        persistenceKey={perKey}
        headerTitle={'公共步骤列表'}
        actionRef={actionRef}
        rowKey={'id'}
        columns={columns}
        toolBarRender={() => [addStepButton]}
        request={fetchCommonStepPage}
      />
    </>
  );
};
export default Index;

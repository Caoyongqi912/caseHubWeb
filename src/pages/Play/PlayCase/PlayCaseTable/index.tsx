import {
  addPlayCaseBasicInfo,
  copyPlayCase,
  editPlayCaseBaseInfo,
  pagePlayCase,
  removePlayCase,
} from '@/api/play/playCase';
import MyModal from '@/components/MyModal';
import MyProTable from '@/components/Table/MyProTable';
import { IUICase } from '@/pages/Play/componets/uiTypes';
import PlayBaseForm from '@/pages/Play/PlayCase/PlayCaseDetail/PlayBaseForm';
import { CONFIG, ModuleEnum } from '@/utils/config';
import { pageData } from '@/utils/somefunc';
import { history, useModel } from '@@/exports';
import { ActionType, ProColumns } from '@ant-design/pro-components';
import { Button, Form, message, Popconfirm, Tag } from 'antd';
import { FC, useCallback, useEffect, useRef, useState } from 'react';

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
  const [caseForm] = Form.useForm<IUICase>();
  const { initialState } = useModel('@@initialState');
  const actionRef = useRef<ActionType>(); //Table action 的引用，便于自定义触发
  const [currentPlay, setCurrentPlay] = useState<IUICase>();
  const [modalName, setModalName] = useState('新增用例');
  useEffect(() => {
    actionRef.current?.reload();
  }, [currentModuleId, currentProjectId]);
  useEffect(() => {
    if (currentProjectId && currentModuleId) {
      caseForm.setFieldsValue({
        project_id: currentProjectId,
        module_id: currentModuleId,
      });
    }
  }, [currentModuleId, currentProjectId]);

  const fetchUICase = useCallback(
    async (params: any, sort: any) => {
      if (currentModuleId) {
        const { code, data } = await pagePlayCase({
          module_id: currentModuleId,
          module_type: ModuleEnum.UI_CASE,
          ...params,
          sort: sort,
        });
        return pageData(code, data);
      }
    },
    [currentModuleId, currentProjectId],
  );

  const saveOrUpdateCaseBase = async (values: IUICase) => {
    if (currentPlay) {
      editPlayCaseBaseInfo({
        ...values,
        id: currentPlay.id,
      }).then(async ({ code, msg }) => {
        if (code === 0) {
          message.success(msg);
          actionRef.current?.reload();
        }
      });
    } else {
      addPlayCaseBasicInfo(values).then(async ({ code, data, msg }) => {
        if (code === 0) {
          message.success(msg);
          actionRef.current?.reload();
        }
      });
    }
    return true;
  };

  const columns: ProColumns<IUICase>[] = [
    {
      title: 'UID',
      dataIndex: 'uid',
      key: 'uid',
      fixed: 'left',
      copyable: true,
      width: '12%',
      render: (text) => {
        return <Tag color={'blue'}>{text}</Tag>;
      },
    },
    {
      title: 'name',
      dataIndex: 'title',
      sorter: true,
      fixed: 'left',
      key: 'title',
      render: (text, record) => {
        return (
          <MyModal
            onFinish={saveOrUpdateCaseBase}
            trigger={
              <a
                onClick={() => {
                  caseForm.setFieldsValue(record);
                  setCurrentPlay(record);
                }}
              >
                {text}
              </a>
            }
            form={caseForm}
          >
            <PlayBaseForm />
          </MyModal>
        );
      },
    },
    {
      title: 'level',
      key: 'level',
      dataIndex: 'level',
      valueType: 'select',
      valueEnum: CONFIG.API_LEVEL_ENUM,
      render: (_, record) => {
        return (
          <Tag color={CONFIG.RENDER_CASE_LEVEL[record.level].color}>
            {CONFIG.RENDER_CASE_LEVEL[record.level].text}
          </Tag>
        );
      },
    },
    {
      title: 'step num',
      dataIndex: 'step_num',
      hideInSearch: true,
      key: 'step_num',
      render: (text) => {
        return <Tag color={'blue'}>{text}</Tag>;
      },
    },
    {
      title: 'status',
      dataIndex: 'status',
      valueType: 'select',
      key: 'status',
      valueEnum: CONFIG.CASE_STATUS_ENUM,
      render: (_, record) => {
        return (
          <Tag color={CONFIG.RENDER_CASE_STATUS[record.status].color}>
            {CONFIG.RENDER_CASE_STATUS[record.status].text}
          </Tag>
        );
      },
    },
    {
      title: 'creator',
      dataIndex: 'creatorName',
      key: 'creatorName',
      render: (text) => <Tag>{text}</Tag>,
    },
    {
      title: 'create time',
      dataIndex: 'create_time',
      valueType: 'date',
      key: 'create_time',
      sorter: true,
      search: false,
    },
    {
      title: 'opt',
      valueType: 'option',
      key: 'option',
      fixed: 'right',
      width: '12%',
      render: (_, record) => [
        <a
          target="_blank"
          rel="noopener noreferrer"
          key="view"
          onClick={() => {
            history.push(`/ui/case/detail/caseId=${record.id}`);
          }}
        >
          详情
        </a>,
        <a
          key="copy"
          onClick={async () => {
            const { code, data, msg } = await copyPlayCase({
              caseId: record.id,
            });
            if (code === 0) {
              window.open(`/ui/case/detail/caseId=${data.id}`);
              message.success(msg);
            }
          }}
        >
          复制
        </a>,
        <>
          {initialState?.currentUser?.id === record.creator ||
          initialState?.currentUser?.isAdmin ? (
            <Popconfirm
              key="delete_firm"
              title={'确认删除？'}
              okText={'确认'}
              cancelText={'点错了'}
              onConfirm={async () => {
                const { code, msg } = await removePlayCase({
                  caseId: record.id,
                });
                if (code === 0) {
                  message.success(msg);
                  actionRef.current?.reload();
                }
              }}
            >
              <a key="delete">删除</a>
            </Popconfirm>
          ) : null}
        </>,
      ],
    },
  ];

  const AddCaseButton = (
    <>
      <MyModal
        title={modalName}
        form={caseForm}
        onFinish={saveOrUpdateCaseBase}
        trigger={
          <Button
            hidden={currentModuleId === undefined}
            type={'primary'}
            onClick={() => {
              setCurrentPlay(undefined);
            }}
          >
            添加用例
          </Button>
        }
      >
        <PlayBaseForm />
      </MyModal>
    </>
  );
  return (
    <MyProTable
      headerTitle={'用例列表'}
      persistenceKey={perKey}
      columns={columns}
      rowKey={'id'}
      x={1000}
      request={fetchUICase}
      actionRef={actionRef}
      toolBarRender={() => [AddCaseButton]}
    />
  );
};

export default Index;

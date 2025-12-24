import { pagePlayGroupSteps } from '@/api/play/playCase';
import MyProTable from '@/components/Table/MyProTable';
import { IUIGroupStep } from '@/pages/Play/componets/uiTypes';
import PlayStepGroupModalForm from '@/pages/Play/PlayStep/PlayStepGroup/PlayStepGroupModalForm';
import { ModuleEnum } from '@/utils/config';
import { pageData } from '@/utils/somefunc';
import { PlusOutlined } from '@ant-design/icons';
import { ActionType } from '@ant-design/pro-components';
import { ProColumns } from '@ant-design/pro-table/lib/typing';
import { Button, Divider, Popconfirm, Tag } from 'antd';
import { FC, useEffect, useRef, useState } from 'react';

interface SelfProps {
  currentProjectId?: number;
  currentModuleId?: number;
  perKey: string;
}

const PlayStepGroupTable: FC<SelfProps> = (props) => {
  const { currentProjectId, currentModuleId, perKey } = props;
  const actionRef = useRef<ActionType>(); //Table action 的引用，便于自定义触发
  const [currentGroup, setCurrentGroup] = useState<IUIGroupStep>();
  const reload = () => {
    actionRef.current?.reload();
  };

  useEffect(() => {
    reload();
  }, [currentModuleId, currentProjectId]);

  const fetchStepGroupPage = async (values: any) => {
    const { code, data } = await pagePlayGroupSteps({
      ...values,
      module_id: currentModuleId,
      module_type: ModuleEnum.UI_STEP,
      is_group: true,
    });
    return pageData(code, data);
  };

  const columns: ProColumns<IUIGroupStep>[] = [
    {
      title: 'uid',
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
      copyable: true,
      render: (_, record) => {
        return (
          <PlayStepGroupModalForm
            trigger={
              <a
                onClick={() => {
                  setCurrentGroup(record);
                }}
              >
                {record.name}
              </a>
            }
            currentProjectId={record.project_id}
            currentModuleId={record.module_id}
            callBack={reload}
            current={record}
          />
        );
      },
    },
    {
      title: '描述',
      valueType: 'text',
      dataIndex: 'description',
      ellipsis: true,
      search: false,
    },
    {
      title: '步长',
      valueType: 'text',
      dataIndex: 'step_num',
      search: false,
    },
    {
      title: '创建人',
      dataIndex: 'creatorName',
      valueType: 'text',
      editable: false,
      width: '7%',
      fixed: 'right',
      render: (text) => <Tag color={'blue'}>{text}</Tag>,
    },
    {
      title: 'opt',
      valueType: 'option',
      fixed: 'right',
      render: (_, record, __, action) => [
        <a
          key={'detail'}
          onClick={() => {
            window.open(`/ui/group/detail/groupId=${record.id}`);
          }}
        >
          详情
        </a>,
        <Divider type="vertical" />,
        <a key={'copy'} onClick={() => {}}>
          复制
        </a>,
        <Divider type="vertical" />,
        <Popconfirm
          title={'确认删除？'}
          description={'删除后会影响被关联的用例！'}
          okText={'确认'}
          cancelText={'点错了'}
          onConfirm={() => {}}
        >
          <a>删除</a>
        </Popconfirm>,
        <Divider type="vertical" />,
        <a onClick={() => {}}>关联</a>,
      ],
    },
  ];

  return (
    <MyProTable
      headerTitle={'步骤组'}
      actionRef={actionRef}
      persistenceKey={perKey}
      rowKey={'id'}
      x={1000}
      columns={columns}
      toolBarRender={() => [
        <PlayStepGroupModalForm
          trigger={
            <Button
              type="primary"
              hidden={currentModuleId === undefined}
              onClick={() => {
                setCurrentGroup(undefined);
              }}
            >
              <PlusOutlined />
              添加步骤组
            </Button>
          }
          currentProjectId={currentProjectId}
          currentModuleId={currentModuleId}
          callBack={reload}
        />,
      ]}
      request={fetchStepGroupPage}
    />
  );
};

export default PlayStepGroupTable;

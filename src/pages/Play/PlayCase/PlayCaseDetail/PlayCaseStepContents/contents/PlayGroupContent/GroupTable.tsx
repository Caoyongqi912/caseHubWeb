import { IObjGet } from '@/api';
import { queryPlayGroupSteps, queryPlayMethods } from '@/api/play/playCase';
import MyDrawer from '@/components/MyDrawer';
import MyProTable from '@/components/Table/MyProTable';
import UserSelect from '@/components/Table/UserSelect';
import { IPlayStepDetail } from '@/pages/Play/componets/uiTypes';
import PlayStepDetail from '@/pages/Play/PlayStep/PlayStepDetail';
import { queryData } from '@/utils/somefunc';
import { ActionType, ProCard } from '@ant-design/pro-components';
import { ProColumns } from '@ant-design/pro-table/lib/typing';
import { Tag, Tooltip } from 'antd';
import { FC, useCallback, useEffect, useRef, useState } from 'react';

interface SelfProps {
  groupId: number;
  callback: () => void;
}

const GroupTable: FC<SelfProps> = ({ groupId, callback }) => {
  const actionRef = useRef<ActionType>(); //Table action 的引用，便于自定义触发
  const [methodEnum, setMethodEnum] = useState<IObjGet>();
  const [dataOpen, setDataOpen] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<IPlayStepDetail>();

  const selfCallback = () => {
    actionRef.current?.reload();
    callback();
  };

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
  const columns: ProColumns<IPlayStepDetail>[] = [
    {
      title: '名称',
      valueType: 'text',
      dataIndex: 'name',
      render: (_, record) => (
        <a
          onClick={() => {
            setCurrentStep(record);
            setDataOpen(true);
          }}
        >
          {record.name}
        </a>
      ),
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
  ];

  const fetchData = useCallback(async () => {
    const { code, data } = await queryPlayGroupSteps({ group_id: groupId });
    return queryData(code, data);
  }, [groupId]);
  return (
    <ProCard>
      <MyDrawer width={'auto'} open={dataOpen} setOpen={setDataOpen}>
        <PlayStepDetail step_detail={currentStep} callback={selfCallback} />
      </MyDrawer>
      <MyProTable
        search={false}
        actionRef={actionRef}
        rowKey={'id'}
        columns={columns}
        request={fetchData}
      />
    </ProCard>
  );
};

export default GroupTable;

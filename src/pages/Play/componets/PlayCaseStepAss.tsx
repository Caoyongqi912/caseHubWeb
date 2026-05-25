import { getCasesByStepId } from '@/api/play/playCase';
import MyProTable from '@/components/Table/MyProTable';
import { IUICase } from '@/pages/Play/componets/uiTypes';
import { CONFIG } from '@/utils/config';
import { queryData } from '@/utils/somefunc';
import { ActionType, ProColumns } from '@ant-design/pro-components';
import { Tag } from 'antd';
import { FC, useCallback, useRef, useState } from 'react';

interface SelfProps {
  stepId?: number;
}

const PlayCaseStepAss: FC<SelfProps> = ({ stepId }) => {
  const actionRef = useRef<ActionType>(); //Table action 的引用，便于自定义触发

  const [datasource, setDatasource] = useState<IUICase[]>([]);
  const fetchData = useCallback(async () => {
    if (stepId) {
      getCasesByStepId(stepId).then(async ({ code, data }) => {
        return queryData(code, data, setDatasource);
      });
    }
  }, [stepId]);
  const openCaseUrl = (caseId: number) => {
    window.open(`/ui/case/detail/caseId=${caseId}`);
  };
  const columns: ProColumns<IUICase>[] = [
    {
      title: 'UID',
      dataIndex: 'uid',
      key: 'uid',
      fixed: 'left',
      copyable: true,
      width: '12%',
      render: (text, record) => {
        return (
          <Tag color={'blue'} onClick={() => openCaseUrl(record.id)}>
            {text}
          </Tag>
        );
      },
    },
    {
      title: 'name',
      dataIndex: 'title',
      sorter: true,
      fixed: 'left',
      key: 'title',
      render: (text, record) => {
        return <a onClick={() => openCaseUrl(record.id)}>{text}</a>;
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
      title: 'order',
      dataIndex: 'step_order',
      search: true,
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
  ];

  return (
    <MyProTable
      actionRef={actionRef}
      columns={columns}
      rowKey={'id'}
      dataSource={datasource}
      request={fetchData}
    />
  );
};

export default PlayCaseStepAss;

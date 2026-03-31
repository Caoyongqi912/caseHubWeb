import { ICaseStepInfo } from '@/api';
import EditableTable from '@/components/Table/EditableTable';
import { ProColumns } from '@ant-design/pro-components';
import React, { FC } from 'react';
type DataSourceType = {
  id: React.Key;
  step: number;
  todo: string;
  exp: string;
};

interface selfProps {
  caseStepInfo: ICaseStepInfo[];
  setStepCaseInfo: any;
  editableKeys: any;
  setEditableRowKeys: any;
}

const CaseInfoStepTable: FC<selfProps> = ({
  caseStepInfo,
  setStepCaseInfo,
  editableKeys,
  setEditableRowKeys,
}) => {
  const caseInfoColumn: ProColumns<DataSourceType>[] = [
    {
      title: '步骤',
      dataIndex: 'step',
      width: '8%',
      valueType: 'index',
    },
    {
      title: '操作步骤',
      dataIndex: 'todo',
      valueType: 'textarea',
      ellipsis: true,
      fieldProps: {
        rows: 2,
      },
    },
    {
      title: '预期结果',
      dataIndex: 'exp',
      valueType: 'textarea',
      ellipsis: true,
      fieldProps: {
        rows: 2,
      },
    },
    {
      title: '操作',
      valueType: 'option',
      fixed: 'right',
      width: 70,
      render: (_, record: DataSourceType) => [
        <a
          key="delete"
          type="primary"
          onClick={() => {
            const data = caseStepInfo.filter(
              (item: any) => item.id !== record.id,
            );
            setStepCaseInfo(data);
          }}
        >
          删除
        </a>,
      ],
    },
  ];

  return (
    <EditableTable
      border
      title={'执行步骤'}
      columns={caseInfoColumn}
      dataSource={caseStepInfo}
      setDataSource={setStepCaseInfo}
      editableKeys={editableKeys}
      setEditableRowKeys={setEditableRowKeys}
    />
  );
};

export default CaseInfoStepTable;

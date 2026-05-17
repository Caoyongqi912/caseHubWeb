import { IModuleEnum, IObjGet } from '@/api';
import { pageTestCase } from '@/api/case/testCase';
import MyProTable from '@/components/Table/MyProTable';
import UserSelect from '@/components/Table/UserSelect';
import { ModuleEnum } from '@/utils/config';
import { fetchModulesEnum, pageData } from '@/utils/somefunc';
import { ActionType, ProColumns } from '@ant-design/pro-components';
import { TableRowSelection } from 'antd/es/table/interface';
import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { CaseHubConfig } from '../../config/constants';
import { ITestCase } from '../../types';

import { queryProjectEnum } from '@/components/CommonFunc';
import { borderRadius } from '@/components/LeftComponents/styles';
import { caseLevelColors } from '@/pages/CaseHub/styles';
import { Button, Tag, Typography } from 'antd';

interface Props {
  onCaseSelect: (caseIds: number[]) => Promise<void>;
  projectId?: number;
  hideAddButton?: boolean;
}

const { Text } = Typography;
const ChoiceCaseTable: FC<Props> = ({
  onCaseSelect,
  projectId,
  hideAddButton = true,
}) => {
  const { CASE_LEVEL_ENUM } = CaseHubConfig;
  const actionRef = useRef<ActionType>();

  const [projectEnumMap, setProjectEnumMap] = useState<IObjGet>({});
  const [moduleEnum, setModuleEnum] = useState<IModuleEnum[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  useEffect(() => {
    if (!projectId) return;
    queryProjectEnum(setProjectEnumMap).then(async () => {
      await fetchModulesEnum(projectId, ModuleEnum.CASE, setModuleEnum).then();
    });
  }, [projectId]);

  const rowSelection: TableRowSelection<ITestCase> = {
    selectedRowKeys,
    type: 'checkbox',
    preserveSelectedRowKeys: true,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
      // onCaseSelect(newSelectedRowKeys as number[]);
    },
  };

  const fetchPageData = useCallback(
    async (params: ITestCase, sort: any) => {
      const values = {
        ...params,
        is_common: true,
        project_id: projectId,
        module_type: ModuleEnum.CASE,
        sort: sort,
      };
      const { code, data } = await pageTestCase(values);
      return pageData(code, data);
    },
    [projectId],
  );

  const column: ProColumns<ITestCase>[] = [
    {
      title: '项目',
      dataIndex: 'project_id',
      hideInTable: true,
      valueType: 'select',
      valueEnum: projectEnumMap,
    },
    {
      title: '所属模块',
      dataIndex: 'module_id',
      hideInTable: true,
      valueType: 'treeSelect',
      fieldProps: {
        treeData: moduleEnum,
        fieldNames: {
          label: 'title',
        },
      },
    },
    {
      title: '用例名称',
      dataIndex: 'case_name',
      copyable: true,
      ellipsis: true,
      search: true,
      width: 250,
      render: (text) => (
        <Text strong ellipsis={{ tooltip: text }}>
          {text}
        </Text>
      ),
    },
    {
      title: '标签',
      dataIndex: 'case_tag',
      width: 100,

      render: (text) => (
        <Text strong ellipsis={{ tooltip: text }}>
          {text}
        </Text>
      ),
    },
    {
      title: '等级',
      dataIndex: 'case_level',
      sorter: true,
      valueEnum: CASE_LEVEL_ENUM,
      width: 80,
      render: (_, record) => {
        const levelColor =
          caseLevelColors[record.case_level] || caseLevelColors.P2;
        return (
          <Tag
            style={{
              background: levelColor.bg,
              borderColor: levelColor.border,
              color: levelColor.text,
              borderRadius: borderRadius.md,
              fontWeight: 500,
              margin: 0,
            }}
          >
            {record.case_level}
          </Tag>
        );
      },
    },
    {
      title: '创建人',
      dataIndex: 'creatorName',
      width: 100,
      renderFormItem: () => {
        return <UserSelect />;
      },
      render: (text) => <Text type="secondary">{text}</Text>,
    },
    {
      title: '创建时间',
      dataIndex: 'create_time',
      valueType: 'dateTime',
      hideInSearch: true,
      width: 180,
    },
  ];
  return (
    <>
      <MyProTable
        tableAlertOptionRender={() => {
          return (
            <>
              <Button
                hidden={hideAddButton}
                style={{ marginLeft: 5 }}
                onClick={() => onCaseSelect(selectedRowKeys as number[])}
              >
                引用添加
              </Button>
            </>
          );
        }}
        rowSelection={rowSelection}
        actionRef={actionRef}
        request={fetchPageData}
        columns={column}
        rowKey={'id'}
      />
    </>
  );
};
export default ChoiceCaseTable;

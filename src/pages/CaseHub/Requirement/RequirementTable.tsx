import { pageRequirement, updateRequirement } from '@/api/case/requirement';
import { downloadCaseExcel } from '@/api/case/testCase';
import MyDrawer from '@/components/MyDrawer';
import MyProTable from '@/components/Table/MyProTable';
import {
  RequirementProcessEnum,
  RequirementProcessOption,
} from '@/pages/CaseHub/CaseConfig';
import Requirement from '@/pages/CaseHub/Requirement/index';
import RequirementDetail from '@/pages/CaseHub/Requirement/RequirementDetail';
import { IRequirement } from '@/pages/CaseHub/type';
import { CONFIG, ModuleEnum } from '@/utils/config';
import { pageData } from '@/utils/somefunc';
import { DownloadOutlined, EditOutlined } from '@ant-design/icons';
import { ActionType, ProCard } from '@ant-design/pro-components';
import { ProColumns } from '@ant-design/pro-table/lib/typing';
import { Button, Popconfirm, Select, Space, Tag } from 'antd';
import { FC, useCallback, useEffect, useRef, useState } from 'react';

interface SelfProps {
  currentProjectId?: number;
  currentModuleId?: number;
  perKey: string;
}

const RequirementTable: FC<SelfProps> = ({
  currentProjectId,
  perKey,
  currentModuleId,
}) => {
  const actionRef = useRef<ActionType>();
  const [detailVisible, setDetailVisible] = useState<boolean>(false);
  const [currentReqId, setCurrentReqId] = useState<number>();

  const columns: ProColumns<IRequirement>[] = [
    {
      title: 'ID',
      key: 'uid',
      dataIndex: 'uid',
      fixed: 'left',
      copyable: true,
      width: '12%',
      editable: false,
      render: (text) => {
        return <Tag color={'blue'}>{text}</Tag>;
      },
    },
    {
      title: '需求名',
      key: 'requirement_name',
      dataIndex: 'requirement_name',
      copyable: true,
      editable: false,
    },
    {
      title: '需求等级',
      key: 'requirement_level',
      dataIndex: 'requirement_level',
      editable: false,
      valueEnum: CONFIG.CASE_LEVEL_ENUM,
      render: (_, record) => {
        return (
          <Tag color={CONFIG.RENDER_CASE_LEVEL[record.requirement_level].color}>
            {CONFIG.RENDER_CASE_LEVEL[record.requirement_level].text}
          </Tag>
        );
      },
    },
    {
      title: '进度',
      key: 'process',
      dataIndex: 'process',
      valueType: 'select',
      width: '12%',
      valueEnum: RequirementProcessEnum,
      render: (_, record) => {
        return (
          <Space size={'small'}>
            <Tag>{RequirementProcessEnum[record.process].text}</Tag>{' '}
            <EditOutlined
              onClick={() => {
                actionRef?.current?.startEditable(record.id);
              }}
            />
          </Space>
        );
      },
      renderFormItem: (text) => {
        // 这里可以自定义渲染方式
        return <Select options={RequirementProcessOption} value={text} />;
      },
    },
    {
      title: '用例数',
      key: 'case_number',
      dataIndex: 'case_number',
      hideInSearch: true,
      editable: false,
      render: (_, record) => {
        return <Tag>{record.case_number}</Tag>;
      },
    },
    {
      title: '创建人',
      key: 'creatorName',
      dataIndex: 'creatorName',
      hideInSearch: true,
      editable: false,
    },
    {
      valueType: 'option',
      fixed: 'right',
      width: '20%',
      render: (_: any, record: IRequirement) => {
        return (
          <Space>
            <a
              onClick={() => {
                window.open(
                  `/cases/caseHub/requirementCases/reqId=${record.id}&projectId=${currentProjectId}&moduleId=${currentModuleId}`,
                );
              }}
            >
              关联用例
            </a>
            <a
              onClick={() => {
                setCurrentReqId(record.id);
                setDetailVisible(true);
              }}
            >
              详情
            </a>
            <Popconfirm
              title="确定要删除吗？"
              onConfirm={async () => {}}
              okText="是"
              cancelText="否"
            >
              <a style={{ marginLeft: 8 }}>删除</a>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  useEffect(() => {
    actionRef.current?.reload();
  }, [currentModuleId, currentProjectId]);

  const fetchPageData = useCallback(
    async (params: IRequirement, sort: any) => {
      const values = {
        ...params,
        module_id: currentModuleId,
        module_type: ModuleEnum.CASE,
        sort: sort,
      };
      const { code, data } = await pageRequirement(values);
      return pageData(code, data);
    },
    [currentModuleId],
  );

  const download = async () => {
    const blob = await downloadCaseExcel({ responseType: 'blob' });
    const objectURL = URL.createObjectURL(blob);
    let btn: any = document.createElement('a');
    btn.download = `模版.xlsx`; // 确保文件名有.xlsx扩展名
    btn.href = objectURL;
    btn.click();
    // 清理临时资源
    URL.revokeObjectURL(objectURL);
    btn = null;
  };
  const onSave = async (_: any, record: IRequirement) => {
    const values = {
      id: record.id,
      process: record.process,
    };
    const { code } = await updateRequirement(values as IRequirement);
    if (code === 0) {
      actionRef.current?.reload();
    }
  };
  return (
    <ProCard bodyStyle={{ padding: 0 }}>
      <MyDrawer name={''} open={detailVisible} setOpen={setDetailVisible}>
        <RequirementDetail
          requirementId={currentReqId}
          callback={() => {
            setDetailVisible(false);
            actionRef.current?.reload();
          }}
        />
      </MyDrawer>
      <MyProTable
        onSave={onSave}
        persistenceKey={perKey}
        rowKey={'id'}
        actionRef={actionRef}
        columns={columns}
        request={fetchPageData}
        toolBarRender={() => [
          <Button onClick={download} type="link" icon={<DownloadOutlined />}>
            用例模版
          </Button>,
          <Requirement
            callback={() => actionRef.current?.reload()}
            currentModuleId={currentModuleId}
            currentProjectId={currentProjectId}
          />,
        ]}
      />
    </ProCard>
  );
};

export default RequirementTable;

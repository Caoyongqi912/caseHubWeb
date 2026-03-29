import { IModuleEnum } from '@/api';
import {
  downloadCaseExcel,
  pageTestCase,
  uploadTestCase,
} from '@/api/case/testCase';
import MyDrawer from '@/components/MyDrawer';
import MyProTable from '@/components/Table/MyProTable';
import { CaseHubConfig } from '@/pages/CaseHub/CaseConfig';
import { caseLevelColors, useCaseHubTheme } from '@/pages/CaseHub/styles';
import DynamicInfo from '@/pages/CaseHub/TestCase/DynamicInfo';
import TestCaseDetail from '@/pages/CaseHub/TestCase/TestCaseDetail';
import { ITestCase } from '@/pages/CaseHub/type';
import { ModuleEnum } from '@/utils/config';
import { fetchModulesEnum, pageData } from '@/utils/somefunc';
import { DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import {
  ActionType,
  ModalForm,
  ProColumns,
  ProForm,
  ProFormSelect,
  ProFormTreeSelect,
  ProFormUploadDragger,
} from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import {
  Button,
  Form,
  message,
  Popconfirm,
  Space,
  Tag,
  Typography,
} from 'antd';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';

const { Text, Link } = Typography;

interface Props {
  currentProjectId?: number;
  currentModuleId?: number;
  perKey: string;
}

const CaseDataTable: FC<Props> = (props) => {
  const { perKey, currentProjectId, currentModuleId } = props;
  const { CASE_LEVEL_ENUM } = CaseHubConfig;
  const { token, colors, spacing, borderRadius } = useCaseHubTheme();
  const actionRef = useRef<ActionType>();
  const [uploadForm] = Form.useForm();
  const [currentCaseId, setCurrentCaseId] = useState<number>();
  const [currentCase, setCurrentCase] = useState<ITestCase>();
  const [showDynamic, setShowDynamic] = useState<boolean>(false);
  const [showCaseDetail, setShowCaseDetail] = useState<boolean>(false);
  const { initialState } = useModel('@@initialState');
  const projects = initialState?.projects || [];
  const [selectProjectId, setSelectProjectId] = useState<number>();
  const [moduleEnum, setModuleEnum] = useState<IModuleEnum[]>([]);

  useEffect(() => {
    if (selectProjectId) {
      fetchModulesEnum(selectProjectId, ModuleEnum.CASE, setModuleEnum).then();
    }
  }, [selectProjectId]);

  useEffect(() => {
    actionRef.current?.reload();
    if (currentProjectId) {
      setSelectProjectId(currentProjectId);
      uploadForm.setFieldsValue({
        project_id: currentProjectId,
      });
    }
  }, [currentModuleId, currentProjectId]);

  const drawerStyles = useMemo(
    () => ({
      header: {
        background: `linear-gradient(135deg, ${colors.primaryBg} 0%, ${colors.bgContainer} 100%)`,
        borderBottom: `1px solid ${colors.border}`,
      },
      body: {
        padding: spacing.lg,
        background: colors.bgContainer,
      },
    }),
    [colors, spacing],
  );

  const download = async () => {
    const blob = await downloadCaseExcel({ responseType: 'blob' });
    const objectURL = URL.createObjectURL(blob);
    let btn: any = document.createElement('a');
    btn.download = `模版.xlsx`;
    btn.href = objectURL;
    btn.click();
    URL.revokeObjectURL(objectURL);
    btn = null;
  };

  const column: ProColumns<ITestCase>[] = useMemo(
    () => [
      {
        title: 'ID',
        dataIndex: 'uid',
        fixed: 'left',
        copyable: true,
        width: 100,
        render: (_, record) => (
          <Tag
            style={{
              background: colors.primaryBg,
              borderColor: colors.primary,
              color: colors.primary,
              borderRadius: borderRadius.md,
              fontWeight: 500,
            }}
          >
            {record.uid}
          </Tag>
        ),
      },
      {
        title: '用例名称',
        dataIndex: 'case_name',
        copyable: true,
        ellipsis: true,
        width: 250,
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
        render: (text) => <Text type="secondary">{text}</Text>,
      },
      {
        title: '创建时间',
        dataIndex: 'create_time',
        valueType: 'dateTime',
        hideInSearch: true,
        width: 180,
      },
      {
        title: '更新时间',
        dataIndex: 'update_time',
        valueType: 'dateTime',
        hideInSearch: true,
        width: 180,
      },
      {
        valueType: 'option',
        fixed: 'right',
        width: 140,
        render: (_, record: ITestCase) => {
          return (
            <Space size="small">
              <Link
                style={{
                  color: colors.primary,
                  cursor: 'pointer',
                  transition: `color ${token.motionDurationFast}`,
                }}
                onClick={() => {
                  setCurrentCase(record);
                  setShowCaseDetail(true);
                }}
              >
                详情
              </Link>
              <Link
                style={{
                  color: colors.primary,
                  cursor: 'pointer',
                }}
                onClick={() => {
                  setCurrentCaseId(record.id);
                  setShowDynamic(true);
                }}
              >
                动态
              </Link>
              <Popconfirm title={'确认删除'}>
                <Link
                  style={{
                    color: colors.error,
                    cursor: 'pointer',
                  }}
                >
                  删除
                </Link>
              </Popconfirm>
            </Space>
          );
        },
      },
    ],
    [CASE_LEVEL_ENUM, colors, borderRadius, token],
  );

  const fetchPageData = useCallback(
    async (params: ITestCase, sort: any) => {
      const values = {
        ...params,
        is_common: true,
        module_id: currentModuleId,
        module_type: ModuleEnum.CASE,
        sort: sort,
      };
      const { code, data } = await pageTestCase(values);
      return pageData(code, data);
    },
    [currentModuleId],
  );

  /** 上传用例 */
  const uploadCase = async (values: any) => {
    console.log(values);
    const formData = new FormData();
    const fileValue = values.file;
    formData.append('file', fileValue[0].originFileObj);
    formData.append('project_id', values.project_id);
    formData.append('module_id', values.module_id);
    const { code } = await uploadTestCase(formData);
    if (code === 0) {
      message.success('上传成功');
    }
    uploadForm.resetFields();
    return true;
  };

  return (
    <>
      <MyDrawer
        name={'动态'}
        width={'40%'}
        open={showDynamic}
        setOpen={setShowDynamic}
        drawerStyles={drawerStyles}
      >
        <DynamicInfo caseId={currentCaseId} />
      </MyDrawer>
      <MyDrawer
        name={'用例详情'}
        open={showCaseDetail}
        setOpen={setShowCaseDetail}
        drawerStyles={drawerStyles}
      >
        <TestCaseDetail
          testcase={currentCase}
          callback={() => {
            actionRef.current?.reload();
          }}
        />
      </MyDrawer>
      <MyProTable
        toolBarRender={() => [
          <Button
            key="download"
            onClick={download}
            type="text"
            icon={<DownloadOutlined style={{ color: colors.primary }} />}
          >
            用例模版
          </Button>,

          <ModalForm
            form={uploadForm}
            trigger={
              <Button key="upload" type="primary">
                <UploadOutlined />
                上传
              </Button>
            }
            title={'上传用例'}
            onFinish={uploadCase}
          >
            <ProForm.Group>
              <ProFormSelect
                label={'所属项目'}
                options={projects}
                name={'project_id'}
                width={'md'}
                required={true}
                rules={[{ required: true, message: '请选择项目' }]}
                fieldProps={{
                  variant: 'filled',
                  onChange: (value) => {
                    setSelectProjectId(value as number);
                  },
                }}
              />
              <ProFormTreeSelect
                required
                name="module_id"
                label="所属模块"
                width={'md'}
                rules={[{ required: true, message: '所属模块必选' }]}
                fieldProps={{
                  variant: 'filled',
                  treeData: moduleEnum,
                  fieldNames: {
                    label: 'title',
                    value: 'value',
                  },
                  filterTreeNode: true,
                }}
              />
            </ProForm.Group>
            <ProFormUploadDragger
              title={false}
              max={1}
              description="上传文件"
              width={'md'}
              accept=".xlsx,.xls"
              name="file"
            />
          </ModalForm>,
        ]}
        actionRef={actionRef}
        persistenceKey={perKey}
        request={fetchPageData}
        columns={column}
        rowKey={'uid'}
      />
    </>
  );
};

export default CaseDataTable;

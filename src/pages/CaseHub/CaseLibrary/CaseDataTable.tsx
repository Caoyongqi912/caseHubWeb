import { IModuleEnum } from '@/api';
import {
  copyTestCase,
  downloadCaseExcel,
  pageTestCase,
  removeTestCase,
  updateTestCase,
  uploadTestCase,
} from '@/api/case/testCase';
import MyDrawer from '@/components/MyDrawer';
import MyProTable from '@/components/Table/MyProTable';
import UserSelect from '@/components/Table/UserSelect';
import TestCaseDetail from '@/pages/CaseHub/CaseLibrary/TestCaseDetail';
import DynamicInfo from '@/pages/CaseHub/components/DynamicInfo';
import { CaseHubConfig } from '@/pages/CaseHub/config/constants';
import { useCaseHubTheme } from '@/pages/CaseHub/styles';
import { ITestCase } from '@/pages/CaseHub/types';
import { ModuleEnum } from '@/utils/config';
import { fetchModulesEnum, pageData } from '@/utils/somefunc';
import {
  CopyOutlined,
  DeleteOutlined,
  DeliveredProcedureOutlined,
  DownloadOutlined,
  SmallDashOutlined,
  SoundOutlined,
  UploadOutlined,
} from '@ant-design/icons';
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
import type { MenuProps } from 'antd';
import {
  Button,
  Dropdown,
  Form,
  message,
  Modal,
  Popconfirm,
  Space,
  Tag,
  Typography,
} from 'antd';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import CaseForm from './components/CaseForm';

const { Text, Link } = Typography;

interface Props {
  currentProjectId?: number;
  currentModuleId?: number;
  perKey: string;
}

const CaseDataTable: FC<Props> = (props) => {
  const { perKey, currentProjectId, currentModuleId } = props;
  const [moveForm] = Form.useForm();
  const { CASE_LEVEL_ENUM, CASE_TYPE_ENUM } = CaseHubConfig;
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
  const [openNewCaseDrawer, setOpenNewCaseDrawer] = useState<boolean>(false);
  useEffect(() => {
    if (selectProjectId) {
      fetchModulesEnum(selectProjectId, ModuleEnum.CASE, setModuleEnum).then();
    }
  }, [selectProjectId]);
  const [openModal, setOpenModal] = useState(false);

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
    try {
      const response = await downloadCaseExcel({ responseType: 'blob' });
      const blob = response as unknown as Blob;
      const objectURL = URL.createObjectURL(blob);
      const filename = '用例模板.xlsx';
      const link = document.createElement('a');
      link.href = objectURL;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectURL);
    } catch (error) {
      message.error('下载失败');
    }
  };

  const column: ProColumns<ITestCase>[] = useMemo(
    () => [
      {
        title: 'ID',
        dataIndex: 'uid',
        fixed: 'left',
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
        title: '标签',
        dataIndex: 'case_tag',
        ellipsis: true,
        render: (text) => (
          <Text strong ellipsis={{ tooltip: text }}>
            {text}
          </Text>
        ),
      },
      {
        title: '用例等级',
        dataIndex: 'case_level',
        valueEnum: CASE_LEVEL_ENUM,
        render: (text, record: ITestCase) => (
          <Text strong ellipsis={{ tooltip: text }}>
            {text}
          </Text>
        ),
      },
      {
        title: '用例类型',
        dataIndex: 'case_type',
        valueEnum: CASE_TYPE_ENUM,
        render: (text, record: ITestCase) => (
          <Text strong ellipsis={{ tooltip: text }}>
            {record.case_type ? <>{CASE_TYPE_ENUM[record.case_type]}</> : '-'}
          </Text>
        ),
      },
      {
        title: '创建人',
        dataIndex: 'creatorName',
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
      },

      {
        valueType: 'option',
        fixed: 'right',
        width: '10%',
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
              {TableOptions(record)}
            </Space>
          );
        },
      },
    ],
    [CASE_LEVEL_ENUM, colors, borderRadius, token],
  );

  const TableOptions = (record: ITestCase) => {
    const items: MenuProps['items'] = [
      {
        label: (
          <Link
            style={{
              color: colors.primary,
              cursor: 'pointer',
            }}
            onClick={async () => await copyCase(record.id)}
          >
            复制
          </Link>
        ),
        icon: <CopyOutlined />,
        key: '0',
      },
      {
        label: (
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
        ),
        icon: <SoundOutlined />,
        key: '1',
      },
      {
        key: '3',
        label: '移动至',
        icon: <DeliveredProcedureOutlined />,
        onClick: () => {
          setCurrentCaseId(record.id);
          setOpenModal(true);
        },
      },
      {
        type: 'divider',
        key: 'divider',
      },
      {
        label: (
          <Popconfirm title={'确认删除'}>
            <Link
              style={{
                color: colors.error,
                cursor: 'pointer',
              }}
              onClick={async () => {
                await removeCase(record.id);
              }}
            >
              删除
            </Link>
          </Popconfirm>
        ),
        icon: <DeleteOutlined />,
        key: '2',
      },
    ];

    return (
      <Dropdown menu={{ items }} trigger={['click', 'hover']}>
        <SmallDashOutlined />
      </Dropdown>
    );
  };

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
    const formData = new FormData();
    const fileValue = values.file;
    formData.append('file', fileValue[0].originFileObj);
    formData.append('project_id', values.project_id);
    formData.append('module_id', values.module_id);
    formData.append('is_common', true.toString());
    const { code } = await uploadTestCase(formData);
    if (code === 0) {
      message.success('上传成功');
    }
    uploadForm.resetFields();
    return true;
  };

  /** 复制用例 */
  const copyCase = async (caseId?: number) => {
    if (!caseId) {
      return;
    }
    const { code } = await copyTestCase({
      caseId: caseId,
    });
    if (code === 0) {
      actionRef.current?.reload();
      message.success('复制成功');
    }
  };

  /** 删除用例 */
  const removeCase = async (caseId?: number) => {
    if (!caseId) {
      return;
    }
    const { code } = await removeTestCase({
      caseId: caseId,
    });
    if (code === 0) {
      actionRef.current?.reload();
      message.success('删除成功');
    }
  };

  const toolBarRender = [
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

    <Button key="add" type="primary" onClick={() => setOpenNewCaseDrawer(true)}>
      添加用例
    </Button>,
  ];
  return (
    <>
      <Modal
        open={openModal}
        onOk={async () => {
          try {
            const values = await moveForm.validateFields();
            if (!currentCaseId) return;
            const response = await updateTestCase({
              id: currentCaseId,
              project_id: values.project_id,
              module_id: values.module_id,
            } as ITestCase);
            if (response?.code === 0) {
              message.success(response.msg);
              moveForm.resetFields();
              setOpenModal(false);
              actionRef.current?.reload();
            }
          } catch (error) {
            console.error('操作失败:', error);
          }
        }}
        onCancel={() => setOpenModal(false)}
        title={<span style={{ fontWeight: 600 }}>{'移动用例'}</span>}
        width={600}
      >
        <ProForm submitter={false} form={moveForm} layout="vertical">
          <ProFormSelect
            width="md"
            options={projects}
            label="项目"
            name="project_id"
            required
            onChange={(value) => setSelectProjectId(value as number)}
            fieldProps={{ placeholder: '请选择目标项目' }}
          />
          <ProFormTreeSelect
            required
            name="module_id"
            label="模块"
            rules={[{ required: true, message: '所属模块必选' }]}
            fieldProps={{
              treeData: moduleEnum,
              fieldNames: { label: 'title' },
              filterTreeNode: true,
              placeholder: '请选择目标模块',
            }}
            width="md"
          />
        </ProForm>
      </Modal>
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
        name={'添加用例'}
        open={openNewCaseDrawer}
        setOpen={setOpenNewCaseDrawer}
        width={'60%'}
      >
        <CaseForm
          callback={() => {
            setOpenNewCaseDrawer(false);
            actionRef.current?.reload();
          }}
          project_id={currentProjectId!}
          module_id={currentModuleId!}
        />
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
        toolBarRender={() => toolBarRender}
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

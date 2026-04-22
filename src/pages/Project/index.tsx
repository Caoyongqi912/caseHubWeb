import { IProject } from '@/api';
import { newProject, putProject, queryProject, searchUser } from '@/api/base';
import { GlassBackground, useGlassStyles } from '@/components/Glass';
import { history } from '@@/core/history';
import {
  ArrowRightOutlined,
  InfoCircleOutlined,
  PlusOutlined,
  ProjectTwoTone,
  TeamOutlined,
} from '@ant-design/icons';
import {
  ModalForm,
  ProCard,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import {
  Badge,
  Button,
  Col,
  Empty,
  Form,
  message,
  Row,
  Space,
  Typography,
} from 'antd';
import React, { useEffect, useState } from 'react';
import { useAccess } from 'umi';
import ProjectStats from './ProjectStats';

const { Paragraph } = Typography;

/**
 * 项目列表页面组件
 * 用于展示所有项目，支持新建、编辑项目，并在项目卡片上显示统计信息
 */
const ProjectList: React.FC = () => {
  const { isAdmin } = useAccess();
  const styles = useGlassStyles();
  const [projects, setProjects] = useState<IProject[]>([]);
  const [status, setStatus] = useState<number>(0);
  const [currentProjectId, setCurrentProjectId] = useState<string>();
  const [openModel, setOpenModel] = useState(false);
  const [currentForm] = Form.useForm<IProject>();
  const [title, setTitle] = useState('');

  useEffect(() => {
    queryProject().then(async ({ code, data }) => {
      if (code === 0) {
        setProjects(data);
      }
    });
  }, [status]);

  const isReload = async () => {
    setStatus(status + 1);
  };

  const saveOrPut = async () => {
    const values = await currentForm.validateFields();
    if (currentProjectId) {
      putProject({ ...values, uid: currentProjectId }).then(
        async ({ code, msg }) => {
          if (code === 0) {
            message.success(msg);
            setOpenModel(false);
            await isReload();
            return true;
          }
        },
      );
    } else {
      newProject(values).then(async ({ code, msg }) => {
        if (code === 0) {
          message.success(msg);
          setOpenModel(false);
          await isReload();
          return true;
        }
      });
    }
  };

  const queryUser: any = async (value: any) => {
    const { keyWords } = value;
    if (keyWords) {
      const { code, data } = await searchUser({ username: keyWords });
      if (code === 0) {
        return data.map((item) => ({
          label: item.username,
          value: item.id,
        }));
      }
    }
  };

  return (
    <GlassBackground
      glowOrbConfigs={[
        {
          color: styles.colors.primary,
          size: 600,
          top: '-10%',
          left: '-10%',
          animationDuration: '8s',
        },
        {
          color: styles.colors.success,
          size: 500,
          top: '60%',
          left: '70%',
          animationDuration: '10s',
        },
        {
          color: '#13c2c2',
          size: 400,
          top: '30%',
          left: '80%',
          animationDuration: '12s',
        },
      ]}
      extraAnimations={`
        .project-card-wrapper {
          animation: slideUp 0.5s ease-out forwards;
          opacity: 0;
        }
        .project-card-wrapper:nth-child(1) { animation-delay: 0.05s; }
        .project-card-wrapper:nth-child(2) { animation-delay: 0.1s; }
        .project-card-wrapper:nth-child(3) { animation-delay: 0.15s; }
        .project-card-wrapper:nth-child(4) { animation-delay: 0.2s; }
        .project-card-wrapper:nth-child(5) { animation-delay: 0.25s; }
        .project-card-wrapper:nth-child(6) { animation-delay: 0.3s; }
      `}
    >
      <ModalForm<IProject>
        title={`${title}项目`}
        form={currentForm}
        open={openModel}
        onOpenChange={setOpenModel}
        autoFocusFirstInput
        modalProps={{
          onCancel: () => console.log('close'),
          width: 600,
        }}
        onFinish={saveOrPut}
      >
        <ProFormText
          name="title"
          label="项目名称"
          placeholder="请输入项目名称"
          required={true}
        />
        <ProFormText
          name="desc"
          label="项目描述"
          placeholder="请输入项目描述"
          required={true}
        />
        <ProFormSelect
          showSearch
          name="chargeId"
          label="项目负责人"
          placeholder="请输入负责人名称进行搜索"
          rules={[{ required: true, message: '请选择项目负责人！' }]}
          debounceTime={1000}
          request={queryUser}
          fieldProps={{
            optionFilterProp: 'label',
            labelInValue: false,
          }}
        />
      </ModalForm>
      <ProCard
        gutter={[16, 16]}
        title={'全部项目'}
        headerBordered={true}
        extra={
          <Button
            type={'primary'}
            icon={<PlusOutlined />}
            onClick={() => {
              setTitle('新增');
              setOpenModel(true);
            }}
            style={{
              borderRadius: '8px',
              background: styles.colors.gradientPrimary,
              border: 'none',
              boxShadow: `0 4px 16px ${styles.colors.primaryGlow}`,
            }}
          >
            新建项目
          </Button>
        }
        style={{
          marginBottom: 24,
          borderRadius: '16px',
          background: styles.colors.glass,
          backdropFilter: 'blur(20px)',
          border: `1px solid ${styles.colors.glassBorder}`,
          boxShadow: `0 8px 32px ${styles.colors.primaryGlow}20`,
        }}
        bodyStyle={{
          padding: '24px',
          background: 'transparent',
        }}
      >
        {projects.length > 0 ? (
          <Row gutter={[24, 24]}>
            {projects.map((item, index) => {
              return (
                <Col
                  xs={24}
                  sm={24}
                  md={8}
                  lg={6}
                  key={index}
                  style={{ display: 'flex' }}
                  className="project-card-wrapper"
                >
                  <ProCard
                    onClick={() => {
                      history.push(`/project/detail/projectId=${item.id}`);
                    }}
                    hoverable={true}
                    type="inner"
                    headerBordered={false}
                    style={{
                      flex: 1,
                      borderRadius: '12px',
                      background: styles.colors.glass,
                      backdropFilter: 'blur(16px)',
                      border: `1px solid ${styles.colors.glassBorder}`,
                      boxShadow: `0 4px 20px ${styles.colors.primaryGlow}15`,
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                    }}
                    headStyle={{
                      background: 'transparent',
                      borderBottom: `1px solid ${styles.colors.borderLight}`,
                    }}
                    bodyStyle={{
                      background: 'transparent',
                    }}
                    actions={
                      isAdmin
                        ? [
                            <a
                              key="edit"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCurrentProjectId(item.uid);
                                currentForm.setFieldsValue(item);
                                setTitle('编辑');
                                setOpenModel(true);
                              }}
                              style={{
                                color: '#1890ff',
                                fontSize: '14px',
                              }}
                            >
                              编辑
                            </a>,
                          ]
                        : []
                    }
                    title={
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Space size={8}>
                          <Badge
                            count={item.id}
                            showZero
                            style={{
                              backgroundColor: '#1890ff',
                              fontSize: '12px',
                              padding: '0 6px',
                            }}
                          />
                          <Space size={8}>
                            <ProjectTwoTone style={{ fontSize: '18px' }} />
                            <span
                              style={{
                                fontSize: '16px',
                                fontWeight: 600,
                              }}
                            >
                              {item.title}
                            </span>
                          </Space>
                        </Space>
                        <ArrowRightOutlined
                          style={{
                            color: '#1890ff',
                            fontSize: '16px',
                            opacity: 0,
                            transition: 'opacity 0.3s ease',
                          }}
                          className="card-arrow"
                        />
                      </div>
                    }
                  >
                    <Space direction="vertical" style={{ width: '100%' }}>
                      {item.description ? (
                        <Paragraph
                          style={{
                            marginBottom: 12,
                            color: '#595959',
                            lineHeight: '1.5',
                            fontSize: '14px',
                          }}
                        >
                          {item.description}
                        </Paragraph>
                      ) : (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            color: '#bfbfbf',
                            fontSize: '14px',
                            marginBottom: 12,
                          }}
                        >
                          <InfoCircleOutlined style={{ marginRight: 8 }} />
                          暂无项目描述
                        </div>
                      )}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          color: '#8c8c8c',
                          fontSize: '12px',
                        }}
                      >
                        <TeamOutlined style={{ marginRight: 4 }} />
                        <span>创建人: {item.creatorName || '无'}</span>
                      </div>
                      <ProjectStats projectId={item.id} />
                    </Space>
                  </ProCard>
                </Col>
              );
            })}
          </Row>
        ) : (
          <div
            style={{
              textAlign: 'center',
              padding: '64px 24px',
              background: styles.colors.glass,
              backdropFilter: 'blur(16px)',
              borderRadius: '12px',
              margin: '24px 0',
              border: `1px solid ${styles.colors.glassBorder}`,
            }}
          >
            <Empty description="暂无项目数据" />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              style={{ marginTop: 24 }}
              onClick={() => {
                setTitle('新增');
                setOpenModel(true);
              }}
            >
              新建项目
            </Button>
          </div>
        )}
      </ProCard>
    </GlassBackground>
  );
};

export default ProjectList;

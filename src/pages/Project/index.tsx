import { IProject } from '@/api';
import { newProject, putProject, queryProject, searchUser } from '@/api/base';
import { history } from '@@/core/history';
import { PlusOutlined, ProjectTwoTone } from '@ant-design/icons';
import {
  ModalForm,
  ProCard,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { Button, Col, Form, message, Row, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import { useAccess } from 'umi';

const { Paragraph } = Typography;

const ProjectList: React.FC = () => {
  const { isAdmin } = useAccess();
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
    <>
      <ModalForm<IProject>
        title={`${title}项目`}
        form={currentForm}
        open={openModel}
        onOpenChange={setOpenModel}
        autoFocusFirstInput
        // 关闭执录入执行
        modalProps={{
          onCancel: () => console.log('close'),
        }}
        onFinish={saveOrPut}
      >
        <ProFormText
          name="title"
          label="项目名称"
          placeholder="input your project name"
          required={true}
        />
        <ProFormText
          name="desc"
          label="项目描述"
          placeholder="input your project desc"
        />
        <ProFormSelect
          showSearch
          name="chargeId"
          label="项目负责人"
          placeholder="input your admin name to search"
          rules={[{ required: true, message: 'Please select !' }]}
          debounceTime={1000}
          request={queryUser}
          fieldProps={{
            optionFilterProp: 'label', // 确保搜索是基于 label(chargeName) 而不是 value(chargeId)
            labelInValue: false, // 确保只提交 value 而不是 {value,label} 对象
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
            onClick={() => {
              setTitle('新增');
              setOpenModel(true);
            }}
          >
            <PlusOutlined />
            新建项目
          </Button>
        }
        style={{ marginBlockStart: 16, height: 'auto' }}
      >
        <Row gutter={[20, 20]}>
          {projects.map((item, index) => {
            return (
              <Col span={8} key={index}>
                <ProCard
                  onClick={() => {
                    history.push(`/project/detail/projectId=${item.id}`);
                  }}
                  bordered={true}
                  hoverable={true}
                  type="inner"
                  headerBordered={true}
                  style={{ marginBlockStart: 16, borderRadius: 16 }}
                  actions={
                    isAdmin
                      ? [
                          <a
                            key="edit"
                            onClick={() => {
                              setCurrentProjectId(item.uid);
                              currentForm.setFieldsValue(item);
                              setTitle('编辑');
                              setOpenModel(true);
                            }}
                          >
                            编辑
                          </a>,
                        ]
                      : []
                  }
                  title={
                    <>
                      <ProjectTwoTone />
                      <span style={{ marginLeft: 8 }}>{item.title} </span>
                    </>
                  }
                >
                  <Paragraph>{item.description}</Paragraph>
                </ProCard>
              </Col>
            );
          })}
        </Row>
      </ProCard>
    </>
  );
};

export default ProjectList;

import { IModuleEnum } from '@/api';
import { uploadInterApi } from '@/api/inter';
import {
  queryEnvByProjectIdFormApi,
  queryProjects,
} from '@/components/CommonFunc';
import { useGlassStyles } from '@/components/Glass';
import { ModuleEnum } from '@/utils/config';
import { ApiPostIcon, PostManIcon, SwaggerIcon, YAPIIcon } from '@/utils/icons';
import { fetchModulesEnum } from '@/utils/somefunc';
import {
  ProCard,
  ProForm,
  ProFormSelect,
  ProFormTreeSelect,
  ProFormUploadDragger,
} from '@ant-design/pro-components';
import { Button, Col, Form, message, Row, Space, Typography } from 'antd';
import { useEffect, useState } from 'react';

const { Text } = Typography;

const Index = () => {
  const styles = useGlassStyles();
  const [form] = Form.useForm();
  const [currentValue, setCurrentValue] = useState<string>();
  const [projects, setProjects] = useState<{ label: string; value: number }[]>(
    [],
  );
  const [moduleEnum, setModuleEnum] = useState<IModuleEnum[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<number>();
  const [envs, setEnvs] = useState<{ label: string; value: number | null }[]>(
    [],
  );

  useEffect(() => {
    queryProjects(setProjects).then();
  }, []);

  useEffect(() => {
    if (currentProjectId) {
      fetchModulesEnum(currentProjectId, ModuleEnum.API, setModuleEnum).then();
      queryEnvByProjectIdFormApi(currentProjectId, setEnvs, true).then();
    }
  }, [currentProjectId]);

  const typeOptions = [
    { title: 'Swagger', icon: <SwaggerIcon />, value: '1' },
    { title: 'PostMan', icon: <PostManIcon />, value: '2' },
    { title: 'ApiPost', icon: <ApiPostIcon />, value: '3' },
    { title: 'YApi', icon: <YAPIIcon />, value: '4' },
  ];

  const cardStyle = {
    borderRadius: 12,
    backgroundColor: 'transparent',
    boxShadow: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
  };

  const onClick = async (value: string) => {
    setCurrentValue(value);
  };

  const onSubmit = async () => {
    const values = form.getFieldsValue();
    const fileValue = values.api_file;
    if (currentValue && fileValue?.length > 0) {
      const formData = new FormData();
      formData.append('api_file', fileValue[0].originFileObj);
      formData.append('valueType', currentValue);
      formData.append('env_id', values.env_id);
      formData.append('project_id', values.project_id);
      formData.append('module_id', values.module_id);
      const { code, msg } = await uploadInterApi(formData);
      if (code === 0) {
        form.resetFields();
        message.success(msg);
      }
    }
  };

  return (
    <ProCard
      headerBordered
      split="horizontal"
      style={{
        height: 'calc(100vh - 200px)', // 占满父容器
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden', // 禁止自身滚动
      }}
      styles={{
        body: {
          padding: '12px',
          height: '100%',
        },
      }}
    >
      {/* 卡片选择区 - 固定高度 */}
      <div>
        <Row gutter={[16, 16]}>
          {typeOptions.map((item, index) => {
            const isSelected = currentValue === item.value;
            return (
              <Col span={12} key={index}>
                <ProCard
                  bordered
                  onClick={() => onClick(item.value)}
                  hoverable
                  type="inner"
                  style={{
                    ...cardStyle,
                    backgroundColor: isSelected
                      ? `${styles.colors.primary}10`
                      : 'transparent',
                  }}
                >
                  <Space direction="vertical" align="center" size={8}>
                    {item.icon}
                    <Text strong>{item.title}</Text>
                  </Space>
                </ProCard>
              </Col>
            );
          })}
        </Row>
      </div>

      {/* 表单区域 - 自动占满剩余高度 */}
      {currentValue && (
        <ProCard
          headerBordered
          split="horizontal"
          style={{
            marginTop: 20,
            flex: 1, // 占满剩余空间
            overflow: 'hidden',
          }}
        >
          <ProForm form={form} submitter={false}>
            <ProForm.Group>
              <ProFormSelect
                width="md"
                options={projects}
                label="所属项目"
                name="project_id"
                required
                onChange={(value) => setCurrentProjectId(value as number)}
              />
              <ProFormTreeSelect
                required
                name="module_id"
                label="所属模块"
                allowClear
                rules={[{ required: true, message: '所属模块必选' }]}
                fieldProps={{
                  treeData: moduleEnum,
                  fieldNames: { label: 'title' },
                  filterTreeNode: true,
                }}
                width="md"
              />
              <ProFormSelect
                name="env_id"
                options={envs}
                required
                placeholder="环境选择"
                label="Env"
              />
            </ProForm.Group>

            <ProFormUploadDragger
              title={false}
              max={1}
              description="上传文件"
              name="api_file"
            />
          </ProForm>

          <div style={{ marginTop: 16, textAlign: 'right' }}>
            <Button type="primary" onClick={onSubmit}>
              上传
            </Button>
          </div>
        </ProCard>
      )}
    </ProCard>
  );
};

export default Index;

import { IProject } from '@/api';
import {
  CloseOutlined,
  ProjectTwoTone,
  SearchOutlined,
} from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import { Avatar, Button, Select, Space, Tooltip, Typography } from 'antd';
import { FC, useState } from 'react';

const { Title, Text } = Typography;

interface IProps {
  currentProjectId?: number;
  projects: IProject[];
  onProjectChange: (projectId: number | undefined) => void;
}

const ProjectSelect: FC<IProps> = ({
  currentProjectId,
  projects,
  onProjectChange,
}) => {
  const [searchValue, setSearchValue] = useState('');

  // 获取当前选中的项目
  const currentProject = currentProjectId
    ? projects.find((item) => item.id === currentProjectId)
    : null;

  // 渲染自定义选项
  const renderOption = (item: IProject) => {
    const projectColors = [
      '#1890ff', // 蓝色
      '#52c41a', // 绿色
      '#722ed1', // 紫色
      '#fa8c16', // 橙色
      '#f5222d', // 红色
      '#13c2c2', // 青色
      '#eb2f96', // 粉色
    ];
    const colorIndex = item.id ? item.id % projectColors.length : 0;

    return {
      label: (
        <Space style={{ width: '100%', padding: '8px 4px' }}>
          <Avatar
            size="small"
            style={{
              // backgroundColor: projectColors[colorIndex],
              color: '#fff',
              fontSize: '12px',
            }}
          >
            {item.title?.charAt(0).toUpperCase()}
          </Avatar>
          <div style={{ flex: 1 }}>
            <Text strong style={{ fontSize: '13px' }}>
              {item.title}
            </Text>
            {item.description && (
              <div>
                <Text type="secondary" style={{ fontSize: '11px' }}>
                  {item.description.length > 30
                    ? `${item.description.substring(0, 30)}...`
                    : item.description}
                </Text>
              </div>
            )}
          </div>
        </Space>
      ),
      value: item.id,
    };
  };

  // 过滤选项
  const filteredOptions = projects
    .filter(
      (item) =>
        item.title?.toLowerCase().includes(searchValue.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchValue.toLowerCase()),
    )
    .map(renderOption);

  if (currentProject) {
    return (
      <ProCard
        // bordered={true}
        size="small"
        style={{
          width: '100%',
          marginBottom: 5,
          borderRadius: 12,
          borderLeft: `4px solid #1890ff`,
          borderBottom: `1px solid #1890ff`,
          // boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        }}
        bodyStyle={{ padding: '16px' }}
      >
        <Space
          direction="vertical"
          style={{
            width: '100%',
            justifyContent: 'space-between',
          }}
        >
          {/* 项目标题区域 */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              width: '100%',
            }}
          >
            <Space align="center">
              <ProjectTwoTone
                twoToneColor="#1890ff"
                style={{ fontSize: '24px' }}
              />
              <div>
                <Title
                  level={4}
                  style={{
                    margin: 0,
                    fontWeight: 600,
                    color: '#1890ff',
                  }}
                >
                  {currentProject.title}
                </Title>
              </div>
            </Space>

            <Tooltip title="切换项目">
              <Button
                type="text"
                size="small"
                icon={<CloseOutlined />}
                onClick={() => onProjectChange(undefined)}
                style={{
                  color: '#999',
                  borderRadius: '50%',
                  width: 24,
                  height: 24,
                  minWidth: 24,
                }}
              />
            </Tooltip>
          </div>
        </Space>
      </ProCard>
    );
  }

  return (
    <ProCard
      size="small"
      style={{
        marginBottom: 16,
        borderRadius: 12,
      }}
      bodyStyle={{ padding: '20px 16px' }}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        {/* 标题区域 */}
        <Space align="center" style={{ marginBottom: 16 }}>
          <ProjectTwoTone twoToneColor="#722ed1" style={{ fontSize: '20px' }} />
          <Text strong style={{ fontSize: '14px', color: '#722ed1' }}>
            选择项目
          </Text>
        </Space>

        {/* 搜索选择区域 */}
        <Select
          style={{
            width: '100%',
          }}
          size="large"
          showSearch
          allowClear
          autoFocus
          placeholder={
            <Space>
              <SearchOutlined />
              <span>搜索或选择项目...</span>
            </Space>
          }
          options={filteredOptions}
          onChange={(value: number) => {
            onProjectChange(value);
          }}
          onSearch={setSearchValue}
          filterOption={false} // 使用自定义过滤
          dropdownStyle={{
            borderRadius: 8,
            padding: '8px 0',
          }}
          dropdownRender={(menu) => (
            <div>
              {searchValue && (
                <div
                  style={{
                    padding: '8px 12px',
                    fontSize: '12px',
                    color: '#666',
                    borderBottom: '1px solid #f0f0f0',
                  }}
                >
                  搜索结果 ({filteredOptions.length})
                </div>
              )}
              {menu}
              {projects.length > 5 && !searchValue && (
                <div
                  style={{
                    padding: '8px 12px',
                    fontSize: '11px',
                    color: '#999',
                    textAlign: 'center',
                    borderTop: '1px solid #f0f0f0',
                  }}
                >
                  共有 {projects.length} 个项目
                </div>
              )}
            </div>
          )}
          suffixIcon={<SearchOutlined style={{ color: '#666' }} />}
        />

        {/* 项目统计提示 */}
        {projects.length > 0 && (
          <div
            style={{
              textAlign: 'center',
              marginTop: 12,
            }}
          >
            <Text type="secondary" style={{ fontSize: '12px' }}>
              <ProjectTwoTone twoToneColor="#52c41a" />
              &nbsp;共 {projects.length} 个项目可供选择
            </Text>
          </div>
        )}
      </Space>
    </ProCard>
  );
};

export default ProjectSelect;

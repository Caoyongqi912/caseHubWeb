import { IProject } from '@/api';
import { ProjectOutlined, SwapOutlined } from '@ant-design/icons';
import { Avatar, Select, theme, Tooltip, Typography } from 'antd';
import { FC, useMemo, useState } from 'react';

const { useToken } = theme;
const { Text } = Typography;

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
  const { token } = useToken();

  const projectColors = useMemo(
    () => [
      token.colorPrimary,
      token.colorSuccess,
      token.colorInfo,
      token.colorWarning,
      token.colorError,
      '#13c2c2',
      '#eb2f96',
      '#722ed1',
    ],
    [token],
  );

  const getProjectColor = (id: number | undefined) => {
    const colorIndex = id ? id % projectColors.length : 0;
    return projectColors[colorIndex];
  };

  const filteredOptions = projects
    .filter((item) =>
      item.title?.toLowerCase().includes(searchValue.toLowerCase()),
    )
    .map((item) => ({
      label: item.title,
      value: item.id,
    }));

  const currentProject = currentProjectId
    ? projects.find((item) => item.id === currentProjectId)
    : null;

  if (currentProject) {
    const color = getProjectColor(currentProject.id);
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '8px 10px',
          borderRadius: 8,
          background: token.colorBgLayout,
          border: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        <Avatar
          size={28}
          style={{
            background: color,
            color: '#fff',
            fontSize: 12,
            fontWeight: 600,
            flexShrink: 0,
          }}
        >
          {currentProject.title?.charAt(0).toUpperCase()}
        </Avatar>
        <Text
          strong
          style={{
            flex: 1,
            minWidth: 0,
            fontSize: 13,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          title={currentProject.title}
        >
          {currentProject.title}
        </Text>
        <Tooltip title="切换项目">
          <SwapOutlined
            style={{
              fontSize: 13,
              color: token.colorTextSecondary,
              cursor: 'pointer',
              padding: 4,
              borderRadius: 4,
              transition: 'background 0.15s',
            }}
            onClick={() => onProjectChange(undefined)}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background =
                token.colorBgContainer;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'transparent';
            }}
          />
        </Tooltip>
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 8,
        }}
      >
        <ProjectOutlined style={{ color: token.colorTextSecondary }} />
        <Text strong style={{ fontSize: 13, color: token.colorText }}>
          选择项目
        </Text>
      </div>
      <Select
        style={{ width: '100%' }}
        size="middle"
        showSearch
        allowClear
        autoFocus
        placeholder="搜索或选择项目"
        options={filteredOptions}
        onChange={(value: number) => onProjectChange(value)}
        onSearch={setSearchValue}
        filterOption={false}
      />
    </div>
  );
};

export default ProjectSelect;

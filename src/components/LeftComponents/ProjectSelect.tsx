import { IProject } from '@/api';
import {
  CloseOutlined,
  ProjectTwoTone,
  SearchOutlined,
} from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import {
  Avatar,
  Button,
  Select,
  Space,
  theme,
  Tooltip,
  Typography,
} from 'antd';
import { FC, useState } from 'react';
import {
  borderRadius,
  shadows,
  spacing,
  styleHelpers,
  typography,
} from './styles';

const { useToken } = theme;
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
  const { token } = useToken();

  const currentProject = currentProjectId
    ? projects.find((item) => item.id === currentProjectId)
    : null;

  const renderOption = (item: IProject) => {
    const projectColors = [
      token.colorPrimary,
      token.colorSuccess,
      token.colorInfo,
      token.colorWarning,
      token.colorError,
      '#13c2c2',
      '#eb2f96',
    ];
    const colorIndex = item.id ? item.id % projectColors.length : 0;

    return {
      label: (
        <div
          style={{
            width: '100%',
            padding: `${spacing.md}px ${spacing.xs}px`,
            ...styleHelpers.transition(['background-color', 'transform']),
            borderRadius: borderRadius.md,
          }}
        >
          <Space align="center" size={spacing.md} style={{ width: '100%' }}>
            <Avatar
              size="default"
              style={{
                backgroundColor: projectColors[colorIndex],
                color: token.colorBgContainer,
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.semibold,
                boxShadow: shadows.sm,
                flexShrink: 0,
              }}
            >
              {item.title?.charAt(0).toUpperCase()}
            </Avatar>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Text
                strong
                style={{
                  fontSize: typography.fontSize.base,
                  color: token.colorText,
                  fontWeight: typography.fontWeight.medium,
                  display: 'block',
                  lineHeight: typography.lineHeight.tight,
                }}
              >
                {item.title}
              </Text>
              {item.description && (
                <Text
                  type="secondary"
                  style={{
                    fontSize: typography.fontSize.xs,
                    color: token.colorTextSecondary,
                    lineHeight: typography.lineHeight.tight,
                    display: 'block',
                    ...styleHelpers.truncate(1),
                  }}
                >
                  {item.description.length > 35
                    ? `${item.description.substring(0, 35)}...`
                    : item.description}
                </Text>
              )}
            </div>
          </Space>
        </div>
      ),
      value: item.id,
    };
  };

  const filteredOptions = projects
    .filter(
      (item) =>
        item.title?.toLowerCase().includes(searchValue.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchValue.toLowerCase()),
    )
    .map(renderOption);

  if (currentProject) {
    const projectColors = [
      token.colorPrimary,
      token.colorSuccess,
      token.colorInfo,
      token.colorWarning,
      token.colorError,
      '#13c2c2',
      '#eb2f96',
    ];
    const colorIndex = currentProject.id
      ? currentProject.id % projectColors.length
      : 0;

    return (
      <ProCard
        size="small"
        style={{
          width: '100%',
          marginBottom: spacing.sm,
          borderRadius: borderRadius.xl,
          borderLeft: `4px solid ${token.colorPrimary}`,
          border: `1px solid ${token.colorBorder}`,
          boxShadow: shadows.card,
          ...styleHelpers.transition(['box-shadow', 'transform']),
          cursor: 'default',
        }}
        bodyStyle={{ padding: spacing.lg }}
        hoverable={false}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Space align="center" size={spacing.md}>
            <Avatar
              size="large"
              style={{
                backgroundColor: projectColors[colorIndex],
                color: token.colorBgContainer,
                fontSize: typography.fontSize.md,
                fontWeight: typography.fontWeight.semibold,
                boxShadow: shadows.sm,
              }}
            >
              {currentProject.title?.charAt(0).toUpperCase()}
            </Avatar>
            <div>
              <Title
                level={5}
                style={{
                  margin: 0,
                  fontWeight: typography.fontWeight.semibold,
                  color: token.colorPrimary,
                  fontSize: typography.fontSize.base,
                  lineHeight: typography.lineHeight.tight,
                }}
              >
                {currentProject.title}
              </Title>
              {currentProject.description && (
                <Text
                  type="secondary"
                  style={{
                    fontSize: typography.fontSize.xs,
                    color: token.colorTextSecondary,
                    marginTop: spacing.xs,
                    display: 'block',
                    ...styleHelpers.truncate(1),
                  }}
                >
                  {currentProject.description}
                </Text>
              )}
            </div>
          </Space>

          <Tooltip title="切换项目" placement="left">
            <Button
              type="text"
              size="small"
              icon={<CloseOutlined />}
              onClick={() => onProjectChange(undefined)}
              style={{
                ...styleHelpers.iconButton(token),
              }}
            />
          </Tooltip>
        </div>
      </ProCard>
    );
  }

  return (
    <ProCard
      size="small"
      style={{
        marginBottom: spacing.lg,
        borderRadius: borderRadius.xl,
        border: `1px solid ${token.colorBorder}`,
        boxShadow: shadows.card,
        ...styleHelpers.transition(['box-shadow']),
      }}
      bodyStyle={{ padding: `${spacing.xl}px ${spacing.lg}px` }}
    >
      <Space direction="vertical" style={{ width: '100%' }} size={spacing.lg}>
        <Space align="center" size={spacing.md}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: borderRadius.md,
              background: `linear-gradient(135deg, ${token.colorPrimaryBg} 0%, ${token.colorPrimary} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ProjectTwoTone
              twoToneColor={token.colorPrimary}
              style={{
                fontSize: typography.fontSize.xl,
                color: token.colorBgContainer,
              }}
            />
          </div>
          <div>
            <Text
              strong
              style={{
                fontSize: typography.fontSize.md,
                color: token.colorText,
                fontWeight: typography.fontWeight.semibold,
                display: 'block',
              }}
            >
              选择项目
            </Text>
            <Text
              type="secondary"
              style={{
                fontSize: typography.fontSize.xs,
                color: token.colorTextSecondary,
              }}
            >
              从下方列表中选择
            </Text>
          </div>
        </Space>

        <Select
          style={{ width: '100%' }}
          size="large"
          showSearch
          allowClear
          autoFocus
          placeholder={
            <Space>
              <SearchOutlined style={{ color: token.colorTextSecondary }} />
              <span style={{ color: token.colorTextSecondary }}>
                搜索或选择项目...
              </span>
            </Space>
          }
          options={filteredOptions}
          onChange={(value: number) => {
            onProjectChange(value);
          }}
          onSearch={setSearchValue}
          filterOption={false}
          dropdownStyle={{
            borderRadius: borderRadius.md,
            padding: `${spacing.sm}px 0`,
            boxShadow: shadows.dropdown,
          }}
          dropdownRender={(menu) => (
            <div>
              {searchValue && (
                <div
                  style={{
                    padding: `${spacing.sm}px ${spacing.md}px`,
                    fontSize: typography.fontSize.xs,
                    color: token.colorTextSecondary,
                    fontWeight: typography.fontWeight.medium,
                    borderBottom: `1px solid ${token.colorBorder}`,
                    backgroundColor: token.colorBgContainer,
                  }}
                >
                  搜索结果 ({filteredOptions.length})
                </div>
              )}
              {menu}
              {projects.length > 5 && !searchValue && (
                <div
                  style={{
                    padding: `${spacing.sm}px ${spacing.md}px`,
                    fontSize: typography.fontSize.xs,
                    color: token.colorTextSecondary,
                    textAlign: 'center',
                    borderTop: `1px solid ${token.colorBorder}`,
                    backgroundColor: token.colorBgContainer,
                  }}
                >
                  共有 {projects.length} 个项目
                </div>
              )}
            </div>
          )}
          suffixIcon={
            <SearchOutlined style={{ color: token.colorTextSecondary }} />
          }
        />

        {projects.length > 0 && (
          <div
            style={{
              padding: `${spacing.md}px ${spacing.lg}px`,
              background: `linear-gradient(135deg, ${token.colorSuccessBg} 0%, ${token.colorSuccessBgHover} 100%)`,
              borderRadius: borderRadius.md,
              border: `1px solid ${token.colorSuccessBorder}`,
              display: 'flex',
              alignItems: 'center',
              gap: spacing.sm,
            }}
          >
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: borderRadius.round,
                background: token.colorSuccess,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ProjectTwoTone
                twoToneColor={token.colorBgContainer}
                style={{ fontSize: typography.fontSize.sm }}
              />
            </div>
            <Text
              style={{
                fontSize: typography.fontSize.sm,
                color: token.colorSuccessText,
                fontWeight: typography.fontWeight.medium,
                flex: 1,
              }}
            >
              共 {projects.length} 个项目可供选择
            </Text>
          </div>
        )}
      </Space>
    </ProCard>
  );
};

export default ProjectSelect;

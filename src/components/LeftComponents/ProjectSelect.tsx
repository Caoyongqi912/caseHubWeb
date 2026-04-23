import { IProject } from '@/api';
import {
  CheckCircleOutlined,
  CloseOutlined,
  ProjectOutlined,
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
import { FC, useMemo, useState } from 'react';
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

  const styles = useMemo(
    () => ({
      projectCard: {
        width: '100%',
        marginBottom: spacing.sm,
        borderRadius: borderRadius.xl,
        border: `1px solid ${token.colorBorder}`,
        boxShadow: shadows.card,
        background: `linear-gradient(135deg, ${token.colorBgContainer} 0%, ${token.colorPrimaryBg} 100%)`,
        cursor: 'default',
        overflow: 'hidden',
        position: 'relative' as const,
      },
      selectCard: {
        marginBottom: spacing.lg,
        borderRadius: borderRadius.xl,
        border: `1px solid ${token.colorBorder}`,
        boxShadow: shadows.card,
        background: token.colorBgContainer,
      },
      avatar: {
        background: `linear-gradient(135deg, ${token.colorPrimary} 0%, ${token.colorPrimaryHover} 100%)`,
        color: token.colorBgContainer,
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.semibold,
        boxShadow: shadows.sm,
      },
      indicator: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: spacing.xs,
        padding: `${spacing.xs}px ${spacing.sm}px`,
        borderRadius: borderRadius.md,
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.medium,
      },
    }),
    [token],
  );

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

  const renderOption = (item: IProject) => {
    const color = getProjectColor(item.id);

    return {
      label: (
        <div
          style={{
            width: '100%',
            padding: `${spacing.sm}px ${spacing.xs}px`,
            borderRadius: borderRadius.md,
            ...styleHelpers.transition(['background-color', 'transform']),
          }}
        >
          <Space align="center" size={spacing.md} style={{ width: '100%' }}>
            <Avatar
              size={36}
              style={{
                background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
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

  const currentProject = currentProjectId
    ? projects.find((item) => item.id === currentProjectId)
    : null;

  if (currentProject) {
    const color = getProjectColor(currentProject.id);

    return (
      <ProCard
        size="small"
        style={styles.projectCard}
        bodyStyle={{ padding: spacing.lg }}
        hoverable={false}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: `linear-gradient(90deg, ${color} 0%, ${color}80 50%, ${color} 100%)`,
          }}
        />
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
              size={44}
              style={{
                background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
                color: token.colorBgContainer,
                fontSize: typography.fontSize.lg,
                fontWeight: typography.fontWeight.bold,
                boxShadow: shadows.md,
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
                  color: token.colorText,
                  fontSize: typography.fontSize.md,
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
                borderRadius: borderRadius.round,
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: token.colorTextSecondary,
                ...styleHelpers.transition([
                  'background-color',
                  'color',
                  'transform',
                ]),
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = token.colorErrorBg;
                e.currentTarget.style.color = token.colorError;
                e.currentTarget.style.transform = 'rotate(90deg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = token.colorTextSecondary;
                e.currentTarget.style.transform = 'rotate(0deg)';
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
      style={styles.selectCard}
      bodyStyle={{ padding: `${spacing.xl}px ${spacing.lg}px` }}
    >
      <Space direction="vertical" style={{ width: '100%' }} size={spacing.lg}>
        <Space align="center" size={spacing.md}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: borderRadius.lg,
              background: `linear-gradient(135deg, ${token.colorPrimaryBg} 0%, ${token.colorPrimary} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: shadows.sm,
            }}
          >
            <ProjectOutlined
              style={{
                fontSize: typography.fontSize.lg,
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
            borderRadius: borderRadius.lg,
            padding: `${spacing.sm}px 0`,
            boxShadow: shadows.dropdown,
            border: `1px solid ${token.colorBorderSecondary}`,
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
                    backgroundColor: token.colorBgLayout,
                  }}
                >
                  <Space>
                    <SearchOutlined />
                    搜索结果 ({filteredOptions.length})
                  </Space>
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
                    backgroundColor: token.colorBgLayout,
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
              borderRadius: borderRadius.lg,
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
                background: `linear-gradient(135deg, ${token.colorSuccess} 0%, ${token.colorSuccessActive} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: shadows.sm,
              }}
            >
              <CheckCircleOutlined
                style={{ fontSize: typography.fontSize.sm, color: '#fff' }}
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

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

const { useToken } = theme;

const { Title, Text } = Typography;

// 样式常量
const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

const borderRadius = {
  xs: 2,
  sm: 4,
  md: 6,
  lg: 8,
  xl: 12,
  xxl: 16,
  round: 9999,
};

const shadows = {
  none: 'none',
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px 0 rgba(0, 0, 0, 0.04)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.04)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.02)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.04)',
  card: '0 2px 8px rgba(0, 0, 0, 0.06)',
  cardHover: '0 4px 12px rgba(0, 0, 0, 0.10)',
  dropdown:
    '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)',
};

const typography = {
  fontSize: {
    xs: 11,
    sm: 12,
    base: 13,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 20,
    xxxl: 24,
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

const styleHelpers = {
  transition: (properties: string[] = ['all']) => {
    return {
      transition: properties
        .map((prop) => `${prop} 200ms ease-in-out`)
        .join(', '),
    };
  },
  truncate: (lines: number = 1) => {
    return {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      display: '-webkit-box',
      WebkitLineClamp: lines,
      WebkitBoxOrient: 'vertical' as const,
    };
  },
};

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

  // 获取当前选中的项目
  const currentProject = currentProjectId
    ? projects.find((item) => item.id === currentProjectId)
    : null;

  // 渲染自定义选项 - 使用设计令牌优化
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
        <Space
          style={{
            width: '100%',
            padding: `${spacing.sm}px ${spacing.xs}px`,
            ...styleHelpers.transition(['background-color', 'transform']),
          }}
        >
          <Avatar
            size="small"
            style={{
              backgroundColor: projectColors[colorIndex],
              color: token.colorBgContainer,
              fontSize: typography.fontSize.xs,
              fontWeight: typography.fontWeight.semibold,
              boxShadow: shadows.xs,
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
              <div style={{ marginTop: 2 }}>
                <Text
                  type="secondary"
                  style={{
                    fontSize: typography.fontSize.xs,
                    color: token.colorTextSecondary,
                    lineHeight: typography.lineHeight.tight,
                    ...styleHelpers.truncate(1),
                  }}
                >
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
            <ProjectTwoTone
              twoToneColor={token.colorPrimary}
              style={{
                fontSize: typography.fontSize.xxxl,
                ...styleHelpers.transition(['transform']),
              }}
            />
            <div>
              <Title
                level={4}
                style={{
                  margin: 0,
                  fontWeight: typography.fontWeight.semibold,
                  color: token.colorPrimary,
                  fontSize: typography.fontSize.lg,
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
                color: token.colorTextSecondary,
                borderRadius: borderRadius.round,
                width: 28,
                height: 28,
                minWidth: 28,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                ...styleHelpers.transition(['background-color', 'color']),
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = token.colorBgContainer;
                e.currentTarget.style.color = token.colorText;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = token.colorTextSecondary;
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
        {/* 标题区域 */}
        <Space align="center" size={spacing.md}>
          <ProjectTwoTone
            twoToneColor={token.colorPrimary}
            style={{ fontSize: typography.fontSize.xl }}
          />
          <Text
            strong
            style={{
              fontSize: typography.fontSize.md,
              color: token.colorText,
              fontWeight: typography.fontWeight.semibold,
            }}
          >
            选择项目
          </Text>
        </Space>

        {/* 搜索选择区域 */}
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

        {/* 项目统计提示 */}
        {projects.length > 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: `${spacing.sm}px ${spacing.md}px`,
              backgroundColor: token.colorSuccessBg,
              borderRadius: borderRadius.md,
              border: `1px solid ${token.colorSuccessBorder}`,
            }}
          >
            <Text
              style={{
                fontSize: typography.fontSize.xs,
                color: token.colorSuccess,
                fontWeight: typography.fontWeight.medium,
              }}
            >
              <ProjectTwoTone twoToneColor={token.colorSuccess} />
              &nbsp;共 {projects.length} 个项目可供选择
            </Text>
          </div>
        )}
      </Space>
    </ProCard>
  );
};

export default ProjectSelect;

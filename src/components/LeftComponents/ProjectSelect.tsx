import { IProject } from '@/api';
import {
  CloseOutlined,
  ProjectTwoTone,
  SearchOutlined,
} from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import { Avatar, Button, Select, Space, Tooltip, Typography } from 'antd';
import { FC, useState } from 'react';
import {
  borderRadius,
  colors,
  shadows,
  spacing,
  styleHelpers,
  typography,
} from './designTokens';

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

  // 渲染自定义选项 - 使用设计令牌优化
  const renderOption = (item: IProject) => {
    const projectColors = [
      colors.primary[500],
      colors.success[500],
      colors.secondary[500],
      colors.warning[500],
      colors.error[500],
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
              color: colors.neutral[0],
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
                color: colors.neutral[800],
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
                    color: colors.neutral[500],
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
          borderLeft: `4px solid ${colors.primary[500]}`,
          border: `1px solid ${colors.primary[100]}`,
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
              twoToneColor={colors.primary[500]}
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
                  color: colors.primary[600],
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
                    color: colors.neutral[600],
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
                color: colors.neutral[500],
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
                e.currentTarget.style.backgroundColor = colors.neutral[100];
                e.currentTarget.style.color = colors.neutral[700];
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = colors.neutral[500];
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
        border: `1px solid ${colors.functional.borderLight}`,
        boxShadow: shadows.card,
        ...styleHelpers.transition(['box-shadow']),
      }}
      bodyStyle={{ padding: `${spacing.xl}px ${spacing.lg}px` }}
    >
      <Space direction="vertical" style={{ width: '100%' }} size={spacing.lg}>
        {/* 标题区域 */}
        <Space align="center" size={spacing.md}>
          <ProjectTwoTone
            twoToneColor={colors.secondary[500]}
            style={{ fontSize: typography.fontSize.xl }}
          />
          <Text
            strong
            style={{
              fontSize: typography.fontSize.md,
              color: colors.secondary[600],
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
              <SearchOutlined style={{ color: colors.neutral[400] }} />
              <span style={{ color: colors.neutral[400] }}>
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
                    color: colors.neutral[600],
                    fontWeight: typography.fontWeight.medium,
                    borderBottom: `1px solid ${colors.functional.divider}`,
                    backgroundColor: colors.neutral[50],
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
                    color: colors.neutral[500],
                    textAlign: 'center',
                    borderTop: `1px solid ${colors.functional.divider}`,
                    backgroundColor: colors.neutral[50],
                  }}
                >
                  共有 {projects.length} 个项目
                </div>
              )}
            </div>
          )}
          suffixIcon={<SearchOutlined style={{ color: colors.neutral[500] }} />}
        />

        {/* 项目统计提示 */}
        {projects.length > 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: `${spacing.sm}px ${spacing.md}px`,
              backgroundColor: colors.success[50],
              borderRadius: borderRadius.md,
              border: `1px solid ${colors.success[100]}`,
            }}
          >
            <Text
              style={{
                fontSize: typography.fontSize.xs,
                color: colors.success[700],
                fontWeight: typography.fontWeight.medium,
              }}
            >
              <ProjectTwoTone twoToneColor={colors.success[500]} />
              &nbsp;共 {projects.length} 个项目可供选择
            </Text>
          </div>
        )}
      </Space>
    </ProCard>
  );
};

export default ProjectSelect;

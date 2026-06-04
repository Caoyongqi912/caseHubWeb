/**
 * @file src/pages/CaseHub/CaseConfig/index.tsx
 * @description 用例配置中心
 * 通过 Tabs 聚合多个枚举配置（用例状态、评审状态等），新增配置类型时
 * 仅需在 CASE_CONFIG_CATEGORIES 注册并提供对应实现组件
 */

import { useCaseHubTheme } from '@/pages/CaseHub/styles';
import {
  ApartmentOutlined,
  AuditOutlined,
  ExperimentOutlined,
  SettingOutlined,
  TagsOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { Card, Segmented, Space, Tag, Typography } from 'antd';
import { FC, useMemo, useState } from 'react';
import CaseStatusConfig from './CaseStatusConfig';
import {
  CASE_CONFIG_CATEGORIES,
  findCaseConfigCategory,
  ICaseConfigCategory,
} from './constants';
import { CaseConfigKeyEnum } from './types';

const { Paragraph } = Typography;

/**
 * 已实现的 Tab 渲染器映射
 * 后续新增配置类型时在此追加即可
 *
 * 注意：PLAN_MODULE 前端组件已就绪（PlanModuleConfig），等待后端接口联调后
 * 再从 RENDER_MAP 启用，避免在接口未就绪时暴露给用户
 */
const RENDER_MAP: Record<
  string,
  FC<{
    configKey: string;
    title: string;
    description: string;
  }>
> = {
  [CaseConfigKeyEnum.CASE_STATUS]: CaseStatusConfig,
  [CaseConfigKeyEnum.REVIEW_STATUS]: CaseStatusConfig,
  [CaseConfigKeyEnum.CASE_LEVEL]: CaseStatusConfig,
  [CaseConfigKeyEnum.CASE_TYPE]: CaseStatusConfig,
};

/**
 * 渲染对应 Tab 内容
 */
const renderTabContent = (category: ICaseConfigCategory) => {
  const Component = RENDER_MAP[category.key];
  if (!Component) {
    return (
      <div
        style={{
          padding: '60px 20px',
          textAlign: 'center',
          color: '#999',
        }}
      >
        暂未实现「{category.label}」的配置面板
      </div>
    );
  }
  return (
    <Component
      configKey={category.key}
      title={category.label}
      description={category.description}
    />
  );
};

/**
 * 分类图标映射
 * antd icon name -> ReactNode
 */
const ICON_MAP: Record<string, React.ReactNode> = {
  ExperimentOutlined: <ExperimentOutlined />,
  AuditOutlined: <AuditOutlined />,
  TrophyOutlined: <TrophyOutlined />,
  TagsOutlined: <TagsOutlined />,
  // 计划目录模板图标：组件保留在 ./PlanModuleConfig/，入口暂为 comingSoon
  ApartmentOutlined: <ApartmentOutlined />,
};

/**
 * 用例配置中心主页面
 */
const CaseConfigPage: FC = () => {
  const { token, borderRadius } = useCaseHubTheme();
  const [activeKey, setActiveKey] = useState<string>(
    CASE_CONFIG_CATEGORIES[0]?.key ?? CaseConfigKeyEnum.CASE_STATUS,
  );

  const activeCategory = useMemo(
    () => findCaseConfigCategory(activeKey),
    [activeKey],
  );

  const styles = useMemo(
    () => ({
      hero: {
        position: 'relative' as const,
        padding: '24px 28px',
        borderRadius: borderRadius.xl,
        background: `linear-gradient(135deg, ${token.colorPrimaryBg} 0%, ${token.colorInfoBg} 100%)`,
        border: `1px solid ${token.colorPrimaryBorder}`,
        marginBottom: 16,
        overflow: 'hidden',
      },
      heroTitle: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        fontSize: 20,
        fontWeight: 600,
        color: token.colorText,
        margin: 0,
      },
      heroDesc: {
        color: token.colorTextSecondary,
        fontSize: 13,
        lineHeight: 1.7,
        margin: '8px 0 0',
        maxWidth: 720,
      },
      heroDecor: {
        position: 'absolute' as const,
        right: -60,
        top: -60,
        width: 220,
        height: 220,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${token.colorPrimary}30 0%, transparent 70%)`,
        pointerEvents: 'none' as const,
      },
      categoryTag: {
        fontSize: 12,
        padding: '2px 8px',
        borderRadius: 6,
        background: token.colorPrimaryBg,
        color: token.colorPrimary,
        fontFamily: '"SF Mono", "Fira Code", "JetBrains Mono", monospace',
        fontWeight: 600,
        margin: '0 4px',
      },
      activeBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 12,
        color: token.colorTextSecondary,
        background: token.colorFillAlter,
        padding: '4px 10px',
        borderRadius: 6,
      },
      activeDot: {
        width: 6,
        height: 6,
        borderRadius: '50%',
        background: token.colorSuccess,
        boxShadow: `0 0 6px ${token.colorSuccess}`,
      },
    }),
    [token, borderRadius],
  );

  return (
    <PageContainer
      title={false}
      header={{
        breadcrumb: {
          routes: [],
        },
      }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 20px)',
        overflow: 'hidden',
      }}
    >
      <div style={styles.hero}>
        <div style={styles.heroDecor} />
        <h1 style={styles.heroTitle}>
          <SettingOutlined style={{ color: token.colorPrimary }} />
          用例配置中心
        </h1>
        <Paragraph style={styles.heroDesc}>
          统一管理测试用例相关的枚举配置。当前支持
          <Tag style={styles.categoryTag}>CASE_STATUS</Tag>
          用例状态、
          <Tag style={styles.categoryTag}>REVIEW_STATUS</Tag>
          评审状态、
          <Tag style={styles.categoryTag}>CASE_LEVEL</Tag>
          用例等级、
          <Tag style={styles.categoryTag}>CASE_TYPE</Tag>
          用例类型等枚举的增删改查。配置变更会同步至后端，供其他业务模块读取使用。
        </Paragraph>
      </div>

      <Card
        variant="borderless"
        style={{
          background: token.colorBgContainer,
          borderRadius: borderRadius.lg,
          marginBottom: 12,
        }}
        styles={{
          body: {
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          },
        }}
      >
        <Space size={12} wrap>
          <Segmented
            value={activeKey}
            onChange={(v) => setActiveKey(v as string)}
            options={CASE_CONFIG_CATEGORIES.map((c) => ({
              label: (
                <Space size={6} style={{ padding: '0 4px' }}>
                  {ICON_MAP[c.icon]}
                  <span>{c.label}</span>
                </Space>
              ),
              value: c.key,
            }))}
          />
          {activeCategory && (
            <span style={styles.activeBadge}>
              <span style={styles.activeDot} />
              当前：{activeCategory.label}
            </span>
          )}
        </Space>
      </Card>

      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflow: 'auto',
        }}
      >
        {activeCategory ? renderTabContent(activeCategory) : null}
      </div>
    </PageContainer>
  );
};

export default CaseConfigPage;

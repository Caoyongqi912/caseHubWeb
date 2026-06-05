/**
 * PlanRequirementList
 *
 * 计划下已关联需求的「策展式」卡片列表：
 * - 卡片之间用 grid 排布，悬停微微上浮、边框变暖
 * - 右上角状态徽章（等级 + 进度）使用主题色之外的「暖色语义色」
 * - 底部操作区提供「查看详情」「解除关联」两个动作
 * - 列表为空时给一个温柔的「尚无关联需求」插画式占位
 *
 * Props:
 * - planId: 当前计划 ID（用于解除关联时传参）
 * - requirements: 已关联需求数据
 * - loading: 加载中（骨架态）
 * - onUnlink: 点击解除关联的回调（父组件负责弹确认 + 调 API）
 * - onView: 点击查看详情的回调（父组件负责打开 RequirementDetail 抽屉）
 */
import {
  RequirementProcessEnum,
  RequirementProcessOption,
} from '@/pages/CaseHub/config/constants';
import { IRequirement } from '@/pages/CaseHub/types';
import {
  DisconnectOutlined,
  FileTextOutlined,
  LinkOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Empty, Skeleton, Tag, Tooltip } from 'antd';
import { FC, useMemo } from 'react';
import { usePlanRequirementStyles } from './styles';

interface Props {
  requirements: IRequirement[];
  loading?: boolean;
  onUnlink: (record: IRequirement) => void;
  onView: (record: IRequirement) => void;
}

/**
 * 进度枚举值 → 主题语义色
 * 故意不复用全局 requirementProcessColors，让此处的卡片更贴合编辑感色板
 */
const processToColor = (
  process: number,
  palette: ReturnType<typeof usePlanRequirementStyles>['palette'],
) => {
  const map: Record<number, { bg: string; border: string; text: string }> = {
    1: palette.rust, // 二轮测试中
    2: palette.amber, // 一轮测试中
    3: palette.sky, // 待测试
    4: palette.sage, // 完成
    5: palette.plum, // 用例中
  };
  return map[process] || palette.sky;
};

/** 等级 → 暖色（避开通用 token 的红橙） */
const levelToColor = (
  level: IRequirement['requirement_level'],
  palette: ReturnType<typeof usePlanRequirementStyles>['palette'],
) => {
  switch (level) {
    case 'P0':
      return palette.rust;
    case 'P1':
      return palette.amber;
    case 'P2':
    default:
      return palette.sky;
  }
};

const PlanRequirementList: FC<Props> = ({
  requirements,
  loading,
  onUnlink,
  onView,
}) => {
  const { palette, surfaces, shadows, spacing, radius, fonts, motion } =
    usePlanRequirementStyles();

  // 容器样式：作为外层使用，这里只渲染 grid 主体
  // 父组件会包一层渐变背景
  const containerStyle = useMemo(
    () => ({
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
      gap: spacing.lg,
      width: '100%',
    }),
    [spacing],
  );

  // 卡片样式：纸张感 + 微妙渐入
  const cardBaseStyle = useMemo(
    () => ({
      background: surfaces.card,
      border: `1px solid ${surfaces.cardBorder}`,
      borderRadius: radius.lg,
      padding: spacing.xl,
      boxShadow: shadows.card,
      transition: `transform ${motion.base}, box-shadow ${motion.base}, border-color ${motion.base}`,
      cursor: 'pointer',
      position: 'relative' as const,
      display: 'flex',
      flexDirection: 'column' as const,
      gap: spacing.lg,
      // 关键帧延迟由父组件通过 style --i 注入
      animation: `planReqCardIn ${motion.slow} both`,
      animationDelay: 'calc(var(--i, 0) * 60ms)',
    }),
    [surfaces, shadows, radius, spacing, motion],
  );

  if (loading) {
    return (
      <div style={containerStyle}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            style={{
              ...cardBaseStyle,
              animation: 'none',
              cursor: 'default',
            }}
          >
            <Skeleton active paragraph={{ rows: 3 }} />
          </div>
        ))}
      </div>
    );
  }

  if (!requirements || requirements.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 320,
          padding: spacing.xxl,
        }}
      >
        <Empty
          image={
            // 简单的「无内容」装饰：手绘风的文件夹图标（SVG）
            <div
              style={{
                width: 96,
                height: 96,
                margin: '0 auto',
                opacity: 0.7,
              }}
            >
              <svg
                viewBox="0 0 96 96"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M14 30c0-3.3 2.7-6 6-6h18l6 8h32c3.3 0 6 2.7 6 6v32c0 3.3-2.7 6-6 6H20c-3.3 0-6-2.7-6-6V30z"
                  stroke={palette.ink[500]}
                  strokeWidth="1.5"
                  fill={palette.ink[100]}
                />
                <path
                  d="M14 38h68"
                  stroke={palette.ink[300]}
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
              </svg>
            </div>
          }
          description={
            <div
              style={{
                fontFamily: fonts.display,
                color: palette.ink[700],
                fontSize: 15,
                marginTop: spacing.md,
              }}
            >
              尚无关联需求 · 点击右上角「关联需求」开始整理
            </div>
          }
        />
      </div>
    );
  }

  return (
    <>
      {/* 模块级 keyframes：使用 emotion 风格的内联 style 注入 */}
      <style>{`
        @keyframes planReqCardIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .plan-req-card:hover {
          transform: translateY(-3px);
          border-color: ${surfaces.cardHoverBorder} !important;
          box-shadow: ${shadows.cardHover} !important;
        }
        .plan-req-card .plan-req-action {
          opacity: 0;
          transform: translateX(-4px);
          transition: opacity ${motion.base}, transform ${motion.base};
        }
        .plan-req-card:hover .plan-req-action,
        .plan-req-card:focus-within .plan-req-action {
          opacity: 1;
          transform: translateX(0);
        }
      `}</style>
      <div style={containerStyle}>
        {requirements.map((record, idx) => {
          const levelColor = levelToColor(record.requirement_level, palette);
          const processColor = processToColor(record.process, palette);
          return (
            <div
              key={record.id}
              className="plan-req-card"
              style={{ ...cardBaseStyle, ['--i' as any]: idx } as any}
              onClick={() => onView(record)}
            >
              {/* 顶部：UID + 等级 + 进度 */}
              <header
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: spacing.md,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing.sm,
                    minWidth: 0,
                  }}
                >
                  <span
                    style={{
                      fontFamily: fonts.mono,
                      fontSize: 11,
                      letterSpacing: '0.04em',
                      color: palette.ink[600],
                      padding: `2px ${spacing.sm}px`,
                      background: palette.ink[100],
                      borderRadius: radius.sm,
                      border: `1px solid ${palette.ink[200]}`,
                      flexShrink: 0,
                    }}
                  >
                    {record.uid}
                  </span>
                  <Tag
                    style={{
                      background: levelColor.bg,
                      borderColor: levelColor.border,
                      color: levelColor.text,
                      borderRadius: radius.md,
                      fontWeight: 600,
                      margin: 0,
                      flexShrink: 0,
                    }}
                  >
                    {record.requirement_level}
                  </Tag>
                </div>
                <Tag
                  style={{
                    background: processColor.bg,
                    borderColor: processColor.border,
                    color: processColor.text,
                    borderRadius: radius.md,
                    margin: 0,
                    fontWeight: 500,
                    flexShrink: 0,
                  }}
                >
                  {RequirementProcessEnum[record.process]?.text ||
                    RequirementProcessOption.find(
                      (o) => o.value === record.process,
                    )?.label ||
                    '-'}
                </Tag>
              </header>

              {/* 中部：需求名（display 字体） */}
              <h3
                style={{
                  fontFamily: fonts.display,
                  fontSize: 19,
                  fontWeight: 500,
                  color: palette.ink[900],
                  margin: 0,
                  lineHeight: 1.4,
                  letterSpacing: '-0.01em',
                  // 限制两行
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {record.requirement_name}
              </h3>

              {/* 底部 meta：维护人 / 创建人 / 用例数 / 链接 */}
              <footer
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: spacing.sm,
                  fontFamily: fonts.body,
                  fontSize: 12,
                  color: palette.ink[700],
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing.lg,
                    flexWrap: 'wrap',
                  }}
                >
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <UserOutlined style={{ color: palette.ink[500] }} />
                    <span style={{ color: palette.ink[600] }}>维护</span>
                    <span style={{ color: palette.ink[900], fontWeight: 500 }}>
                      {record.maintainerName || record.creatorName || '-'}
                    </span>
                  </span>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <FileTextOutlined style={{ color: palette.ink[500] }} />
                    <span style={{ color: palette.ink[600] }}>用例</span>
                    <span style={{ color: palette.ink[900], fontWeight: 500 }}>
                      {record.case_number ?? 0}
                    </span>
                  </span>
                  {record.requirement_url ? (
                    <Tooltip title={record.requirement_url}>
                      <a
                        href={record.requirement_url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          color: palette.accent.primary,
                          textDecoration: 'none',
                        }}
                      >
                        <LinkOutlined />
                        <span>原始链接</span>
                      </a>
                    </Tooltip>
                  ) : null}
                </div>

                {/* 操作行：默认隐藏，hover 卡片时浮现 */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: spacing.md,
                    paddingTop: spacing.sm,
                    borderTop: `1px dashed ${palette.ink[200]}`,
                  }}
                >
                  <button
                    className="plan-req-action"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onView(record);
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontFamily: fonts.body,
                      fontSize: 12,
                      fontWeight: 500,
                      color: palette.accent.primary,
                      padding: `${spacing.xs}px ${spacing.sm}px`,
                      borderRadius: radius.sm,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    查看详情
                  </button>
                  <button
                    className="plan-req-action"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onUnlink(record);
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontFamily: fonts.body,
                      fontSize: 12,
                      fontWeight: 500,
                      color: palette.rust.text,
                      padding: `${spacing.xs}px ${spacing.sm}px`,
                      borderRadius: radius.sm,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <DisconnectOutlined />
                    解除关联
                  </button>
                </div>
              </footer>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default PlanRequirementList;

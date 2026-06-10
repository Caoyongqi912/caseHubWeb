import { IPlanOverviewBug } from '@/api/case/caseplan';
import { useCaseHubTheme } from '@/pages/CaseHub/styles';
import { BugFilled, LinkOutlined } from '@ant-design/icons';
import { Empty, Tag, Tooltip } from 'antd';

interface Props {
  /** 后端返回的 bug_list —— 包含 case_name / step_order / bug_url */
  bugList: IPlanOverviewBug[];
  bugTotal: number;
}

const MAX_VISIBLE = 12;

/**
 * 最近缺陷面板
 *
 * 数据源：overview.bug_list —— 后端按 step_result.id 倒序，
 * 已经按 url 去重，保留最早那条。
 *
 * 视觉：
 *  - 无数据时：Empty 居中
 *  - 有数据时：垂直堆叠的「bug 卡片」，每张卡有 左侧红条 + 步骤n/用例名 + URL
 *  - 超过 MAX_VISIBLE 时整体区域可滚动
 */
const BugListPanel: React.FC<Props> = ({ bugList, bugTotal }) => {
  const { token } = useCaseHubTheme();

  // 前端再做一次合法 URL 过滤 + 上限截断
  const visibleBugs = (bugList || [])
    .filter((b) => /^https?:\/\//i.test(b.bug_url || ''))
    .slice(0, MAX_VISIBLE);

  if (visibleBugs.length === 0) {
    return (
      <div
        style={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <span style={{ color: token.colorTextTertiary, fontSize: 12 }}>
              暂无缺陷链接
            </span>
          }
        />
      </div>
    );
  }

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* 头部：TOTAL + 红色 +N 角标 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px 8px 14px',
          borderBottom: `1px dashed ${token.colorBorderSecondary}`,
          flexShrink: 0,
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 11,
            color: token.colorTextTertiary,
            fontFamily: token.fontFamilyCode,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          <BugFilled style={{ color: token.colorError, fontSize: 12 }} />
          Total · {bugTotal}
        </span>
        <Tag
          color={bugTotal > 0 ? 'red' : 'default'}
          style={{
            fontFamily: token.fontFamilyCode,
            fontVariantNumeric: 'tabular-nums',
            margin: 0,
            fontSize: 11,
          }}
        >
          {bugTotal > 0 ? `+${bugTotal}` : '0'}
        </Tag>
      </div>

      {/* bug 卡片列表 —— 垂直堆叠，超出滚动 */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '8px 14px 12px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}
      >
        {visibleBugs.map((bug, idx) => (
          <BugCard key={`${bug.step_id}-${idx}`} bug={bug} index={idx} />
        ))}
      </div>
    </div>
  );
};

interface BugCardProps {
  bug: IPlanOverviewBug;
  index: number;
}

/**
 * 单条 bug 卡片
 *  - 左侧 3px 红色色条
 *  - 顶部：步骤N · 用例名
 *  - 底部：可点击的链接（域名高亮）
 */
const BugCard: React.FC<BugCardProps> = ({ bug, index }) => {
  const { token } = useCaseHubTheme();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'stretch',
        background: token.colorBgContainer,
        border: `1px solid ${token.colorBorderSecondary}`,
        borderRadius: 6,
        overflow: 'hidden',
        transition: 'border-color 150ms cubic-bezier(0.4, 0, 0.2, 1)',
      }}
      onMouseEnter={(e) => {
        (
          e.currentTarget as HTMLElement
        ).style.borderColor = `${token.colorError}40`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor =
          token.colorBorderSecondary;
      }}
    >
      {/* 左侧红条 */}
      <div
        style={{
          width: 3,
          flexShrink: 0,
          background: token.colorError,
        }}
      />
      <div
        style={{
          flex: 1,
          minWidth: 0,
          padding: '6px 8px 6px 10px',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {/* 顶部：#序号 + 步骤n + 用例名 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12,
            color: token.colorText,
            minWidth: 0,
          }}
        >
          <span
            style={{
              fontFamily: token.fontFamilyCode,
              fontSize: 10,
              color: token.colorTextTertiary,
              letterSpacing: '0.05em',
              flexShrink: 0,
            }}
          >
            #{String(index + 1).padStart(3, '0')}
          </span>
          <span
            style={{
              fontFamily: token.fontFamilyCode,
              fontSize: 10,
              color: token.colorError,
              border: `1px solid ${token.colorError}40`,
              background: `${token.colorError}10`,
              padding: '0 4px',
              borderRadius: 3,
              flexShrink: 0,
            }}
          >
            步骤{bug.step_order}
          </span>
          <Tooltip title={bug.case_name} placement="top">
            <span
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: token.colorText,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                minWidth: 0,
              }}
            >
              {bug.case_name}
            </span>
          </Tooltip>
        </div>
        {/* 底部：链接 */}
        <Tooltip title={bug.bug_url} placement="topLeft">
          <a
            href={bug.bug_url}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 11,
              color: token.colorPrimary,
              fontFamily: token.fontFamilyCode,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              minWidth: 0,
            }}
          >
            <LinkOutlined style={{ flexShrink: 0, fontSize: 10 }} />
            <span
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {formatUrl(bug.bug_url)}
            </span>
          </a>
        </Tooltip>
      </div>
    </div>
  );
};

/** 把 URL 简化为 「host + 末段路径」 的形式, 保留尾部辨识度 */
const formatUrl = (url: string): string => {
  try {
    const u = new URL(url);
    const segs = u.pathname.split('/').filter(Boolean);
    const tail = segs.length > 0 ? `/${segs.slice(-2).join('/')}` : '';
    return `${u.host}${tail}`;
  } catch {
    return url;
  }
};

export default BugListPanel;

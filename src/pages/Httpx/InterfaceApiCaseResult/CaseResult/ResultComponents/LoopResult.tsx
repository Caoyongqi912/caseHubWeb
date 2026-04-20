import APIResult from '@/pages/Httpx/InterfaceApiCaseResult/CaseResult/ResultComponents/APIResult';
import { ICaseContentResult } from '@/pages/Httpx/types';
import { CheckCircleTwoTone, CloseCircleTwoTone } from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import { Tag, theme, Tooltip, Typography } from 'antd';
import { FC, useMemo } from 'react';

const { Text } = Typography;
const { useToken } = theme;

interface Props {
  result: ICaseContentResult;
}

const loopTypeConfig = {
  1: {
    label: '次',
    icon: (
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
    ),
    gradient:
      'linear-gradient(135deg, rgba(234, 179, 8, 0.15) 0%, rgba(202, 138, 4, 0.1) 100%)',
    border: 'rgba(234, 179, 8, 0.35)',
    color: '#b45309',
    badgeColor: 'gold',
  },
  2: {
    label: '数据循环',
    icon: (
      <svg
        width="11"
        height="11"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      </svg>
    ),
    gradient:
      'linear-gradient(135deg, rgba(34, 197, 94, 0.12) 0%, rgba(22, 163, 74, 0.08) 100%)',
    border: 'rgba(34, 197, 94, 0.3)',
    color: '#15803d',
    badgeColor: 'green',
  },
  3: {
    label: '条件循环',
    icon: (
      <svg
        width="11"
        height="11"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    gradient:
      'linear-gradient(135deg, rgba(168, 85, 247, 0.12) 0%, rgba(147, 51, 234, 0.08) 100%)',
    border: 'rgba(168, 85, 247, 0.3)',
    color: '#7c3aed',
    badgeColor: 'purple',
  },
};

const LoopBadge: FC<{
  loopType: number;
  loopCount?: number;
  loopItems?: string;
}> = ({ loopType, loopCount, loopItems }) => {
  const config = loopTypeConfig[loopType as keyof typeof loopTypeConfig];
  const badgeStyle = useMemo(
    () => ({
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px',
      padding: '3px 10px',
      background: config.gradient,
      border: `1px solid ${config.border}`,
      borderRadius: '8px',
      fontSize: '11px',
      color: config.color,
      fontWeight: 600,
      letterSpacing: '0.3px',
      transition: 'all 0.2s ease',
    }),
    [config],
  );

  if (loopType === 1) {
    return (
      <span style={badgeStyle}>
        {config.icon}
        <span style={{ fontFamily: 'Monaco, "Courier New", monospace' }}>
          ×{loopCount}
        </span>
        <span style={{ opacity: 0.7 }}>次</span>
      </span>
    );
  }

  if (loopType === 2) {
    return (
      <div
        style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 8 }}
      >
        <span style={badgeStyle}>
          {config.icon}
          {loopItems || '数据项'}
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="rgba(0, 0, 0, 0.25)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
        <span
          style={{
            fontSize: '11px',
            color: 'rgba(0, 0, 0, 0.45)',
            maxWidth: '100px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontFamily: 'Monaco, "Courier New", monospace',
          }}
        >
          {loopItems || '数据项'}
        </span>
      </div>
    );
  }

  return (
    <span style={badgeStyle}>
      {config.icon}
      {config.label}
    </span>
  );
};

const LoopResult: FC<Props> = ({ result }) => {
  const { token } = useToken();

  const statusColor = result.result ? token.colorSuccess : token.colorError;

  const cardStyle = useMemo(
    () => ({
      borderRadius: '8px',
      borderLeft: `3px solid ${statusColor}`,
      marginTop: 8,
      transition: 'box-shadow 0.2s ease',
    }),
    [statusColor],
  );

  const headerContent = useMemo(
    () => (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        <Tag color={'green-inverse'}>STEP_{result.content_step}</Tag>
        <Tooltip title={'循环步骤'}>
          <Tag color={'purple-inverse'}>LOOP</Tag>
        </Tooltip>
        {result.result ? (
          <CheckCircleTwoTone twoToneColor={token.colorSuccess} />
        ) : (
          <CloseCircleTwoTone twoToneColor={token.colorError} />
        )}
        <span>{result.content_name}</span>
        {result?.loop_type && (
          <LoopBadge
            loopType={result.loop_type}
            loopCount={result.loop_count}
            loopItems={result.loop_items}
          />
        )}
      </div>
    ),
    [result, token],
  );

  return (
    <ProCard
      bordered
      style={cardStyle}
      collapsibleIconRender={() => headerContent}
      headerBordered
      collapsible
      defaultCollapsed
      extra={
        <Text type="secondary" style={{ fontSize: 12 }}>
          共 {result?.data?.length || 0} 接口
        </Text>
      }
    >
      <APIResult result={result} prefix={'LOOP_STEP'} />
    </ProCard>
  );
};

export default LoopResult;

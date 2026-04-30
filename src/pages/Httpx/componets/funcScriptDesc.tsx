import { queryScripts } from '@/api/inter';
import { Empty, Tag, theme, Typography } from 'antd';
import { useEffect, useState } from 'react';

const { Paragraph, Text } = Typography;

interface IFuncMap {
  title: string;
  args?: string | string[] | null;
  returnContent?: string;
  subTitle: string;
  desc?: any;
  example?: string;
  url?: string;
}

const FuncScriptDesc = () => {
  const [scriptsDesc, setScriptsDesc] = useState<IFuncMap[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { token } = theme.useToken();

  useEffect(() => {
    queryScripts().then(async ({ code, data }) => {
      if (code === 0) {
        setLoading(false);
        setScriptsDesc(data);
      }
    });
  }, []);

  const isDark =
    token.colorBgContainer === '#141414' || token.colorBgLayout === '#000';

  const colors = {
    containerBg: isDark
      ? 'linear-gradient(145deg, #0a0e27 0%, #1a1f3c 100%)'
      : 'linear-gradient(145deg, #f8fafc 0%, #e2e8f0 100%)',
    contentBg: isDark
      ? 'rgba(255, 255, 255, 0.03)'
      : 'rgba(255, 255, 255, 0.8)',
    contentBgHover: isDark
      ? 'rgba(255, 255, 255, 0.05)'
      : 'rgba(255, 255, 255, 0.95)',
    contentBorder: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
    contentBorderHover: isDark
      ? 'rgba(99, 102, 241, 0.4)'
      : 'rgba(99, 102, 241, 0.3)',
    textPrimary: isDark ? '#ffffff' : 'rgba(0, 0, 0, 0.88)',
    textSecondary: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.45)',
    textDescription: isDark
      ? 'rgba(255, 255, 255, 0.7)'
      : 'rgba(0, 0, 0, 0.65)',
    accentPrimary: '#6366f1',
    accentSecondary: '#8b5cf6',
    accentTertiary: '#a855f7',
    textHighlight: '#a5b4fc',
    headerBg: isDark ? 'rgba(99, 102, 241, 0.08)' : 'rgba(99, 102, 241, 0.05)',
    codeBlockBg: isDark ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.02)',
    codeText: '#a5b4fc',
    paramBg: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.08)',
    paramBorder: isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.2)',
    paramText: '#6ee7b7',
    returnBg: isDark ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.08)',
    returnBorder: isDark
      ? 'rgba(245, 158, 11, 0.3)'
      : 'rgba(245, 158, 11, 0.2)',
    returnText: '#fcd34d',
    sectionLabel: isDark
      ? 'rgba(99, 102, 241, 0.8)'
      : 'rgba(99, 102, 241, 0.7)',
    cardBodyPadding: 0,
  };

  const renderCodeBlock = (code: string | undefined) => {
    if (!code) return null;
    return (
      <div
        style={{
          background: colors.codeBlockBg,
          border: `1px solid ${colors.contentBorder}`,
          borderRadius: 8,
          overflow: 'hidden',
        }}
      >
        <pre
          style={{
            padding: 16,
            margin: 0,
            fontFamily: '"JetBrains Mono", "SF Mono", monospace',
            fontSize: 12,
            lineHeight: 1.6,
            color: colors.codeText,
            overflowX: 'auto',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
          }}
        >
          {code}
        </pre>
      </div>
    );
  };

  const renderFuncCard = (func: IFuncMap, index: number) => {
    return (
      <div
        key={func.title}
        style={{
          background: colors.contentBg,
          backdropFilter: 'blur(10px)',
          border: `1px solid ${colors.contentBorder}`,
          borderRadius: 12,
          overflow: 'hidden',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          animation: 'fadeInUp 0.5s ease-out forwards',
          animationDelay: `${index * 0.05}s`,
          opacity: 0,
          position: 'relative',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.borderColor = colors.contentBorderHover;
          e.currentTarget.style.boxShadow = `0 20px 40px ${
            isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)'
          }, 0 0 60px ${colors.accentPrimary}15`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.borderColor = colors.contentBorder;
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: `linear-gradient(90deg, ${colors.accentPrimary}, ${colors.accentSecondary}, ${colors.accentTertiary})`,
            opacity: 0,
            transition: 'opacity 0.3s ease',
          }}
          className="card-top-border"
        />

        <div
          style={{
            padding: '20px 24px',
            borderBottom: `1px solid ${colors.contentBorder}`,
            background: colors.headerBg,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
            }}
          >
            <span
              className="func-name"
              style={{
                fontFamily: '"JetBrains Mono", "SF Mono", monospace',
                fontSize: 16,
                fontWeight: 500,
                color: '#e2e8f0',
                transition: 'color 0.3s ease',
                wordBreak: 'break-all',
              }}
            >
              {func.title}
            </span>
            <Tag
              style={{
                background: `${colors.accentPrimary}33`,
                border: `1px solid ${colors.accentPrimary}4d`,
                color: colors.textHighlight,
                fontSize: 11,
                fontWeight: 500,
                padding: '4px 10px',
                borderRadius: 4,
                whiteSpace: 'nowrap',
                margin: 0,
              }}
            >
              {func.subTitle}
            </Tag>
          </div>
        </div>

        <div style={{ padding: '20px 24px' }}>
          {func.desc && (
            <div style={{ marginBottom: 16 }}>
              <Text
                style={{
                  display: 'block',
                  fontSize: 11,
                  fontWeight: 600,
                  color: colors.sectionLabel,
                  textTransform: 'uppercase',
                  letterSpacing: '1.5px',
                  marginBottom: 8,
                }}
              >
                描述
              </Text>
              <Paragraph
                style={{
                  color: colors.textDescription,
                  fontSize: 13,
                  lineHeight: 1.7,
                  margin: 0,
                }}
              >
                {func.desc}
              </Paragraph>
            </div>
          )}

          {func.example && (
            <div style={{ marginBottom: 16 }}>
              <Text
                style={{
                  display: 'block',
                  fontSize: 11,
                  fontWeight: 600,
                  color: colors.sectionLabel,
                  textTransform: 'uppercase',
                  letterSpacing: '1.5px',
                  marginBottom: 8,
                }}
              >
                示例
              </Text>
              {renderCodeBlock(func.example)}
            </div>
          )}

          {func.args &&
            (Array.isArray(func.args)
              ? func.args.length > 0
              : typeof func.args === 'string' && func.args.length > 0) && (
              <div style={{ marginBottom: 16 }}>
                <Text
                  style={{
                    display: 'block',
                    fontSize: 11,
                    fontWeight: 600,
                    color: colors.sectionLabel,
                    textTransform: 'uppercase',
                    letterSpacing: '1.5px',
                    marginBottom: 8,
                  }}
                >
                  参数
                </Text>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {Array.isArray(func.args) ? (
                    func.args.map((arg: string, i: number) => (
                      <Tag
                        key={i}
                        style={{
                          background: colors.paramBg,
                          border: `1px solid ${colors.paramBorder}`,
                          color: colors.paramText,
                          fontFamily: '"JetBrains Mono", "SF Mono", monospace',
                          fontSize: 12,
                          padding: '4px 12px',
                          borderRadius: 4,
                          margin: 0,
                        }}
                      >
                        {arg}
                      </Tag>
                    ))
                  ) : (
                    <Tag
                      style={{
                        background: colors.paramBg,
                        border: `1px solid ${colors.paramBorder}`,
                        color: colors.paramText,
                        fontFamily: '"JetBrains Mono", "SF Mono", monospace',
                        fontSize: 12,
                        padding: '4px 12px',
                        borderRadius: 4,
                        margin: 0,
                      }}
                    >
                      {func.args}
                    </Tag>
                  )}
                </div>
              </div>
            )}

          {func.returnContent && (
            <div>
              <Text
                style={{
                  display: 'block',
                  fontSize: 11,
                  fontWeight: 600,
                  color: colors.sectionLabel,
                  textTransform: 'uppercase',
                  letterSpacing: '1.5px',
                  marginBottom: 8,
                }}
              >
                返回值
              </Text>
              <Tag
                style={{
                  background: colors.returnBg,
                  border: `1px solid ${colors.returnBorder}`,
                  color: colors.returnText,
                  fontFamily: '"JetBrains Mono", "SF Mono", monospace',
                  fontSize: 12,
                  padding: '4px 12px',
                  borderRadius: 4,
                  margin: 0,
                }}
              >
                {func.returnContent}
              </Tag>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 768px) {
          .func-script-container {
            padding: 16px !important;
          }
          .func-list {
            grid-template-columns: 1fr !important;
          }
          .header-title {
            font-size: 24px !important;
          }
        }
      `}</style>

      <div
        className="func-script-container"
        style={{
          padding: 24,
          minHeight: 'calc(100vh - 200px)',
          background: colors.containerBg,
          borderRadius: 16,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            background: `radial-gradient(circle at 30% 20%, ${colors.accentPrimary}14 0%, transparent 50%)`,
            pointerEvents: 'none',
          }}
        />

        <div
          className="func-script-header"
          style={{
            textAlign: 'center',
            marginBottom: 40,
            position: 'relative',
            zIndex: 1,
          }}
        >
          <h2
            className="header-title"
            style={{
              fontFamily: '"Noto Sans SC", sans-serif',
              fontSize: 32,
              fontWeight: 700,
              color: colors.textPrimary,
              margin: '0 0 12px 0',
              letterSpacing: 2,
              textShadow: `0 0 30px ${colors.accentPrimary}80`,
            }}
          >
            内置函数
          </h2>
          <p
            style={{
              fontSize: 14,
              color: colors.textSecondary,
              margin: 0,
              fontFamily: '"Noto Sans SC", sans-serif',
              letterSpacing: 1,
            }}
          >
            用于前后置 Python 脚本编写
          </p>
        </div>

        <div
          className="func-list"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
            gap: 20,
            position: 'relative',
            zIndex: 1,
          }}
        >
          {loading ? (
            <div
              style={{
                gridColumn: '1 / -1',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '60px 0',
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  border: `3px solid ${colors.accentPrimary}33`,
                  borderTopColor: colors.accentPrimary,
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }}
              />
              <Text
                style={{
                  marginTop: 16,
                  color: colors.textSecondary,
                  fontSize: 13,
                }}
              >
                加载中...
              </Text>
            </div>
          ) : scriptsDesc.length === 0 ? (
            <div
              style={{
                gridColumn: '1 / -1',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <Empty description="暂无可用函数" />
            </div>
          ) : (
            scriptsDesc.map((func, index) => renderFuncCard(func, index))
          )}
        </div>
      </div>
    </>
  );
};

export default FuncScriptDesc;

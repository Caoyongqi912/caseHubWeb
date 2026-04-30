import { queryScripts } from '@/api/inter';
import { Card, Empty, Tag, Typography } from 'antd';
import { useEffect, useState } from 'react';
import './funcScriptDesc.less';

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

  useEffect(() => {
    queryScripts().then(async ({ code, data }) => {
      if (code === 0) {
        setLoading(false);
        setScriptsDesc(data);
      }
    });
  }, []);

  const renderCodeBlock = (code: string | undefined) => {
    if (!code) return null;
    return (
      <div className="code-block">
        <pre>{code}</pre>
      </div>
    );
  };

  const renderFuncCard = (func: IFuncMap, index: number) => {
    return (
      <Card
        key={func.title}
        className="func-card"
        style={{ animationDelay: `${index * 0.05}s` }}
      >
        <div className="func-header">
          <div className="func-title-row">
            <span className="func-name">{func.title}</span>
            <Tag className="func-category">{func.subTitle}</Tag>
          </div>
        </div>

        <div className="func-body">
          {func.desc && (
            <div className="func-desc">
              <Text className="section-label">描述</Text>
              <Paragraph className="desc-text">{func.desc}</Paragraph>
            </div>
          )}

          {func.example && (
            <div className="func-example">
              <Text className="section-label">示例</Text>
              {renderCodeBlock(func.example)}
            </div>
          )}

          {func.args &&
            (Array.isArray(func.args)
              ? func.args.length > 0
              : typeof func.args === 'string' && func.args.length > 0) && (
              <div className="func-params">
                <Text className="section-label">参数</Text>
                <div className="params-list">
                  {Array.isArray(func.args) ? (
                    func.args.map((arg: string, i: number) => (
                      <Tag key={i} className="param-tag">
                        {arg}
                      </Tag>
                    ))
                  ) : (
                    <Tag className="param-tag">{func.args}</Tag>
                  )}
                </div>
              </div>
            )}

          {func.returnContent && (
            <div className="func-return">
              <Text className="section-label">返回值</Text>
              <Tag className="return-tag">{func.returnContent}</Tag>
            </div>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="func-script-container">
      <div className="func-script-header">
        <h2 className="header-title">内置函数</h2>
        <p className="header-subtitle">用于前后置 Python 脚本编写</p>
      </div>

      <div className="func-list">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner" />
            <Text className="loading-text">加载中...</Text>
          </div>
        ) : scriptsDesc.length === 0 ? (
          <Empty description="暂无可用函数" />
        ) : (
          scriptsDesc.map((func, index) => renderFuncCard(func, index))
        )}
      </div>
    </div>
  );
};

export default FuncScriptDesc;

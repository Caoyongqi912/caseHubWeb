import { getDBContentInfo, queryDBConfig } from '@/api/base/dbConfig';
import { updateCaseContent } from '@/api/inter/interCase';
import AceCodeEditor from '@/components/CodeEditor/AceCodeEditor';
import Handler from '@/components/DnDDraggable/handler';
import CardExtraOption from '@/pages/Httpx/InterfaceApiCase/InterfaceApiCaseDetail/contents/CardExtraOption';
import DBEditorCard from '@/pages/Httpx/InterfaceApiCase/InterfaceApiCaseDetail/contents/DBScriptProCard/DBEditorCard';
import DBExtractTable from '@/pages/Httpx/InterfaceApiCase/InterfaceApiCaseDetail/contents/DBScriptProCard/DBExtractTable';
import { IBeforeSQLExtract, IInterfaceCaseContent } from '@/pages/Httpx/types';
import { DatabaseOutlined, EditOutlined } from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import { Divider, Input, Space, Tag, theme, Typography } from 'antd';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';

const { Text } = Typography;
const { useToken } = theme;

interface Props {
  id: number;
  step: number;
  caseId: number;
  caseContent: IInterfaceCaseContent;
  projectId?: number;
  callback?: () => void;
}

/**
 * 数据库脚本卡片组件
 * 用于显示和管理数据库脚本步骤内容，支持SQL编辑和变量提取
 */
const Index: FC<Props> = (props) => {
  const { id, step, caseId, caseContent, callback } = props;
  const { token } = useToken();

  const [contentDBExecuteName, setContentDBExecuteName] = useState<string>();
  const [showDBExecuteTitleInput, setShowDBExecuteTitleInput] = useState(true);
  const [showEditIcon, setShowEditIcon] = useState(false);
  const [showOption, setShowOption] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [currentDBId, setCurrentDBId] = useState<number>();
  const [sqlValue, setSqlValue] = useState<string>();
  const [dbOptions, setDBOptions] = useState<
    { label: string; value: number }[]
  >([]);
  const [dataSource, setDatasource] = useState<IBeforeSQLExtract[]>([]);
  const [editableKeys, setEditableKeys] = useState<React.Key[]>();

  /**
   * 监听 caseContent 变化，初始化内容名称
   * @description 当 caseContent 的 content_name 存在时，设置显示文本模式
   */
  useEffect(() => {
    const { content_name } = caseContent;
    if (content_name) {
      setContentDBExecuteName(content_name);
      setShowDBExecuteTitleInput(false);
    }
  }, [caseContent]);

  /**
   * 展开/折叠处理
   * @description ProCard展开时触发数据加载，确保只有在展开状态且未加载过数据时才加载
   * @param collapsed - 当前折叠状态，false表示展开
   */
  const handleCollapse = useCallback(
    (collapsed: boolean) => {
      if (!collapsed && !hasLoaded) {
        loadData();
        loadDBOptions();
      }
    },
    [hasLoaded],
  );

  /**
   * 加载数据库脚本内容
   * @description 获取指定target_id的数据库脚本信息，包括SQL文本和变量提取配置
   */
  const loadData = useCallback(() => {
    if (!caseContent.target_id) return;
    getDBContentInfo(caseContent.target_id).then(({ code, data }) => {
      if (code === 0 && data) {
        const { db_id, sql_text, sql_extracts } = data;
        setCurrentDBId(db_id);
        setSqlValue(sql_text);
        setDatasource(sql_extracts || []);
        setHasLoaded(true);
      }
    });
  }, [caseContent.target_id]);

  /**
   * 加载数据库配置选项
   * @description 获取所有可用的数据库配置列表，用于下拉选择
   */
  const loadDBOptions = useCallback(() => {
    queryDBConfig().then(({ code, data }) => {
      if (code === 0 && data) {
        setDBOptions(
          data.map((item) => ({
            label: item.db_name,
            value: item.id,
          })),
        );
      }
    });
  }, []);

  /**
   * 鼠标进入事件处理
   * @description 鼠标进入卡片时显示额外操作选项和编辑图标
   */
  const handleMouseEnter = useCallback(() => {
    setShowEditIcon(true);
    setShowOption(true);
  }, []);

  /**
   * 鼠标离开事件处理
   * @description 鼠标离开卡片时隐藏额外操作选项和编辑图标
   */
  const handleMouseLeave = useCallback(() => {
    setShowEditIcon(false);
    setShowOption(false);
  }, []);

  /**
   * 数据库选择变化处理
   * @description 选择数据库后更新状态
   * @param value - 选中的数据库ID
   */
  const handleDBChange = useCallback((value: number) => {
    setCurrentDBId(value);
  }, []);

  /**
   * SQL内容变化处理
   * @description SQL内容变化时更新状态
   * @param value - 新的SQL内容
   */
  const handleSQLChange = useCallback((value: string) => {
    setSqlValue(value);
  }, []);

  /**
   * 变量提取数据变化处理
   * @description 更新变量提取数据源
   * @param data - 新的变量提取数据
   */
  const handleDataChange = useCallback((data: IBeforeSQLExtract[]) => {
    setDatasource(data);
  }, []);

  /**
   * 变量提取编辑keys变化处理
   * @description 更新可编辑行keys
   * @param keys - 新的编辑keys
   */
  const handleEditableKeysChange = useCallback((keys: React.Key[]) => {
    setEditableKeys(keys);
  }, []);

  /**
   * 更新内容标题
   * @description 保存编辑后的内容标题到服务端
   * @param value - 新的标题内容
   */
  const updateContentTitle = useCallback(
    async (value: string | undefined) => {
      if (value) {
        const { code, data } = await updateCaseContent({
          content_id: caseContent.id,
          content_name: value,
        });
        if (code === 0) {
          setContentDBExecuteName(data.content_name);
          setShowDBExecuteTitleInput(false);
        }
      } else {
        setShowDBExecuteTitleInput(true);
      }
    },
    [caseContent.id],
  );

  /**
   * 数据库卡片标题输入组件
   * @description 根据状态渲染文本或输入框，支持点击编辑图标进入编辑模式
   */
  const DBExecuteTitleInput = useMemo(() => {
    if (contentDBExecuteName && !showDBExecuteTitleInput) {
      return (
        <Space size={8} align="center">
          <Text
            strong
            style={{
              fontSize: '15px',
              color: token.colorText,
              letterSpacing: '0.5px',
            }}
          >
            {contentDBExecuteName}
          </Text>
          {showEditIcon && (
            <EditOutlined
              style={{
                color: '#9333ea',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'all 0.2s ease',
                padding: '4px',
                borderRadius: '4px',
              }}
              onClick={(event) => {
                event.stopPropagation();
                setShowDBExecuteTitleInput(true);
              }}
            />
          )}
        </Space>
      );
    }
    return (
      <Input
        style={{
          width: '100%',
          maxWidth: '280px',
          borderRadius: '6px',
        }}
        variant="borderless"
        placeholder="输入脚本名称..."
        onChange={(e) => {
          e.stopPropagation();
          if (e.target.value) setContentDBExecuteName(e.target.value);
        }}
        onClick={(e) => e.stopPropagation()}
        onBlur={() => updateContentTitle(contentDBExecuteName)}
        onPressEnter={() => updateContentTitle(contentDBExecuteName)}
      />
    );
  }, [
    contentDBExecuteName,
    showDBExecuteTitleInput,
    showEditIcon,
    token,
    updateContentTitle,
  ]);

  /**
   * 卡片标题渲染
   * @description 渲染带有数据库标签和步骤信息的卡片标题
   */
  const cardTitle = useMemo(
    () => (
      <Space size={10} align="center">
        <Handler id={id} step={step} />
        <Tag
          icon={<DatabaseOutlined />}
          style={{
            background: 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)',
            color: '#fff',
            border: 'none',
            fontWeight: 600,
            fontSize: '12px',
            padding: '4px 10px',
            borderRadius: '6px',
            boxShadow: '0 2px 8px rgba(147, 51, 234, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          DB Script
        </Tag>
        {DBExecuteTitleInput}
      </Space>
    ),
    [id, step, token, DBExecuteTitleInput],
  );

  return (
    <ProCard
      bodyStyle={{ padding: 0 }}
      split={'horizontal'}
      bordered
      collapsible
      hoverable
      defaultCollapsed
      style={{
        borderRadius: '16px',
        boxShadow: showOption
          ? `0 8px 32px rgba(147, 51, 234, 0.15), 0 2px 8px rgba(0, 0, 0, 0.08)`
          : `0 2px 12px rgba(0, 0, 0, 0.06)`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        border: showOption
          ? `1px solid rgba(147, 51, 234, 0.3)`
          : `1px solid ${token.colorBorderSecondary}`,
        overflow: 'hidden',
      }}
      extra={
        <CardExtraOption
          show={showOption}
          callback={callback}
          caseContent={caseContent}
          caseId={caseId}
        />
      }
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onCollapse={handleCollapse}
      collapsibleIconRender={() => cardTitle}
    >
      <div
        style={{
          background: `linear-gradient(180deg, ${token.colorBgContainer} 0%, ${token.colorBgLayout} 100%)`,
          padding: '20px 24px',
        }}
      >
        <DBEditorCard
          caseContentId={caseContent.target_id!}
          currentDBId={currentDBId}
          sqlValue={sqlValue}
          dbOptions={dbOptions}
          onDBChange={handleDBChange}
          onSQLChange={handleSQLChange}
        />
        <div
          style={{
            border: `1px solid ${token.colorBorderSecondary}`,
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.04)',
            background: token.colorBgContainer,
          }}
        >
          <AceCodeEditor
            value={sqlValue}
            onChange={handleSQLChange}
            height={'28vh'}
            _mode={'mysql'}
          />
        </div>
      </div>
      <Divider
        style={{ margin: '0', borderColor: token.colorBorderSecondary }}
      />
      <div
        style={{
          padding: '20px 24px',
          background: token.colorBgContainer,
        }}
      >
        <DBExtractTable
          caseContentId={caseContent.target_id!}
          dataSource={dataSource}
          editableKeys={editableKeys}
          onDataChange={handleDataChange}
          onEditableKeysChange={handleEditableKeysChange}
        />
      </div>
    </ProCard>
  );
};

export default Index;

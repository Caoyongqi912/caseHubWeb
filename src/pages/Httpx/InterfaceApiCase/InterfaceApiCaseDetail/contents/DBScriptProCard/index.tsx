import { getDBContentInfo, queryDBConfig } from '@/api/base/dbConfig';
import {
  updateCaseContent,
  updateCaseContentDBScript,
} from '@/api/inter/interCase';
import AceCodeEditor from '@/components/CodeEditor/AceCodeEditor';
import Handler from '@/components/DnDDraggable/handler';
import CardExtraOption from '@/pages/Httpx/InterfaceApiCase/InterfaceApiCaseDetail/contents/CardExtraOption';
import DBEditorCard from '@/pages/Httpx/InterfaceApiCase/InterfaceApiCaseDetail/contents/DBScriptProCard/DBEditorCard';
import DBExtractTable from '@/pages/Httpx/InterfaceApiCase/InterfaceApiCaseDetail/contents/DBScriptProCard/DBExtractTable';
import { IBeforeSQLExtract, IInterfaceCaseContent } from '@/pages/Httpx/types';
import { DatabaseOutlined, EditOutlined } from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import {
  Alert,
  Divider,
  Input,
  message,
  Space,
  Tag,
  theme,
  Typography,
} from 'antd';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';

const { Text } = Typography;
const { useToken } = theme;

interface Props {
  id: number;
  step: number;
  caseId: number;
  caseContent: IInterfaceCaseContent;
  callback?: () => void;
}

const Index: FC<Props> = (props) => {
  const { id, step, caseId, caseContent, callback } = props;
  const { token } = useToken();
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const sqlValueRef = useRef<string>('');

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
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>(
    'idle',
  );

  useEffect(() => {
    const { content_name } = caseContent;
    if (content_name) {
      setContentDBExecuteName(content_name);
      setShowDBExecuteTitleInput(false);
    }
  }, [caseContent]);

  const handleCollapse = useCallback(
    (collapsed: boolean) => {
      if (!collapsed && !hasLoaded) {
        const targetId = caseContent.target_id;
        if (!targetId) return;

        getDBContentInfo(targetId).then(({ code, data }) => {
          if (code === 0 && data) {
            const { db_id, sql_text, sql_extracts } = data;
            setCurrentDBId(db_id);
            setSqlValue(sql_text);
            sqlValueRef.current = sql_text || '';
            setDatasource(sql_extracts || []);
            setHasLoaded(true);
          }
        });

        queryDBConfig().then(({ code, data }) => {
          if (code === 0 && data) {
            setDBOptions(
              data.map((item: { db_name: string; id: number }) => ({
                label: item.db_name,
                value: item.id,
              })),
            );
          }
        });
      }
    },
    [hasLoaded, caseContent.target_id],
  );

  const handleDBChange = useCallback((value: number) => {
    setCurrentDBId(value);
  }, []);

  const handleSQLChange = useCallback(
    (value: string) => {
      setSqlValue(value);
      sqlValueRef.current = value;

      clearTimeout(timeoutRef.current);
      if (!currentDBId) {
        message.error('请先选择数据库');
        return;
      }
      if (!value.trim()) {
        return;
      }

      setSaveStatus('saving');
      timeoutRef.current = setTimeout(async () => {
        const { code } = await updateCaseContentDBScript({
          id: caseContent.target_id,
          sql_text: value,
          db_id: currentDBId,
        });
        if (code === 0) {
          setSaveStatus('saved');
          setTimeout(() => setSaveStatus('idle'), 2000);
        } else {
          setSaveStatus('idle');
        }
      }, 3000);
    },
    [caseContent.target_id, currentDBId],
  );

  const getSqlValue = useCallback(() => {
    return sqlValueRef.current;
  }, []);

  const handleDataChange = useCallback((data: IBeforeSQLExtract[]) => {
    setDatasource(data);
  }, []);

  const handleEditableKeysChange = useCallback((keys: React.Key[]) => {
    setEditableKeys(keys);
  }, []);

  const updateContentTitle = useCallback(
    async (value: string | undefined) => {
      if (!value?.trim()) {
        setShowDBExecuteTitleInput(true);
        return;
      }
      const { code, data } = await updateCaseContent({
        content_id: caseContent.id,
        content_name: value,
      });
      if (code === 0) {
        setContentDBExecuteName(data.content_name);
        setShowDBExecuteTitleInput(false);
      }
    },
    [caseContent.id],
  );

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
    [id, step, DBExecuteTitleInput],
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
      onMouseEnter={() => {
        setShowEditIcon(true);
        setShowOption(true);
      }}
      onMouseLeave={() => {
        setShowEditIcon(false);
        setShowOption(false);
      }}
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
          dbId={currentDBId}
          dbOptions={dbOptions}
          onDBChange={handleDBChange}
          getSqlValue={getSqlValue}
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
          {saveStatus === 'saved' && (
            <Alert
              message="脚本已保存"
              type="success"
              showIcon
              style={{ marginBottom: '12px' }}
            />
          )}
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
      <div style={{ padding: '20px 24px', background: token.colorBgContainer }}>
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

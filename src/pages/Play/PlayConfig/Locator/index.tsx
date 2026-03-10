import { pagePlayLocators } from '@/api/play/playCase';
import MyProTable from '@/components/Table/MyProTable';
import { ILocator } from '@/pages/Play/componets/uiTypes';
import { pageData } from '@/utils/somefunc';
import {
  AimOutlined,
  CodeOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { ActionType, ProColumns } from '@ant-design/pro-components';
import { Tag, theme, Typography } from 'antd';
import { useCallback, useMemo, useRef } from 'react';

const { Text, Paragraph } = Typography;

const Index = () => {
  const { token } = theme.useToken();
  const actionRef = useRef<ActionType>();

  const pageLocator = useCallback(async (values: any) => {
    const { code, data } = await pagePlayLocators({ ...values });
    return pageData(code, data);
  }, []);

  const styles = useMemo(
    () => ({
      nameTag: {
        fontSize: 13,
        fontWeight: 500,
        padding: '4px 12px',
        borderRadius: 6,
        backgroundColor: token.colorBgTextActive,
        color: token.colorText,
        border: 'none',
      },
      demoCard: {
        fontFamily: '"SF Mono", "Fira Code", "JetBrains Mono", monospace',
        fontSize: 12,
        padding: '8px 12px',
        borderRadius: 6,
        backgroundColor: token.colorFillAlter,
        color: token.colorTextSecondary,
        border: `1px solid ${token.colorBorderSecondary}`,
        maxWidth: 400,
        overflow: 'auto',
      },
      container: {
        padding: 16,
        backgroundColor: token.colorBgContainer,
        borderRadius: token.borderRadiusLG,
      },
    }),
    [token],
  );

  const columns: ProColumns<ILocator>[] = [
    {
      title: '定位器名称',
      dataIndex: 'getter_name',
      fixed: 'left',
      width: 200,
      render: (_, record) => (
        <Tag style={styles.nameTag}>
          <AimOutlined style={{ marginRight: 6, opacity: 0.6 }} />
          {record.getter_name}
        </Tag>
      ),
    },
    {
      title: '描述',
      dataIndex: 'getter_desc',
      valueType: 'textarea',
      search: false,
      width: 350,
      render: (_, record) => (
        <Paragraph
          ellipsis={{ rows: 2, expandable: true, symbol: '展开' }}
          style={{
            margin: 0,
            color: token.colorTextSecondary,
            fontSize: 13,
          }}
        >
          {record.getter_desc || '-'}
        </Paragraph>
      ),
    },
    {
      title: '演示',
      dataIndex: 'getter_demo',
      valueType: 'jsonCode',
      search: false,
      render: (_, record) => {
        const demo = record.getter_demo;
        if (!demo) return <Text type="secondary">-</Text>;

        let displayContent = demo;
        try {
          const parsed = JSON.parse(demo);
          displayContent = JSON.stringify(parsed, null, 2);
        } catch {
          // Keep original content if not valid JSON
        }

        return (
          <pre style={styles.demoCard}>
            <CodeOutlined style={{ marginRight: 6, opacity: 0.6 }} />
            {displayContent}
          </pre>
        );
      },
    },
  ];

  return (
    <div style={styles.container}>
      <MyProTable
        actionRef={actionRef}
        columns={columns}
        request={pageLocator}
        x={1000}
        rowKey="uid"
        headerTitle={
          <span style={{ fontWeight: 600, fontSize: 15 }}>
            <InfoCircleOutlined
              style={{ marginRight: 8, color: token.colorPrimary }}
            />
            定位器配置
          </span>
        }
      />
    </div>
  );
};

export default Index;

import APIResult from '@/pages/Httpx/InterfaceApiCaseResult/CaseResult/ResultComponents/APIResult';
import { ICaseContentResult } from '@/pages/Httpx/types';
import { CheckCircleTwoTone, CloseCircleTwoTone } from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import { Space, Tag, theme, Tooltip, Typography } from 'antd';
import { FC, useMemo } from 'react';

const { Text } = Typography;
const { useToken } = theme;

interface Props {
  result: ICaseContentResult;
}

const OperatorOption: { [key: number]: string } = {
  0: '等于',
  1: '不等于',
  2: '大于',
  3: '小于',
  4: '大于等于',
  5: '小于等于',
  6: '包含',
  7: '不包含',
};

const ConditionResult: FC<Props> = ({ result }) => {
  const { token } = useToken();
  const { content_condition } = result;

  const styles = useMemo(
    () => ({
      card: {
        borderRadius: token.borderRadiusSM,
        borderLeft: `3px solid ${
          result.result ? token.colorSuccess : token.colorError
        }`,
        marginTop: token.marginXS,
      },
      conditionBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: token.paddingSM,
        padding: `${token.paddingXS}px ${token.paddingSM}px`,
        backgroundColor: content_condition?.result
          ? `${token.colorSuccess}15`
          : `${token.colorWarning}15`,
        borderRadius: token.borderRadiusSM,
        border: `1px solid ${
          content_condition?.result
            ? `${token.colorSuccess}30`
            : `${token.colorWarning}30`
        }`,
      },
      keyText: {
        color: token.colorPrimary,
        fontWeight: 600,
        fontFamily: 'Monaco, Consolas, monospace',
        fontSize: token.fontSizeSM,
      },
      operatorText: {
        color: token.colorText,
        fontWeight: 500,
        fontSize: token.fontSizeSM,
        padding: `0 ${token.paddingXS}px`,
      },
      valueText: {
        color: content_condition?.result
          ? token.colorSuccess
          : token.colorWarning,
        fontWeight: 600,
        fontFamily: 'Monaco, Consolas, monospace',
        fontSize: token.fontSizeSM,
      },
      divider: {
        color: token.colorTextSecondary,
        margin: `0 ${token.paddingXS}px`,
      },
    }),
    [token, result.result, content_condition?.result],
  );

  const renderConditionDisplay = () => {
    if (!content_condition) return null;

    return (
      <div style={styles.conditionBadge}>
        <span style={styles.keyText}>{content_condition.key}</span>
        <span style={styles.operatorText}>
          {OperatorOption[content_condition.operator]}
        </span>
        <span style={styles.valueText}>{content_condition.value}</span>
      </div>
    );
  };

  return (
    <ProCard
      bordered
      style={styles.card}
      title={
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space>
            <Tag color={'green-inverse'}>STEP_{result.content_step}</Tag>
            <Tooltip title={'条件组'}>
              <Tag color={'purple-inverse'}>IF</Tag>
            </Tooltip>
            {result.result ? (
              <CheckCircleTwoTone twoToneColor={token.colorSuccess} />
            ) : (
              <CloseCircleTwoTone twoToneColor={token.colorWarning} />
            )}
          </Space>
          {renderConditionDisplay()}
        </Space>
      }
      collapsibleIconRender={({}) => {
        return null;
      }}
      headerBordered
      collapsible
      defaultCollapsed
      extra={<Text type="secondary">共 {result?.data?.length || 0} 接口</Text>}
    >
      <APIResult result={result} prefix={'IF_STEP'} />
    </ProCard>
  );
};

export default ConditionResult;

import {
  toSelectOptions,
  toValueEnum,
} from '@/pages/CaseHub/hooks/caseEnumOption';
import { useCaseEnumConfig } from '@/pages/CaseHub/hooks/useCaseEnumConfig';
import { useCaseHubTheme } from '@/pages/CaseHub/styles';
import { ITestCase } from '@/pages/CaseHub/types';
import { ProFormSelect } from '@ant-design/pro-components';
import { Tag } from 'antd';
import { FC, useEffect, useMemo, useState } from 'react';

interface Props {
  testcaseData?: ITestCase;
  onTypeChange?: (caseId: number, newType: string) => void;
}

const CaseTypeSelect: FC<Props> = ({ testcaseData, onTypeChange }) => {
  const [typeVisible, setTypeVisible] = useState(true);
  // 用例类型从后端枚举配置拉取（管理员在配置中心增删后自动生效）
  // value 是 string 类型（与 ICaseEnumConfig.value 对齐）
  const [typeValue, setTypeValue] = useState<string>('');
  const { colors } = useCaseHubTheme();

  const { options: typeOptions } = useCaseEnumConfig('CASE_TYPE');
  const typeSelectOptions = useMemo(
    () => toSelectOptions(typeOptions),
    [typeOptions],
  );
  const typeValueEnum = useMemo(() => toValueEnum(typeOptions), [typeOptions]);

  useEffect(() => {
    if (testcaseData?.case_type != null) {
      setTypeValue(String(testcaseData.case_type));
      setTypeVisible(false);
    }
  }, [testcaseData]);

  // 用例类型颜色（默认基于 antd token 派生）
  // 留空 Map 让 Tag 直接走 ICaseEnumConfig.color 派生（后续可接入 useCaseLevelColorMap 类似机制）
  const typeColorMap: Record<
    string,
    { bg: string; border: string; text: string }
  > = {};
  const typeColor = typeColorMap[typeValue] || {
    bg: `${colors.info}12`,
    border: `${colors.info}25`,
    text: colors.info,
  };

  const handleTypeChange = (value: string) => {
    setTypeValue(value);
    setTypeVisible(false);
    if (testcaseData?.id) {
      onTypeChange?.(testcaseData.id, value);
    }
  };

  const handleBlur = () => {
    if (typeValue) {
      setTypeVisible(false);
    }
  };

  return (
    <>
      {typeVisible ? (
        <ProFormSelect
          noStyle
          style={{ borderRadius: 10, minWidth: 70 }}
          allowClear={false}
          onChange={handleTypeChange}
          name="case_type"
          options={typeSelectOptions}
          fieldProps={{
            variant: 'filled',
            style: { minWidth: 70, borderRadius: 10 },
            onBlur: handleBlur,
          }}
        />
      ) : (
        <Tag
          onClick={() => setTypeVisible(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '3px 8px',
            borderRadius: 10,
            background: typeColor.bg,
            color: typeColor.text,
            border: `1px solid ${typeColor.border}`,
            fontSize: 11,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 150ms ease',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.transform = 'scale(1.02)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
          }}
        >
          {typeValueEnum[typeValue]?.text || typeValue || '-'}
        </Tag>
      )}
    </>
  );
};

export default CaseTypeSelect;

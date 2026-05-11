import { CaseHubConfig } from '@/pages/CaseHub/config/constants';
import { useCaseHubTheme } from '@/pages/CaseHub/styles';
import { ITestCase } from '@/pages/CaseHub/types';
import { ProFormSelect } from '@ant-design/pro-components';
import { Tag } from 'antd';
import { FC, useEffect, useState } from 'react';

interface Props {
  testcaseData?: ITestCase;
  onTypeChange?: (caseId: number, newType: number) => void;
}

const CaseTypeSelect: FC<Props> = ({ testcaseData, onTypeChange }) => {
  const [typeVisible, setTypeVisible] = useState(true);
  const [typeValue, setTypeValue] = useState(2);
  const { colors } = useCaseHubTheme();
  const { CASE_TYPE_OPTION, CASE_TYPE_ENUM } = CaseHubConfig;

  useEffect(() => {
    if (testcaseData?.case_type) {
      setTypeValue(testcaseData.case_type);
      setTypeVisible(false);
    }
  }, [testcaseData]);

  const typeColorMap: Record<
    number,
    { bg: string; border: string; text: string }
  > = {
    1: {
      bg: `${colors.warning}12`,
      border: `${colors.warning}25`,
      text: colors.warning,
    },
    2: {
      bg: `${colors.info}12`,
      border: `${colors.info}25`,
      text: colors.info,
    },
  };

  const typeColor = typeColorMap[typeValue] || typeColorMap[2];

  const handleTypeChange = (value: number) => {
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
          initialValue={2}
          options={CASE_TYPE_OPTION}
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
          {CASE_TYPE_ENUM[typeValue]}
        </Tag>
      )}
    </>
  );
};

export default CaseTypeSelect;

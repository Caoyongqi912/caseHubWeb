import { CaseHubConfig } from '@/pages/CaseHub/CaseConfig';
import { useCaseHubTheme } from '@/pages/CaseHub/styles';
import { ITestCase } from '@/pages/CaseHub/type';
import { ProFormSelect } from '@ant-design/pro-components';
import { Tag } from 'antd';
import { FC, useEffect, useState } from 'react';

interface Props {
  testcaseData?: ITestCase;
  onSave?: (field: string, value: number) => void;
}

const CaseTypeSelect: FC<Props> = ({ testcaseData, onSave }) => {
  const [typeVisible, setTypeVisible] = useState(true);
  const [typeValue, setTypeValue] = useState<number>(2);
  const { colors, borderRadius } = useCaseHubTheme();
  const { CASE_TYPE_OPTION, CASE_TYPE_ENUM } = CaseHubConfig;

  useEffect(() => {
    if (testcaseData?.case_type) {
      setTypeValue(testcaseData?.case_type);
      setTypeVisible(false);
    }
  }, [testcaseData]);

  const typeColorMap: Record<
    number,
    { bg: string; border: string; text: string }
  > = {
    1: { bg: '#fff7e6', border: '#ffd591', text: '#fa8c16' },
    2: { bg: '#e6f7ff', border: '#91d5ff', text: '#1890ff' },
  };

  const typeColor = typeColorMap[typeValue] || typeColorMap[2];

  const handleTypeChange = (value: number) => {
    setTypeValue(value);
    setTypeVisible(false);
    onSave?.('case_type', value);
  };

  return (
    <>
      {typeVisible ? (
        <ProFormSelect
          noStyle
          style={{
            borderRadius: borderRadius.md,
            minWidth: 70,
          }}
          onChange={handleTypeChange}
          name={'case_type'}
          initialValue={2}
          options={CASE_TYPE_OPTION}
          fieldProps={{
            variant: 'filled',
            style: { minWidth: 70 },
          }}
        />
      ) : (
        <Tag
          onClick={() => setTypeVisible(true)}
          style={{
            background: typeColor.bg,
            borderColor: typeColor.border,
            color: typeColor.text,
            borderRadius: borderRadius.md,
            fontWeight: 500,
            cursor: 'pointer',
            padding: '2px 10px',
            margin: 0,
            transition: `all ${colors.primary}`,
          }}
        >
          {CASE_TYPE_ENUM[typeValue]}
        </Tag>
      )}
    </>
  );
};

export default CaseTypeSelect;

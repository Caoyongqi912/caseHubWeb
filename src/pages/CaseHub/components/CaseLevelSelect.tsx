import { CaseHubConfig } from '@/pages/CaseHub/config/constants';
import { caseLevelColors } from '@/pages/CaseHub/styles';
import { ITestCase } from '@/pages/CaseHub/types';
import { ProFormSelect } from '@ant-design/pro-components';
import { Tag } from 'antd';
import { FC, useEffect, useState } from 'react';

interface Props {
  testcaseData?: ITestCase;
  onLevelChange?: (caseId: number, newLevel: string) => void;
}

const CaseLevelSelect: FC<Props> = ({ testcaseData, onLevelChange }) => {
  const [levelVisible, setLevelVisible] = useState(true);
  const [level, setLevel] = useState('P2');
  const { CASE_LEVEL_OPTION } = CaseHubConfig;

  useEffect(() => {
    if (testcaseData?.case_level) {
      setLevel(testcaseData.case_level);
      setLevelVisible(false);
    }
  }, [testcaseData]);

  const levelColor =
    caseLevelColors[level as keyof typeof caseLevelColors] ||
    caseLevelColors.P2;

  const handleLevelChange = (value: string) => {
    setLevel(value);
    setLevelVisible(false);
    if (testcaseData?.id) {
      onLevelChange?.(testcaseData.id, value);
    }
  };

  const handleBlur = () => {
    if (level) {
      setLevelVisible(false);
    }
  };

  return (
    <>
      {levelVisible ? (
        <ProFormSelect
          noStyle
          allowClear={false}
          style={{ borderRadius: 10, minWidth: 70 }}
          name="case_level"
          onChange={handleLevelChange}
          initialValue="P2"
          options={CASE_LEVEL_OPTION}
          fieldProps={{
            variant: 'filled',
            style: { minWidth: 70, borderRadius: 10 },
            onBlur: handleBlur,
          }}
        />
      ) : (
        <Tag
          onClick={() => setLevelVisible(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '3px 8px',
            borderRadius: 10,
            background: levelColor.bg,
            color: levelColor.text,
            border: `1px solid ${levelColor.border}`,
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
          {level}
        </Tag>
      )}
    </>
  );
};

export default CaseLevelSelect;

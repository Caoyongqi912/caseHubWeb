import { CaseHubConfig } from '@/pages/CaseHub/config/constants';
import { caseLevelColors, useCaseHubTheme } from '@/pages/CaseHub/styles';
import { ITestCase } from '@/pages/CaseHub/types';
import { ProFormSelect } from '@ant-design/pro-components';
import { Tag } from 'antd';
import { FC, useEffect, useState } from 'react';

interface Props {
  testcaseData?: ITestCase;
  onSave?: (field: string, value: string) => void;
  onLevelChange?: (caseId: number, newLevel: string) => void;
}

const CaseLevelSelect: FC<Props> = ({
  testcaseData,
  onSave,
  onLevelChange,
}) => {
  const [levelVisible, setLevelVisible] = useState(true);
  const [level, setLevel] = useState<string>('P2');
  const { colors, borderRadius } = useCaseHubTheme();
  const { CASE_LEVEL_OPTION } = CaseHubConfig;

  useEffect(() => {
    if (testcaseData) {
      if (testcaseData.case_level) {
        setLevel(testcaseData.case_level);
        setLevelVisible(false);
      }
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
    } else {
      onSave?.('case_level', value);
    }
  };

  return (
    <>
      {levelVisible ? (
        <ProFormSelect
          noStyle
          style={{
            borderRadius: borderRadius.md,
            minWidth: 80,
          }}
          name="case_level"
          required
          onChange={handleLevelChange}
          initialValue={'P2'}
          options={CASE_LEVEL_OPTION}
          fieldProps={{
            variant: 'filled',
            style: { minWidth: 80 },
          }}
        />
      ) : (
        <Tag
          onClick={() => setLevelVisible(true)}
          style={{
            background: levelColor.bg,
            borderColor: levelColor.border,
            color: levelColor.text,
            borderRadius: borderRadius.md,
            fontWeight: 500,
            cursor: 'pointer',
            padding: '2px 10px',
            margin: 0,
            transition: `all ${colors.primary}`,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.opacity = '0.8';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.opacity = '1';
          }}
        >
          {level}
        </Tag>
      )}
    </>
  );
};

export default CaseLevelSelect;

import { toSelectOptions } from '@/pages/CaseHub/hooks/caseEnumOption';
import { useCaseEnumConfig } from '@/pages/CaseHub/hooks/useCaseEnumConfig';
import { useCaseLevelColorMap } from '@/pages/CaseHub/hooks/useCaseLevelColor';

import { ITestCase } from '@/pages/CaseHub/types';
import { ProFormSelect } from '@ant-design/pro-components';
import { Tag } from 'antd';
import { FC, useEffect, useMemo, useState } from 'react';

interface Props {
  testcaseData?: ITestCase;
  onLevelChange?: (caseId: number, newLevel: string) => void;
}

const CaseLevelSelect: FC<Props> = ({ testcaseData, onLevelChange }) => {
  const [levelVisible, setLevelVisible] = useState(true);
  const [level, setLevel] = useState('P2');

  // 用例等级从后端枚举配置拉取（管理员在配置中心增删后自动生效）
  const { options: levelOptions } = useCaseEnumConfig('CASE_LEVEL');
  const levelSelectOptions = useMemo(
    () => toSelectOptions(levelOptions),
    [levelOptions],
  );
  // 用例等级颜色（按 levelValue 索引，用于 Tag / 徽标等）
  const levelColorMap = useCaseLevelColorMap();

  useEffect(() => {
    if (testcaseData?.case_level) {
      setLevel(testcaseData.case_level);
      setLevelVisible(false);
    }
  }, [testcaseData]);

  const levelColor = levelColorMap.get(level) || levelColorMap.get('P2')!;

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
          options={levelSelectOptions}
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

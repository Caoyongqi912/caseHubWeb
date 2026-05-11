import { useCaseHubTheme } from '@/pages/CaseHub/styles';
import { ITestCase } from '@/pages/CaseHub/types';
import { PlusOutlined } from '@ant-design/icons';
import { ProFormSelect } from '@ant-design/pro-components';
import { Button, Divider, Input, InputRef, Space, Tag } from 'antd';
import React, { FC, useEffect, useRef, useState } from 'react';

interface Props {
  tags?: { label: string; value: string }[];
  setTags: React.Dispatch<
    React.SetStateAction<{ label: string; value: string }[]>
  >;
  testcaseData?: ITestCase;
  onTagChange?: (caseId: number, newTag: string) => void;
}

const CaseTagSelect: FC<Props> = ({
  tags,
  setTags,
  testcaseData,
  onTagChange,
}) => {
  const inputRef = useRef<InputRef>(null);
  const [currentTag, setCurrentTag] = useState('');
  const [tagVisible, setTagVisible] = useState(false);
  const [tagValue, setTagValue] = useState('');
  const { colors, spacing, borderRadius } = useCaseHubTheme();

  useEffect(() => {
    if (testcaseData?.case_tag) {
      setTagVisible(true);
      setTagValue(testcaseData.case_tag);
    }
  }, [testcaseData]);

  const handleAddTag = () => {
    if (currentTag.trim()) {
      setTags((prev) => [...prev, { label: currentTag, value: currentTag }]);
      setCurrentTag('');
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  const handleTagChange = (value: string) => {
    setTagValue(value);
    setTagVisible(true);
    if (testcaseData?.id) {
      onTagChange?.(testcaseData.id, value);
    }
  };

  const handleBlur = () => {
    if (tagValue) {
      setTagVisible(true);
    }
  };

  return (
    <>
      {tagVisible ? (
        <Tag
          onClick={() => setTagVisible(false)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: '3px 8px',
            borderRadius: 10,
            background: `${colors.info}12`,
            color: colors.info,
            fontSize: 11,
            fontWeight: 600,
            border: `1px solid ${colors.info}25`,
            cursor: 'pointer',
            transition: 'all 150ms ease',
            maxWidth: 100,
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
          }}
        >
          {tagValue?.length > 10 ? `${tagValue.slice(0, 10)}...` : tagValue}
        </Tag>
      ) : (
        <ProFormSelect
          noStyle
          allowClear={false}
          width="sm"
          name="case_tag"
          options={tags}
          fieldProps={{
            variant: 'filled',
            onBlur: handleBlur,
            dropdownRender: (menu) => (
              <>
                {menu}
                <Divider style={{ margin: `${spacing.sm}px 0` }} />
                <Space style={{ padding: `0 ${spacing.sm}px ${spacing.xs}px` }}>
                  <Input
                    placeholder="自定义标签"
                    ref={inputRef}
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                    style={{ borderRadius: borderRadius.md }}
                  />
                  <Button
                    type="text"
                    icon={<PlusOutlined style={{ color: colors.primary }} />}
                    onClick={handleAddTag}
                  >
                    添加
                  </Button>
                </Space>
              </>
            ),
            onChange: handleTagChange,
          }}
        />
      )}
    </>
  );
};

export default CaseTagSelect;

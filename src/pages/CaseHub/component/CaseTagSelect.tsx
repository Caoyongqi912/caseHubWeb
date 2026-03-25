import { useCaseHubTheme } from '@/pages/CaseHub/styles';
import { ITestCase } from '@/pages/CaseHub/type';
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
  onSave?: (field: string, value: string) => void;
}

const CaseTagSelect: FC<Props> = ({ tags, setTags, testcaseData, onSave }) => {
  const inputRef = useRef<InputRef>(null);
  const [currentTag, setCurrentTag] = useState<string>();
  const [tagVisible, setTagVisible] = useState<boolean>(false);
  const [tagValue, setTagValue] = useState<string>();
  const { colors, spacing, borderRadius } = useCaseHubTheme();

  useEffect(() => {
    if (testcaseData?.case_tag) {
      setTagVisible(true);
      setTagValue(testcaseData.case_tag);
    }
  }, [testcaseData]);

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (currentTag && currentTag.trim()) {
        setTags((t) => [...t, { label: currentTag, value: currentTag }]);
        setCurrentTag('');
      }
    }
  };

  const handleAddTag = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (currentTag && currentTag.trim()) {
      setTags((t) => [...t, { label: currentTag, value: currentTag }]);
      setCurrentTag('');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  };

  const handleTagChange = (value: string) => {
    setTagValue(value);
    setTagVisible(true);
    onSave?.('case_tag', value);
  };

  return (
    <>
      {tagVisible ? (
        <Tag
          onClick={() => setTagVisible(false)}
          style={{
            background: colors.infoBg,
            borderColor: colors.info,
            color: colors.info,
            textOverflow: 'ellipsis',
            textAlign: 'center',
            borderRadius: borderRadius.md,
            fontWeight: 500,
            cursor: 'pointer',
            padding: '2px 10px',
            margin: 0,
            maxWidth: 100,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
          }}
        >
          {tagValue && tagValue.length > 10
            ? `${tagValue.slice(0, 10)}...`
            : tagValue}
        </Tag>
      ) : (
        <ProFormSelect
          noStyle
          required
          rules={[{ required: true, message: '请选择标签' }]}
          allowClear
          width={'sm'}
          name={'case_tag'}
          options={tags}
          fieldProps={{
            variant: 'filled',
            dropdownRender: (menu) => (
              <>
                {menu}
                <Divider style={{ margin: `${spacing.sm}px 0` }} />
                <Space style={{ padding: `0 ${spacing.sm}px ${spacing.xs}px` }}>
                  <Input
                    placeholder="自定义标签"
                    ref={inputRef}
                    value={currentTag}
                    onChange={(e) => {
                      setCurrentTag(e.target.value);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={handleInputKeyDown}
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

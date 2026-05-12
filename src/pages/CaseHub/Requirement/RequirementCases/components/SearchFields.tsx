import { CaseHubConfig } from '@/pages/CaseHub/config/constants';
import { useCaseHubTheme } from '@/pages/CaseHub/styles';
import { CaseSearchForm } from '@/pages/CaseHub/types';
import { SearchOutlined } from '@ant-design/icons';
import {
  ProForm,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { Button, Form, Space } from 'antd';
import { FC, useCallback } from 'react';

interface SearchFieldsProps {
  tags: { label: string; value: string }[];
  onSearch: (values: CaseSearchForm) => void;
  onReset: () => void;
}

const SearchFields: FC<SearchFieldsProps> = ({ tags, onSearch, onReset }) => {
  const [form] = Form.useForm();
  const { CASE_LEVEL_OPTION, CASE_TYPE_OPTION } = CaseHubConfig;
  const { colors, borderRadius } = useCaseHubTheme();

  const handleSearch = useCallback(() => {
    const values = form.getFieldsValue();
    onSearch(values || {});
  }, [form, onSearch]);

  const handleReset = useCallback(() => {
    form.resetFields();
    onReset();
  }, [form, onReset]);

  return (
    <ProForm form={form} submitter={false} layout="inline" style={{ flex: 1 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap' as const,
        }}
      >
        <ProFormText
          width="sm"
          name="case_name"
          placeholder="搜索用例名称..."
          fieldProps={{
            allowClear: true,
            prefix: <SearchOutlined style={{ color: colors.primary }} />,
            variant: 'filled',
            style: { borderRadius: borderRadius.md },
          }}
        />
        <ProFormSelect
          width="sm"
          name="case_tag"
          placeholder="选择标签"
          mode="single"
          allowClear
          options={tags}
          fieldProps={{
            variant: 'filled',
            style: { borderRadius: borderRadius.md },
          }}
        />
        <ProFormSelect
          width="sm"
          name="case_level"
          placeholder="选择等级"
          mode="single"
          allowClear
          options={CASE_LEVEL_OPTION}
          fieldProps={{
            variant: 'filled',
            style: { borderRadius: borderRadius.md },
          }}
        />
        <ProFormSelect
          width="sm"
          name="is_review"
          placeholder="是否评审"
          mode="single"
          allowClear
          options={[
            { label: '已评审', value: true },
            { label: '未评审', value: false },
          ]}
          fieldProps={{
            variant: 'filled',
            style: { borderRadius: borderRadius.md },
          }}
        />
        <ProFormSelect
          width="sm"
          name="is_common"
          placeholder="是否公共用例"
          mode="single"
          allowClear
          options={[
            { label: '公共', value: true },
            { label: '私有', value: false },
          ]}
          fieldProps={{
            variant: 'filled',
            style: { borderRadius: borderRadius.md },
          }}
        />
        <ProFormSelect
          width="sm"
          name="case_type"
          placeholder="选择类型"
          mode="single"
          allowClear
          options={CASE_TYPE_OPTION}
          fieldProps={{
            variant: 'filled',
            style: { borderRadius: borderRadius.md },
          }}
        />
        <Space>
          <Button
            type="primary"
            onClick={handleSearch}
            style={{ borderRadius: borderRadius.md, fontWeight: 500 }}
            icon={<SearchOutlined />}
          >
            搜索
          </Button>
          <Button
            onClick={handleReset}
            style={{ borderRadius: borderRadius.md }}
          >
            重置
          </Button>
        </Space>
      </div>
    </ProForm>
  );
};

export default SearchFields;

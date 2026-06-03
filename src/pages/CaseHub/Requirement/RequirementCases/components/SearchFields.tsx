/**
 * 用例搜索字段组件
 * 支持按名称、标签、等级、类型、评审状态、公共属性筛选
 */
import { toSelectOptions } from '@/pages/CaseHub/hooks/caseEnumOption';
import { useCaseEnumConfig } from '@/pages/CaseHub/hooks/useCaseEnumConfig';
import { useCaseHubTheme } from '@/pages/CaseHub/styles';
import { CaseSearchForm } from '@/pages/CaseHub/types';
import { SearchOutlined } from '@ant-design/icons';
import {
  ProForm,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { Button, Form, Space } from 'antd';
import { FC, useCallback, useMemo } from 'react';

/**
 * SearchFields 组件属性
 */
interface SearchFieldsProps {
  /** 标签选项列表 */
  tags: { label: string; value: string }[];
  /** 搜索回调 */
  onSearch: (values: CaseSearchForm) => void;
  /** 重置回调 */
  onReset: () => void;
}

/**
 * 用例搜索字段组件
 * 支持按名称、标签、等级、类型、评审状态、公共属性筛选
 * @param props - 组件属性
 */
const SearchFields: FC<SearchFieldsProps> = ({ tags, onSearch, onReset }) => {
  // 用例类型从后端枚举配置拉取（管理员在配置中心增删后自动生效）
  const { options: typeOptions } = useCaseEnumConfig('CASE_TYPE');
  const typeSelectOptions = useMemo(
    () => toSelectOptions(typeOptions),
    [typeOptions],
  );

  const [form] = Form.useForm();

  // 用例等级从后端枚举配置拉取（管理员在配置中心增删后自动生效）
  const { options: levelOptions } = useCaseEnumConfig('CASE_LEVEL');
  const levelSelectOptions = useMemo(
    () => toSelectOptions(levelOptions),
    [levelOptions],
  );

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
          options={levelSelectOptions}
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
          options={typeSelectOptions}
          fieldProps={{
            variant: 'filled',
            style: { borderRadius: borderRadius.md },
          }}
        />
        <ProFormSelect
          width="sm"
          name="creator_list"
          placeholder="选择创建人"
          mode="multiple"
          allowClear
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

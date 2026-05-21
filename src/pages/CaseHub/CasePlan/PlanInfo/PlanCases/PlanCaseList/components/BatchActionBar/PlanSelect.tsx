import { queryCasePlan } from '@/api/case/caseplan';
import { ICasePlan } from '@/pages/CaseHub/types';
import { Select, Spin } from 'antd';
import debounce from 'lodash/debounce';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';

export interface PlanSelectProps {
  value?: number;
  onChange?: (planId: number | undefined, planInfo?: ICasePlan) => void;
  excludePlanId?: number;
  placeholder?: string;
}

interface PlanOption {
  label: string;
  value: number;
}

/**
 * 测试计划选择组件
 * 支持防抖搜索，自动过滤当前计划
 */
const PlanSelect: FC<PlanSelectProps> = ({
  value,
  onChange,
  excludePlanId,
  placeholder = '搜索测试计划...',
}) => {
  const [fetching, setFetching] = useState(false);
  const [options, setOptions] = useState<PlanOption[]>([]);
  const lastFetchId = useRef<number>(0);

  /**
   * 搜索测试计划（带竞态保护）
   * 使用 lastFetchId 丢弃过期请求结果
   */
  const handleSearch = useCallback(
    async (planName: string) => {
      lastFetchId.current += 1;
      const fetchId = lastFetchId.current;
      setFetching(true);

      await queryCasePlan(planName)
        .then(({ code, data }) => {
          if (fetchId !== lastFetchId.current) return;

          if (code === 0 && data) {
            const newOptions: PlanOption[] = data.map((plan) => ({
              label: plan.plan_name,
              value: plan.id,
            }));
            setOptions(newOptions);
          } else {
            setOptions([]);
          }
        })
        .catch(() => setOptions([]))
        .finally(() => {
          if (fetchId === lastFetchId.current) setFetching(false);
        });
    },
    [excludePlanId],
  );

  const debounceSearch = useMemo(
    () => debounce(handleSearch, 500),
    [handleSearch],
  );

  useEffect(() => {
    return () => debounceSearch.cancel();
  }, [debounceSearch]);

  const handleChange = useCallback(
    (newValue: number) => onChange?.(newValue),
    [onChange],
  );

  return (
    <Select
      showSearch
      allowClear
      value={value}
      onChange={handleChange}
      onSearch={debounceSearch}
      placeholder={placeholder}
      notFoundContent={fetching ? <Spin size="small" /> : '暂无结果'}
      filterOption={false}
      style={{ width: '100%' }}
      options={options}
    />
  );
};

export default PlanSelect;

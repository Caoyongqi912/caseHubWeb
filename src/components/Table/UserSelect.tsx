import { searchUser } from '@/api/base';
import { Avatar, Select, Spin } from 'antd';
import debounce from 'lodash/debounce';
import { FC, useCallback, useMemo, useRef, useState } from 'react';

export interface UserSelectProps {
  multiple?: boolean;
  value?: { label: string; value: number } | { label: string; value: number }[];
  variant?: 'filled' | 'outlined' | 'borderless' | 'underlined' | undefined;

  onChange?: (
    value:
      | { label: string; value: number }
      | { label: string; value: number }[],
  ) => void;
}

interface UserOption {
  label: string;
  value: number;
  avatar?: string;
}

const UserSelect: FC<UserSelectProps> = ({
  multiple = false,
  value,
  variant = 'outlined',
  onChange,
}) => {
  const [fetching, setFetching] = useState(false);
  const [options, setOptions] = useState<UserOption[]>([]);
  const fetchRef = useRef(0);

  const debounceFetcher = useMemo(() => {
    const loadOptions = (username: string) => {
      fetchRef.current += 1;
      const fetchId = fetchRef.current;
      setOptions([]);
      setFetching(true);

      searchUser({ username }).then((res) => {
        if (fetchId !== fetchRef.current) {
          return;
        }

        if (res.code === 0) {
          const newOptions: UserOption[] = res.data.map((item) => ({
            label: item.username,
            value: item.id,
            avatar: item.avatar,
          }));
          setOptions(newOptions);
        }
        setFetching(false);
      });
    };

    return debounce(loadOptions, 300);
  }, []);

  const handleChange = useCallback(
    (
      newValue:
        | { label: string; value: number }
        | { label: string; value: number }[],
    ) => {
      onChange?.(newValue);
    },
    [onChange],
  );

  return (
    <Select
      showSearch={{
        filterOption: false,
        onSearch: (val) => debounceFetcher(val),
      }}
      variant={variant}
      mode={multiple ? 'multiple' : undefined}
      value={value}
      onChange={handleChange}
      placeholder="搜索用户..."
      notFoundContent={fetching ? <Spin size="small" /> : '暂无结果'}
      allowClear
      style={{ width: '100%' }}
      options={options}
      optionRender={(option) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {option.data?.avatar && (
            <Avatar src={option.data.avatar} style={{ marginRight: 8 }} />
          )}
          {option.label}
        </div>
      )}
    />
  );
};

export default UserSelect;

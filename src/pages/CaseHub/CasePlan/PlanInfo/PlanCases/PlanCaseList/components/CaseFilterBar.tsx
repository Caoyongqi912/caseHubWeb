import { useCaseHubTheme } from '@/pages/CaseHub/styles';
import {
  DownOutlined,
  EllipsisOutlined,
  FilterOutlined,
  LoadingOutlined,
  ReloadOutlined,
  SearchOutlined,
  UpOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Button, Dropdown, Input, Popover, Select, Space, Tag } from 'antd';
import debounce from 'lodash/debounce';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';

/**
 * 筛选值类型定义
 * @param keyword - 搜索关键字
 * @param caseStatus - 用例状态筛选（0: 待执行, 1: 通过, 2: 失败）
 * @param isReview - 评审状态筛选（true: 已评审, false: 未评审）
 */
export interface CaseFilterValues {
  keyword?: string;
  caseStatus?: number;
  isReview?: boolean;
}

interface CaseFilterBarProps {
  /** 筛选条件变化回调 */
  onFilterChange?: (filters: CaseFilterValues) => void;
  /** 刷新列表回调 */
  onRefresh?: () => void;
  /** 全部展开回调 */
  onExpandAll?: () => void;
  /** 全部收起回调 */
  onCollapseAll?: () => void;
  /** 批量导出回调 */
  onBatchExport?: () => void;
  /** 批量导入回调 */
  onBatchImport?: () => void;
  /** 当前是否有激活的筛选条件（由父组件管理） */
  hasActiveFilter?: boolean;
  /** 当前生效的筛选条件（用于回显） */
  filters?: CaseFilterValues;
  /** 当前筛选后的用例数量 */
  resultCount?: number;
}

const FILTER_LABEL_STYLE: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 500,
};

const CaseFilterBar: FC<CaseFilterBarProps> = ({
  onFilterChange,
  onRefresh,
  onExpandAll,
  onCollapseAll,
  onBatchExport,
  onBatchImport,
  hasActiveFilter = false,
  filters,
  resultCount,
}) => {
  const { colors, spacing, borderRadius, animations } = useCaseHubTheme();
  const [keyword, setKeyword] = useState(filters?.keyword || '');
  const [filterOpen, setFilterOpen] = useState(false);
  const [tempStatus, setTempStatus] = useState<number | undefined>();
  const [tempReview, setTempReview] = useState<boolean | undefined>();
  const [isSearching, setIsSearching] = useState(false);

  const dropdownItems: MenuProps['items'] = [
    { key: 'export', label: '批量导出', onClick: onBatchExport },
    { key: 'import', label: '批量导入', onClick: onBatchImport },
  ];

  /**
   * 防抖搜索回调
   * 使用 useMemo 保持 debounce 实例稳定，避免每次渲染重新创建
   * 延迟 500ms 后触发搜索，减少不必要的过滤操作
   */
  const debouncedSearch = useMemo(
    () =>
      debounce((searchValue: string, status?: number, review?: boolean) => {
        setIsSearching(true);
        onFilterChange?.({
          keyword: searchValue,
          caseStatus: status,
          isReview: review,
        });
        setTimeout(() => setIsSearching(false), 300);
      }, 500),
    [onFilterChange],
  );

  /** 组件卸载时取消防抖调用 */
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  /**
   * 同步外部 filters.keyword 到本地 keyword 状态
   * 解决外部筛选条件变化时输入框值被清空的问题
   * 仅在 filters.keyword 与本地 keyword 不同且本地无输入时才同步
   */
  useEffect(() => {
    if (filters?.keyword !== undefined && filters.keyword !== keyword) {
      setKeyword(filters.keyword || '');
    }
  }, [filters?.keyword]);

  /** 当弹窗打开时，用当前生效的筛选条件初始化临时状态 */
  useEffect(() => {
    if (filterOpen) {
      setTempStatus(filters?.caseStatus);
      setTempReview(filters?.isReview);
    }
  }, [filterOpen, filters]);

  /**
   * 处理搜索输入
   * 1. 立即更新本地 keyword 状态以实现实时渲染输入内容
   * 2. 防抖触发 onFilterChange 回调进行实际过滤
   */
  const handleSearch = useCallback(
    (value: string) => {
      setKeyword(value);
      debouncedSearch(value, tempStatus, tempReview);
    },
    [debouncedSearch, tempStatus, tempReview],
  );

  /** 清空搜索关键字 */
  const handleClearKeyword = useCallback(() => {
    setKeyword('');
    debouncedSearch('', tempStatus, tempReview);
  }, [debouncedSearch, tempStatus, tempReview]);

  /** 立即触发搜索（回车时调用，清除防抖延迟） */
  const handleImmediateSearch = useCallback(() => {
    debouncedSearch.cancel();
    setIsSearching(true);
    onFilterChange?.({
      keyword,
      caseStatus: tempStatus,
      isReview: tempReview,
    });
    setTimeout(() => setIsSearching(false), 300);
  }, [keyword, tempStatus, tempReview, onFilterChange, debouncedSearch]);

  /** 应用筛选条件并关闭弹窗 */
  const handleApplyFilter = useCallback(() => {
    setFilterOpen(false);
    onFilterChange?.({
      keyword,
      caseStatus: tempStatus,
      isReview: tempReview,
    });
  }, [keyword, tempStatus, tempReview, onFilterChange]);

  /** 重置所有筛选条件（不包括搜索关键字） */
  const handleResetFilter = useCallback(() => {
    setTempStatus(undefined);
    setTempReview(undefined);
    onFilterChange?.({ keyword });
  }, [keyword, onFilterChange]);

  return (
    <Space size={spacing.sm}>
      <Button icon={<DownOutlined />} onClick={onExpandAll} title="全部展开" />
      <Button icon={<UpOutlined />} onClick={onCollapseAll} title="全部收起" />
      <Button icon={<ReloadOutlined />} onClick={onRefresh} />
      <Input
        placeholder="搜索用例名称"
        prefix={
          isSearching ? (
            <LoadingOutlined style={{ color: colors.primary }} spin />
          ) : (
            <SearchOutlined style={{ color: colors.textTertiary }} />
          )
        }
        suffix={
          keyword ? (
            <span
              style={{
                fontSize: 12,
                color: isSearching ? colors.primary : colors.textTertiary,
                transition: `color ${animations.fast} ${animations.easeInOut}`,
              }}
            >
              {isSearching ? '搜索中...' : `约 ${resultCount ?? 0} 条结果`}
            </span>
          ) : null
        }
        allowClear
        value={keyword}
        onChange={(e) => handleSearch(e.target.value)}
        onPressEnter={handleImmediateSearch}
        onClear={handleClearKeyword}
        style={{
          width: 200,
          transition: `border-color ${animations.fast} ${animations.easeInOut}`,
          borderColor: isSearching ? colors.primary : undefined,
        }}
      />

      <Popover
        content={
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: spacing.md,
              minWidth: 220,
              padding: `${spacing.xs}px 0`,
            }}
          >
            <div>
              <div
                style={{
                  ...FILTER_LABEL_STYLE,
                  ...{ color: colors.textTertiary },
                }}
              >
                执行状态
              </div>
              <Select
                allowClear
                placeholder="选择状态"
                value={tempStatus}
                onChange={setTempStatus}
                style={{ width: '100%' }}
                options={[
                  { value: 0, label: '待执行' },
                  { value: 1, label: '通过' },
                  { value: 2, label: '失败' },
                ]}
              />
            </div>
            <div>
              <div
                style={{
                  ...FILTER_LABEL_STYLE,
                  ...{ color: colors.textTertiary },
                }}
              >
                评审状态
              </div>
              <Select
                allowClear
                placeholder="选择评审状态"
                value={tempReview}
                onChange={setTempReview}
                style={{ width: '100%' }}
                options={[
                  { value: true, label: '已评审' },
                  { value: false, label: '未评审' },
                ]}
              />
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: spacing.sm,
                paddingTop: spacing.sm,
                borderTop: `1px solid ${colors.border}`,
              }}
            >
              <Button size="small" onClick={handleResetFilter}>
                重置
              </Button>
              <Button size="small" type="primary" onClick={handleApplyFilter}>
                确定
              </Button>
            </div>
          </div>
        }
        trigger="click"
        open={filterOpen}
        onOpenChange={setFilterOpen}
        placement="bottomRight"
      >
        <Button
          icon={<FilterOutlined />}
          style={{
            borderColor: hasActiveFilter ? colors.primary : undefined,
            color: hasActiveFilter ? colors.primary : undefined,
          }}
        >
          筛选
          {hasActiveFilter && (
            <Tag
              style={{
                marginLeft: 4,
                padding: '0 4px',
                fontSize: 10,
                lineHeight: '16px',
                background: colors.primaryBg,
                color: colors.primary,
                border: 'none',
                borderRadius: borderRadius.round,
              }}
            >
              激活
            </Tag>
          )}
        </Button>
      </Popover>

      <Dropdown menu={{ items: dropdownItems }} trigger={['click']}>
        <EllipsisOutlined
          style={{
            fontSize: 18,
            cursor: 'pointer',
            color: colors.textSecondary,
            padding: `${spacing.xs}px`,
            borderRadius: borderRadius.sm,
            transition: `all ${animations.fast} ${animations.easeInOut}`,
          }}
        />
      </Dropdown>
    </Space>
  );
};

export default CaseFilterBar;

/**
 * @file PlanCaseList/components/CaseFilterBar.tsx
 * @description 用例列表筛选条
 * 视觉设计：搜索条 + 工具按钮 + Popover（按分组卡片化）+ 激活条件 Chip 横向展示
 * 扩展友好：新增筛选项只需
 *   1) CaseFilterValues 加字段
 *   2) useCaseFilter 加过滤逻辑
 *   3) 本文件加一个 FilterGroup + activeChips 条目
 */

import UserSelect from '@/components/Table/UserSelect';
import { useCaseHubTheme } from '@/pages/CaseHub/styles';
import {
  EllipsisOutlined,
  FilterOutlined,
  LoadingOutlined,
  ReloadOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Button, Dropdown, Input, Popover, Select, Space } from 'antd';
import debounce from 'lodash/debounce';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  CaseFilterValues,
  CreatorFilterItem,
} from '../hooks/useCaseFilter';

interface CaseFilterBarProps {
  /** 筛选条件变化回调 */
  onFilterChange?: (filters: CaseFilterValues) => void;
  /** 刷新列表回调 */
  onRefresh?: () => void;
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

/**
 * 执行状态筛选选项
 * 一轮 / 二轮共用同一份枚举，值与 CASE_STATUS_CONFIG.code 对齐
 * 0=未开始 / 1=通过 / 2=失败（3=阻塞 / 4=跳过不在筛选范围内，避免筛选项过载）
 */
const STATUS_OPTIONS: { value: number; label: string }[] = [
  { value: 0, label: '待执行' },
  { value: 1, label: '通过' },
  { value: 2, label: '失败' },
];

/** 评审状态筛选选项 */
const REVIEW_OPTIONS: { value: boolean; label: string }[] = [
  { value: true, label: '已评审' },
  { value: false, label: '未评审' },
];

/**
 * 主题 token 透传给小组件，避免在小组件内重复 useCaseHubTheme
 * 保留具体子集的类型安全（避免 any 滥用）
 */
type ThemeColors = ReturnType<typeof useCaseHubTheme>['colors'];
type ThemeSpacing = ReturnType<typeof useCaseHubTheme>['spacing'];

interface FilterFieldLabelProps {
  children: React.ReactNode;
  colors: ThemeColors;
}

/** 字段小标签：用于 Popover 内每个筛选项的标题 */
const FilterFieldLabel: React.FC<FilterFieldLabelProps> = ({
  children,
  colors,
}) => (
  <div
    style={{
      fontSize: 12,
      color: colors.textSecondary,
      marginBottom: 4,
    }}
  >
    {children}
  </div>
);

interface FilterGroupProps {
  title: string;
  children: React.ReactNode;
  colors: ThemeColors;
  spacing: ThemeSpacing;
}

/**
 * 筛选条件分组卡片
 * 灰底细边框 + uppercase 标题，视觉上明确划分"执行状态 / 评审 / 创建人"
 * 后续扩展只需新增一个 <FilterGroup> 节点
 */
const FilterGroup: React.FC<FilterGroupProps> = ({
  title,
  children,
  colors,
  spacing,
}) => (
  <div
    style={{
      // 使用 bgLayout 作为次级容器底色（语义对应"次级背景"）
      // 原 colors.backgroundSecondary 字段在 useCaseHubTheme 中不存在，会触发 TS 警告
      background: colors.bgLayout,
      border: `1px solid ${colors.border}`,
      borderRadius: 6,
      padding: `${spacing.sm}px ${spacing.md}px`,
    }}
  >
    <div
      style={{
        fontSize: 11,
        fontWeight: 600,
        color: colors.textTertiary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: spacing.xs,
      }}
    >
      {title}
    </div>
    {children}
  </div>
);

const CaseFilterBar: FC<CaseFilterBarProps> = ({
  onFilterChange,
  onRefresh,
  onBatchExport,
  onBatchImport,
  hasActiveFilter = false,
  filters,
  resultCount,
}) => {
  const { colors, spacing, borderRadius, animations } = useCaseHubTheme();
  const [keyword, setKeyword] = useState(filters?.keyword || '');
  const [filterOpen, setFilterOpen] = useState(false);
  const [tempFirstStatus, setTempFirstStatus] = useState<number | undefined>();
  const [tempSecondStatus, setTempSecondStatus] = useState<
    number | undefined
  >();
  const [tempReview, setTempReview] = useState<boolean | undefined>();
  /** UserSelect 多选值形态：{ label, value: number }[] */
  const [tempCreators, setTempCreators] = useState<
    { label: string; value: number }[]
  >([]);
  const [isSearching, setIsSearching] = useState(false);

  /**
   * 跟踪"搜索中"反馈计时器
   * 解决：原代码中 setTimeout 未清理，组件卸载或快速切换时可能对已卸载组件 setState
   * （控制台报 "Can't perform a React state update on an unmounted component" 警告）
   */
  const searchingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * 启动"搜索中"反馈：300ms 后自动结束 loading 态
   * 内部统一管理 timer 引用，便于统一清理
   */
  const markSearching = useCallback(() => {
    if (searchingTimerRef.current) {
      clearTimeout(searchingTimerRef.current);
    }
    setIsSearching(true);
    searchingTimerRef.current = setTimeout(() => {
      setIsSearching(false);
      searchingTimerRef.current = null;
    }, 300);
  }, []);

  const dropdownItems: MenuProps['items'] = [
    { key: 'export', label: '批量导出', onClick: onBatchExport },
    { key: 'import', label: '批量导入', onClick: onBatchImport },
  ];

  /**
   * 防抖搜索回调
   * 使用 useMemo 保持 debounce 实例稳定，避免每次渲染重新创建
   * 延迟 500ms 后触发搜索，减少不必要的过滤操作
   * 入参改为完整 filters 对象，便于后续扩展字段
   */
  const debouncedSearch = useMemo(
    () =>
      debounce((nextFilters: CaseFilterValues) => {
        markSearching();
        onFilterChange?.(nextFilters);
      }, 500),
    [onFilterChange, markSearching],
  );

  /** 组件卸载时取消防抖调用与未执行的 timer */
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
      if (searchingTimerRef.current) {
        clearTimeout(searchingTimerRef.current);
        searchingTimerRef.current = null;
      }
    };
  }, [debouncedSearch]);

  /**
   * 同步外部 filters.keyword 到本地 keyword 状态
   * 解决外部筛选条件变化时输入框值被清空的问题
   */
  useEffect(() => {
    if (filters?.keyword !== undefined && filters.keyword !== keyword) {
      setKeyword(filters.keyword || '');
    }
  }, [filters?.keyword]);

  /**
   * 当弹窗打开时，用当前生效的筛选条件初始化临时状态
   * 弹窗关闭时保持用户已配置的临时值，支持"打开弹窗 → 修改 → 关闭（不点确定）→ 搜索触发应用"的隐式交互
   * 依赖项用具体字段（firstStatus / secondStatus / isReview / creators）而非整个 filters 对象，
   * 避免父组件任意字段更新都触发该 effect 重建
   */
  useEffect(() => {
    if (!filterOpen) return;
    setTempFirstStatus(filters?.firstStatus);
    setTempSecondStatus(filters?.secondStatus);
    setTempReview(filters?.isReview);
    setTempCreators(
      filters?.creators?.map((c) => ({ label: c.name, value: c.id })) ?? [],
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filterOpen,
    filters?.firstStatus,
    filters?.secondStatus,
    filters?.isReview,
    filters?.creators,
  ]);

  /**
   * 把 tempCreators（UserSelect 形态）转成 filter 存储的 CreatorFilterItem 形态
   * 空数组时返回 undefined，避免产生空数组占据 hasActiveFilter 判断
   */
  const buildAppliedCreators = useCallback(
    (): CreatorFilterItem[] | undefined =>
      tempCreators.length > 0
        ? tempCreators.map((c) => ({ id: c.value, name: c.label }))
        : undefined,
    [tempCreators],
  );

  /**
   * 处理搜索输入
   * 1. 立即更新本地 keyword 状态以实现实时渲染输入内容
   * 2. 防抖触发 onFilterChange 回调进行实际过滤
   */
  const handleSearch = useCallback(
    (value: string) => {
      setKeyword(value);
      debouncedSearch({
        keyword: value,
        firstStatus: tempFirstStatus,
        secondStatus: tempSecondStatus,
        isReview: tempReview,
        creators: buildAppliedCreators(),
      });
    },
    [
      debouncedSearch,
      tempFirstStatus,
      tempSecondStatus,
      tempReview,
      buildAppliedCreators,
    ],
  );

  /** 清空搜索关键字 */
  const handleClearKeyword = useCallback(() => {
    setKeyword('');
    debouncedSearch({
      keyword: '',
      firstStatus: tempFirstStatus,
      secondStatus: tempSecondStatus,
      isReview: tempReview,
      creators: buildAppliedCreators(),
    });
  }, [
    debouncedSearch,
    tempFirstStatus,
    tempSecondStatus,
    tempReview,
    buildAppliedCreators,
  ]);

  /** 立即触发搜索（回车时调用，清除防抖延迟） */
  const handleImmediateSearch = useCallback(() => {
    debouncedSearch.cancel();
    markSearching();
    onFilterChange?.({
      keyword,
      firstStatus: tempFirstStatus,
      secondStatus: tempSecondStatus,
      isReview: tempReview,
      creators: buildAppliedCreators(),
    });
  }, [
    keyword,
    tempFirstStatus,
    tempSecondStatus,
    tempReview,
    buildAppliedCreators,
    onFilterChange,
    debouncedSearch,
    markSearching,
  ]);

  /** 应用筛选条件并关闭弹窗（用户点"确定"） */
  const handleApplyFilter = useCallback(() => {
    setFilterOpen(false);
    onFilterChange?.({
      keyword,
      firstStatus: tempFirstStatus,
      secondStatus: tempSecondStatus,
      isReview: tempReview,
      creators: buildAppliedCreators(),
    });
  }, [
    keyword,
    tempFirstStatus,
    tempSecondStatus,
    tempReview,
    buildAppliedCreators,
    onFilterChange,
  ]);

  /** 重置所有筛选条件（不包括搜索关键字） */
  const handleResetFilter = useCallback(() => {
    setTempFirstStatus(undefined);
    setTempSecondStatus(undefined);
    setTempReview(undefined);
    setTempCreators([]);
    onFilterChange?.({ keyword });
  }, [keyword, onFilterChange]);

  /** 清除全部非关键字筛选（用于 Chip 条上的"清除全部"按钮） */
  const handleClearAllNonKeyword = useCallback(() => {
    onFilterChange?.({ keyword: filters?.keyword });
  }, [filters?.keyword, onFilterChange]);

  /**
   * 从当前 filters 派生激活的 Chip 列表
   * 每个 chip 携带 onRemove 回调，直接更新 filter（绕过弹窗临时状态）
   * 多值展示：≤ 2 个全展示，> 2 个用 "+N" 收尾，避免 Chip 过长
   */
  const activeChips = useMemo(() => {
    const chips: Array<{
      key: string;
      label: string;
      value: string;
      onRemove: () => void;
    }> = [];

    if (filters?.firstStatus !== undefined) {
      const config = STATUS_OPTIONS.find(
        (s) => s.value === filters.firstStatus,
      );
      chips.push({
        key: 'firstStatus',
        label: '一轮',
        value: config?.label ?? String(filters.firstStatus),
        onRemove: () =>
          onFilterChange?.({ ...filters, firstStatus: undefined }),
      });
    }

    if (filters?.secondStatus !== undefined) {
      const config = STATUS_OPTIONS.find(
        (s) => s.value === filters.secondStatus,
      );
      chips.push({
        key: 'secondStatus',
        label: '二轮',
        value: config?.label ?? String(filters.secondStatus),
        onRemove: () =>
          onFilterChange?.({ ...filters, secondStatus: undefined }),
      });
    }

    if (filters?.isReview !== undefined) {
      chips.push({
        key: 'isReview',
        label: '评审',
        value: filters.isReview ? '已评审' : '未评审',
        onRemove: () => onFilterChange?.({ ...filters, isReview: undefined }),
      });
    }

    if (filters?.creators && filters.creators.length > 0) {
      const names = filters.creators.map((c) => c.name);
      const displayValue =
        names.length <= 2
          ? names.join(', ')
          : `${names.slice(0, 2).join(', ')} +${names.length - 2}`;
      chips.push({
        key: 'creators',
        label: '创建人',
        value: displayValue,
        onRemove: () => onFilterChange?.({ ...filters, creators: undefined }),
      });
    }

    return chips;
  }, [filters, onFilterChange]);

  return (
    <div>
      <Space size={spacing.sm}>
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
                width: 320,
                display: 'flex',
                flexDirection: 'column',
                gap: spacing.md,
              }}
            >
              <FilterGroup title="执行状态" colors={colors} spacing={spacing}>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: spacing.sm,
                  }}
                >
                  <div>
                    <FilterFieldLabel colors={colors}>一轮</FilterFieldLabel>
                    <Select
                      allowClear
                      placeholder="选择一轮状态"
                      value={tempFirstStatus}
                      onChange={setTempFirstStatus}
                      style={{ width: '100%' }}
                      options={STATUS_OPTIONS}
                    />
                  </div>
                  <div>
                    <FilterFieldLabel colors={colors}>二轮</FilterFieldLabel>
                    <Select
                      allowClear
                      placeholder="选择二轮状态"
                      value={tempSecondStatus}
                      onChange={setTempSecondStatus}
                      style={{ width: '100%' }}
                      options={STATUS_OPTIONS}
                    />
                  </div>
                </div>
              </FilterGroup>

              <FilterGroup title="评审状态" colors={colors} spacing={spacing}>
                <Select
                  allowClear
                  placeholder="选择评审状态"
                  value={tempReview}
                  onChange={setTempReview}
                  style={{ width: '100%' }}
                  options={REVIEW_OPTIONS}
                />
              </FilterGroup>

              <FilterGroup title="创建人" colors={colors} spacing={spacing}>
                <UserSelect
                  multiple
                  value={tempCreators}
                  onChange={(v) =>
                    setTempCreators(Array.isArray(v) ? v : v ? [v] : [])
                  }
                />
              </FilterGroup>

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
            {activeChips.length > 0 && ` (${activeChips.length})`}
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
    </div>
  );
};

export default CaseFilterBar;

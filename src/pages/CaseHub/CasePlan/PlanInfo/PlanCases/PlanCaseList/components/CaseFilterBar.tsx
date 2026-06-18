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
import { toSelectOptions } from '@/pages/CaseHub/hooks/caseEnumOption';
import { useCaseEnumConfig } from '@/pages/CaseHub/hooks/useCaseEnumConfig';
import { useCaseHubTheme } from '@/pages/CaseHub/styles';
import {
  CompressOutlined,
  EllipsisOutlined,
  ExpandOutlined,
  FilterOutlined,
  LoadingOutlined,
  ReloadOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Button, Dropdown, Input, Popover, Select, Space, Tooltip } from 'antd';
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
  /** 全部折叠 / 全部展开切换 */
  onCollapseAllChange?: (collapsed: boolean) => void;
  /** 当前是否有激活的筛选条件（由父组件管理） */
  hasActiveFilter?: boolean;
  /** 当前生效的筛选条件（用于回显） */
  filters?: CaseFilterValues;
  /** 当前筛选后的用例数量 */
  resultCount?: number;
}

/**
 * 执行状态筛选选项
 * 从 useCaseEnumConfig 动态获取，一轮 / 二轮共用同一份枚举
 * 当 Context 数据为空时降级为兜底默认值
 */
const useStatusOptions = () => {
  const { options: caseOptions } = useCaseEnumConfig('CASE_STATUS');
  return useMemo(() => toSelectOptions(caseOptions), [caseOptions]);
};

/**
 * 评审状态筛选选项（从 Context 动态获取）
 * 返回 { value: string, label: string } 格式，value 与后端枚举值对齐（string 类型）
 */
const useReviewOptions = () => {
  const { options: reviewOptions } = useCaseEnumConfig('REVIEW_STATUS');
  return useMemo(() => toSelectOptions(reviewOptions), [reviewOptions]);
};

/**
 * 适用端筛选选项（从 Context 动态获取，与用例库共用 PLATFORM 配置）
 */
const usePlatformOptions = () => {
  const { options: platformOptions } = useCaseEnumConfig('PLATFORM');
  return useMemo(() => toSelectOptions(platformOptions), [platformOptions]);
};

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
  onCollapseAllChange,
  hasActiveFilter = false,
  filters,
  resultCount,
}) => {
  const { colors, spacing, borderRadius, animations } = useCaseHubTheme();
  /**
   * 从 Context 动态获取执行状态 / 评审状态筛选选项
   */
  const statusOptions = useStatusOptions();
  const reviewFilterOptions = useReviewOptions();
  const platformFilterOptions = usePlatformOptions();
  const [keyword, setKeyword] = useState(filters?.keyword || '');
  const [filterOpen, setFilterOpen] = useState(false);
  const [tempFirstStatus, setTempFirstStatus] = useState<string | undefined>();
  const [tempSecondStatus, setTempSecondStatus] = useState<
    string | undefined
  >();
  const [tempReview, setTempReview] = useState<string | undefined>();
  const [tempPlatform, setTempPlatform] = useState<string | undefined>();
  /** UserSelect 多选值形态：{ label, value: number }[] */
  const [tempCreators, setTempCreators] = useState<
    { label: string; value: number }[]
  >([]);
  const [isSearching, setIsSearching] = useState(false);
  /** 全部折叠状态（用于展开/折叠一键切换按钮） */
  const [allCollapsed, setAllCollapsed] = useState(false);

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

  // 计划项目上下文 (planInfo.project_id) 未就绪时, 父组件不传 onBatchImport,
  // 这里就不再渲染"批量导入"菜单项, 避免点开后端 422.
  const dropdownItems: MenuProps['items'] = useMemo(() => {
    const items: MenuProps['items'] = [
      { key: 'export', label: '批量导出', onClick: onBatchExport },
    ];
    if (onBatchImport) {
      items.push({ key: 'import', label: '批量导入', onClick: onBatchImport });
    }
    return items;
  }, [onBatchExport, onBatchImport]);

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
    // filters 中的状态值已为 string 类型（与后端枚举 value 对齐），直接赋值给临时状态
    setTempFirstStatus(filters?.firstStatus);
    setTempSecondStatus(filters?.secondStatus);
    setTempReview(filters?.isReview);
    setTempPlatform(filters?.casePlatform);
    setTempCreators(
      filters?.creators?.map((c) => ({ label: c.name, value: c.id })) ?? [],
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filterOpen,
    filters?.firstStatus,
    filters?.secondStatus,
    filters?.isReview,
    filters?.casePlatform,
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
      // 筛选值直接透传，tempFirstStatus/tempSecondStatus/tempReview 已为 string 类型
      debouncedSearch({
        keyword: value,
        firstStatus: tempFirstStatus,
        secondStatus: tempSecondStatus,
        isReview: tempReview,
        casePlatform: tempPlatform,
        creators: buildAppliedCreators(),
      });
    },
    [
      debouncedSearch,
      tempFirstStatus,
      tempSecondStatus,
      tempReview,
      tempPlatform,
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
      casePlatform: tempPlatform,
      creators: buildAppliedCreators(),
    });
  }, [
    debouncedSearch,
    tempFirstStatus,
    tempSecondStatus,
    tempReview,
    tempPlatform,
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
      casePlatform: tempPlatform,
      creators: buildAppliedCreators(),
    });
  }, [
    keyword,
    tempFirstStatus,
    tempSecondStatus,
    tempReview,
    tempPlatform,
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
      casePlatform: tempPlatform,
      creators: buildAppliedCreators(),
    });
  }, [
    keyword,
    tempFirstStatus,
    tempSecondStatus,
    tempReview,
    tempPlatform,
    buildAppliedCreators,
    onFilterChange,
  ]);

  /** 重置所有筛选条件（不包括搜索关键字） */
  const handleResetFilter = useCallback(() => {
    setTempFirstStatus(undefined);
    setTempSecondStatus(undefined);
    setTempReview(undefined);
    setTempPlatform(undefined);
    setTempCreators([]);
    onFilterChange?.({ keyword });
  }, [keyword, onFilterChange]);

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
      // filters.firstStatus 已为 string 类型，与 options.value 直接比较
      const config = statusOptions.find((s) => s.value === filters.firstStatus);
      chips.push({
        key: 'firstStatus',
        label: '一轮',
        value: config?.label ?? filters.firstStatus,
        onRemove: () =>
          onFilterChange?.({ ...filters, firstStatus: undefined }),
      });
    }

    if (filters?.secondStatus !== undefined) {
      const config = statusOptions.find(
        (s) => s.value === filters.secondStatus,
      );
      chips.push({
        key: 'secondStatus',
        label: '二轮',
        value: config?.label ?? filters.secondStatus,
        onRemove: () =>
          onFilterChange?.({ ...filters, secondStatus: undefined }),
      });
    }

    if (filters?.isReview !== undefined) {
      const reviewLabel = reviewFilterOptions.find(
        (opt) => opt.value === filters.isReview,
      )?.label;
      chips.push({
        key: 'isReview',
        label: '评审',
        value: reviewLabel ?? filters.isReview,
        onRemove: () => onFilterChange?.({ ...filters, isReview: undefined }),
      });
    }

    if (filters?.casePlatform !== undefined) {
      const platformLabel = platformFilterOptions.find(
        (opt) => opt.value === filters.casePlatform,
      )?.label;
      chips.push({
        key: 'casePlatform',
        label: '适用端',
        value: platformLabel ?? filters.casePlatform,
        onRemove: () =>
          onFilterChange?.({ ...filters, casePlatform: undefined }),
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
  }, [
    filters,
    onFilterChange,
    statusOptions,
    reviewFilterOptions,
    platformFilterOptions,
  ]);

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
                      options={statusOptions}
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
                      options={statusOptions}
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
                  options={reviewFilterOptions}
                />
              </FilterGroup>

              <FilterGroup title="适用端" colors={colors} spacing={spacing}>
                <Select
                  allowClear
                  placeholder="选择适用端"
                  value={tempPlatform}
                  onChange={setTempPlatform}
                  style={{ width: '100%' }}
                  options={platformFilterOptions}
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

        {onCollapseAllChange && (
          <Tooltip title={allCollapsed ? '展开所有用例' : '折叠所有用例'}>
            <Button
              icon={allCollapsed ? <ExpandOutlined /> : <CompressOutlined />}
              onClick={() => {
                const next = !allCollapsed;
                setAllCollapsed(next);
                onCollapseAllChange(next);
              }}
            />
          </Tooltip>
        )}

        <Dropdown menu={{ items: dropdownItems }} trigger={['click']}>
          <Button icon={<EllipsisOutlined />} />
        </Dropdown>
      </Space>
    </div>
  );
};

export default CaseFilterBar;

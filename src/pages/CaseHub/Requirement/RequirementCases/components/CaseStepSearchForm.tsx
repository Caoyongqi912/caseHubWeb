import { useCaseHubTheme } from '@/pages/CaseHub/styles';
import { CaseSearchForm } from '@/pages/CaseHub/types';
import { ProCard } from '@ant-design/pro-components';
import { Divider } from 'antd';
import { FC, useCallback, useState } from 'react';
import SearchFields from './SearchFields';
import Toolbar from './Toolbar';
import UploadModal from './UploadModal';

/**
 * 搜索相关回调
 */
interface SearchHandlers {
  onSearch: (values: CaseSearchForm) => void;
  onReset: () => void;
}

/**
 * 选择相关回调
 */
interface SelectionHandlers {
  onSelectAll: () => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  onClearSelection: () => void;
}

/**
 * 操作相关回调
 */
interface ActionHandlers {
  onRefresh: () => void;
  onToggleGroup: () => void;
  onAddCase: () => void;
  onUploadFinish: () => void;
}

/**
 * CaseStepSearchForm 组件属性
 */
interface Props {
  /** 标签选项列表 */
  tags: { label: string; value: string }[];
  /** 是否分组显示 */
  isGrouped: boolean;
  /** 是否全部展开 */
  isAllExpanded: boolean;
  /** 已选择用例数量 */
  selectedCount: number;
  /** 用例总数 */
  totalCount: number;
  /** 上传相关参数 */
  uploadProps?: {
    reqId?: string;
    moduleId?: string;
    projectId?: string;
  };
  /** 搜索相关回调 */
  searchHandlers: SearchHandlers;
  /** 选择相关回调 */
  selectionHandlers: SelectionHandlers;
  /** 操作相关回调 */
  actionHandlers: ActionHandlers;
}

/**
 * 用例步骤搜索表单组件
 * 包含搜索字段、工具栏和上传功能
 */
const CaseStepSearchForm: FC<Props> = ({
  tags,
  isGrouped,
  isAllExpanded,
  selectedCount,
  totalCount,
  uploadProps,
  searchHandlers,
  selectionHandlers,
  actionHandlers,
}) => {
  /** 上传弹窗状态 */
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const { colors, spacing, borderRadius } = useCaseHubTheme();

  /**
   * 处理搜索
   */
  const handleSearch = useCallback(
    (values: CaseSearchForm) => {
      searchHandlers.onSearch(values);
    },
    [searchHandlers],
  );

  /**
   * 处理重置
   */
  const handleReset = useCallback(() => {
    searchHandlers.onReset();
  }, [searchHandlers]);

  /** 卡片样式 */
  const cardStyle = {
    borderRadius: borderRadius.xl,
    border: `1px solid ${colors.border}`,
    overflow: 'visible' as const,
    position: 'sticky' as const,
    top: 0,
    zIndex: 100,
    background: colors.bgContainer,
    boxShadow: `0 4px 16px rgba(0, 0, 0, 0.08)`,
    marginBottom: spacing.sm,
  };

  return (
    <>
      {/* 上传弹窗 */}
      <UploadModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        uploadProps={uploadProps}
        onUploadFinish={actionHandlers.onUploadFinish}
      />

      {/* 搜索表单卡片 */}
      <ProCard
        style={cardStyle}
        collapsible={false}
        headStyle={{
          background: `linear-gradient(135deg, ${colors.primaryBg} 0%, ${colors.bgContainer} 100%)`,
          borderBottom: `1px solid ${colors.border}`,
          padding: `${spacing.md}px ${spacing.lg}px`,
        }}
        bodyStyle={{
          padding: spacing.lg,
          background: colors.bgContainer,
        }}
      >
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}
        >
          {/* 搜索字段区域 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: spacing.md,
            }}
          >
            <SearchFields
              tags={tags}
              onSearch={handleSearch}
              onReset={handleReset}
            />
          </div>

          {/* 分隔线 */}
          <Divider style={{ margin: 0, borderColor: colors.border }} />

          {/* 工具栏区域 */}
          <Toolbar
            isGrouped={isGrouped}
            isAllExpanded={isAllExpanded}
            selectedCount={selectedCount}
            totalCount={totalCount}
            onSelectAll={selectionHandlers.onSelectAll}
            onExpandAll={selectionHandlers.onExpandAll}
            onCollapseAll={selectionHandlers.onCollapseAll}
            onClearSelection={selectionHandlers.onClearSelection}
            onRefresh={actionHandlers.onRefresh}
            onToggleGroup={actionHandlers.onToggleGroup}
            onAddCase={actionHandlers.onAddCase}
            onUploadClick={() => setUploadModalOpen(true)}
          />
        </div>
      </ProCard>
    </>
  );
};

export default CaseStepSearchForm;

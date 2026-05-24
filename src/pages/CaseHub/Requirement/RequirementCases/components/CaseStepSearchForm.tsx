/**
 * 用例步骤搜索表单组件
 * 包含搜索字段、工具栏和上传功能
 */
import { CaseSearchForm } from '@/pages/CaseHub/types';
import { ProCard } from '@ant-design/pro-components';
import { Divider } from 'antd';
import { FC, useCallback, useState } from 'react';
import SearchFields from './SearchFields';
import Toolbar from './Toolbar';
import UploadModal from './UploadModal';

/** 搜索相关回调接口 */
interface SearchHandlers {
  onSearch: (values: CaseSearchForm) => void;
  onReset: () => void;
}

/** 选择相关回调接口 */
interface SelectionHandlers {
  onSelectAll: () => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  onClearSelection: () => void;
}

/** 操作相关回调接口 */
interface ActionHandlers {
  onRefresh: () => void;
  onToggleGroup: () => void;
  onAddCase: () => void;
  onUploadFinish: () => void;
  onCaseSelect: (caseIds: number[]) => void;
}

/** CaseStepSearchForm 组件属性 */
interface Props {
  tags: { label: string; value: string }[];
  isGrouped: boolean;
  isAllExpanded: boolean;
  selectedCount: number;
  totalCount: number;
  requirementId: number;
  onRefreshCallback: () => void;
  allTestCase: import('@/pages/CaseHub/types').ITestCase[];
  selectedCase: number[];
  onSelectedCaseChange: (
    ids: number[] | ((prev: number[]) => number[]),
  ) => void;
  uploadProps?: {
    reqId?: string;
    moduleId?: string;
    projectId?: string;
  };
  searchHandlers: SearchHandlers;
  selectionHandlers: SelectionHandlers;
  actionHandlers: ActionHandlers;
  projectId?: number;
}

const CaseStepSearchForm: FC<Props> = ({
  tags,
  isGrouped,
  isAllExpanded,
  selectedCount,
  totalCount,
  requirementId,
  onRefreshCallback,
  allTestCase,
  selectedCase,
  onSelectedCaseChange,
  uploadProps,
  searchHandlers,
  selectionHandlers,
  actionHandlers,
  projectId,
}) => {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const handleSearch = useCallback(
    (values: CaseSearchForm) => {
      searchHandlers.onSearch(values);
    },
    [searchHandlers],
  );

  const handleReset = useCallback(() => {
    searchHandlers.onReset();
  }, [searchHandlers]);

  return (
    <>
      <UploadModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        uploadProps={uploadProps}
        onUploadFinish={actionHandlers.onUploadFinish}
      />

      <ProCard
        styles={{
          body: {
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          },
        }}
      >
        {/* 查询用例步骤搜索 */}
        <SearchFields
          tags={tags}
          onSearch={handleSearch}
          onReset={handleReset}
        />
        <Divider style={{ margin: 0 }} />
        {/* 工具栏 */}
        <Toolbar
          projectId={projectId}
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
          onCaseSelect={actionHandlers.onCaseSelect}
          requirementId={requirementId}
          onRefreshCallback={onRefreshCallback}
          allTestCase={allTestCase}
          selectedCase={selectedCase}
          onSelectedCaseChange={onSelectedCaseChange}
        />
      </ProCard>
    </>
  );
};

export default CaseStepSearchForm;

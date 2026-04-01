import { useCaseHubTheme } from '@/pages/CaseHub/styles';
import { CaseSearchForm } from '@/pages/CaseHub/types';
import { ProCard } from '@ant-design/pro-components';
import { Divider } from 'antd';
import { FC, useCallback, useState } from 'react';
import SearchFields from './SearchFields';
import Toolbar from './Toolbar';
import UploadModal from './UploadModal';

interface Props {
  setSearchForm: React.Dispatch<React.SetStateAction<CaseSearchForm>>;
  tags: { label: string; value: string }[];
  isGrouped?: boolean;
  isAllExpanded?: boolean;
  selectedCount?: number;
  totalCount?: number;
  onSelectAll?: () => void;
  onExpandAll?: () => void;
  onCollapseAll?: () => void;
  onClearSelection?: () => void;
  onRefresh?: () => void;
  onToggleGroup?: () => void;
  onAddCase?: () => void;
  onUploadFinish?: () => void;
  uploadProps?: {
    reqId?: string;
    moduleId?: string;
    projectId?: string;
  };
}

const CaseStepSearchForm: FC<Props> = ({
  tags,
  setSearchForm,
  isGrouped = true,
  isAllExpanded = true,
  selectedCount = 0,
  totalCount = 0,
  onSelectAll,
  onExpandAll,
  onCollapseAll,
  onClearSelection,
  onRefresh,
  onToggleGroup,
  onAddCase,
  onUploadFinish,
  uploadProps,
}) => {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const { colors, spacing, borderRadius } = useCaseHubTheme();

  const handleSearch = useCallback(
    (values: CaseSearchForm) => {
      setSearchForm(values);
    },
    [setSearchForm],
  );

  const handleReset = useCallback(() => {
    setSearchForm({});
  }, [setSearchForm]);

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
      <UploadModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        uploadProps={uploadProps}
        onUploadFinish={() => {
          onUploadFinish?.();
        }}
      />

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

          <Divider style={{ margin: 0, borderColor: colors.border }} />

          <Toolbar
            isGrouped={isGrouped}
            isAllExpanded={isAllExpanded}
            selectedCount={selectedCount}
            totalCount={totalCount}
            onSelectAll={() => onSelectAll?.()}
            onExpandAll={() => onExpandAll?.()}
            onCollapseAll={() => onCollapseAll?.()}
            onClearSelection={() => onClearSelection?.()}
            onRefresh={() => onRefresh?.()}
            onToggleGroup={() => onToggleGroup?.()}
            onAddCase={() => onAddCase?.()}
            onUploadClick={() => setUploadModalOpen(true)}
          />
        </div>
      </ProCard>
    </>
  );
};

export default CaseStepSearchForm;

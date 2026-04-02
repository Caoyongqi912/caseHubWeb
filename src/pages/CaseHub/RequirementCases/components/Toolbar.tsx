import { useCaseHubTheme } from '@/pages/CaseHub/styles';
import {
  AppstoreOutlined,
  CheckSquareOutlined,
  CloseSquareOutlined,
  DownSquareOutlined,
  MenuOutlined,
  PlusOutlined,
  ReloadOutlined,
  UploadOutlined,
  UpSquareOutlined,
} from '@ant-design/icons';
import { Button, Divider, Tooltip, Typography } from 'antd';
import { FC, useMemo } from 'react';

interface ToolbarProps {
  isGrouped: boolean;
  isAllExpanded: boolean;
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  onClearSelection: () => void;
  onRefresh: () => void;
  onToggleGroup: () => void;
  onAddCase: () => void;
  onUploadClick: () => void;
}

const { Text } = Typography;

const Toolbar: FC<ToolbarProps> = ({
  isGrouped,
  isAllExpanded,
  selectedCount,
  totalCount,
  onSelectAll,
  onExpandAll,
  onCollapseAll,
  onClearSelection,
  onRefresh,
  onToggleGroup,
  onAddCase,
  onUploadClick,
}) => {
  const { colors, spacing, borderRadius } = useCaseHubTheme();

  const toolbarBtnStyle = useMemo(
    () => ({
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      borderRadius: borderRadius.md,
      fontWeight: 500,
    }),
    [borderRadius],
  );

  const groupButtonStyle = useMemo(
    () => ({
      borderRadius: borderRadius.lg,
      fontWeight: 600,
      height: 36,
      paddingLeft: 20,
      paddingRight: 20,
      background: isGrouped
        ? `linear-gradient(135deg, ${colors.primary} 0%, ${
            colors.primaryHover || colors.primary
          } 100%)`
        : `linear-gradient(135deg, ${colors.warning} 0%, ${colors.warning} 100%)`,
      boxShadow: `0 4px 12px ${isGrouped ? colors.primary : colors.warning}40`,
      border: 'none',
    }),
    [borderRadius, colors, isGrouped],
  );

  const addCaseButtonStyle = useMemo(
    () => ({
      borderRadius: borderRadius.lg,
      fontWeight: 600,
      height: 36,
      paddingLeft: 20,
      paddingRight: 20,
      background: `linear-gradient(135deg, ${colors.success} 0%, ${colors.success} 100%)`,
      boxShadow: `0 4px 12px ${colors.success}40`,
      border: 'none',
    }),
    [borderRadius, colors],
  );

  const selectionBadgeStyle = useMemo(
    () => ({
      display: 'flex',
      alignItems: 'center',
      gap: spacing.xs,
      padding: '4px 12px',
      background: selectedCount > 0 ? colors.primaryBg : 'transparent',
      borderRadius: borderRadius.md,
      border: `1px solid ${selectedCount > 0 ? colors.primary : colors.border}`,
      transition: 'all 200ms ease',
    }),
    [spacing, borderRadius, colors, selectedCount],
  );

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: spacing.sm,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
        <div style={selectionBadgeStyle}>
          <CheckSquareOutlined
            style={{
              color: selectedCount > 0 ? colors.primary : colors.textSecondary,
            }}
          />
          <Text
            style={{
              fontSize: 13,
              color: selectedCount > 0 ? colors.primary : colors.textSecondary,
              fontWeight: 500,
            }}
          >
            已选 {selectedCount}/{totalCount}
          </Text>
        </div>

        <Tooltip title="全选">
          <Button
            type="text"
            size="small"
            icon={<CheckSquareOutlined />}
            onClick={onSelectAll}
            style={toolbarBtnStyle}
          >
            全选
          </Button>
        </Tooltip>

        <Tooltip title="取消选择">
          <Button
            type="text"
            size="small"
            icon={<CloseSquareOutlined />}
            onClick={onClearSelection}
            disabled={selectedCount === 0}
            style={toolbarBtnStyle}
          >
            取消
          </Button>
        </Tooltip>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
        {isGrouped && (
          <>
            <Tooltip title={isAllExpanded ? '全部收起' : '全部展开'}>
              <Button
                type="text"
                size="small"
                icon={
                  isAllExpanded ? <UpSquareOutlined /> : <DownSquareOutlined />
                }
                onClick={isAllExpanded ? onCollapseAll : onExpandAll}
                style={toolbarBtnStyle}
              >
                {isAllExpanded ? '收起' : '展开'}
              </Button>
            </Tooltip>
            <Divider type="vertical" style={{ height: 20, margin: 0 }} />
          </>
        )}

        <Tooltip title="刷新列表">
          <Button
            type="text"
            size="small"
            icon={<ReloadOutlined />}
            onClick={onRefresh}
            style={toolbarBtnStyle}
          >
            刷新
          </Button>
        </Tooltip>

        <Tooltip title="附件上传">
          <Button
            type="text"
            size="small"
            icon={<UploadOutlined />}
            onClick={onUploadClick}
            style={toolbarBtnStyle}
          >
            上传
          </Button>
        </Tooltip>

        <Button
          type="primary"
          onClick={onToggleGroup}
          style={groupButtonStyle}
          icon={isGrouped ? <MenuOutlined /> : <AppstoreOutlined />}
        >
          {isGrouped ? '平铺' : '分组'}
        </Button>

        <Button
          type="primary"
          onClick={onAddCase}
          style={addCaseButtonStyle}
          icon={<PlusOutlined />}
        >
          添加用例
        </Button>
      </div>
    </div>
  );
};

export default Toolbar;

/**
 * 工具栏组件
 * 提供用例选择、分组切换、添加等操作功能
 */
import MyDrawer from '@/components/MyDrawer';
import { useCaseHubTheme } from '@/pages/CaseHub/styles';
import { ITestCase } from '@/pages/CaseHub/types';
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
import { Button, Divider, Space, Tooltip, Typography } from 'antd';
import { FC, useMemo, useState } from 'react';
import ChoiceCaseTable from '../../components/ChoiceCaseTable';
import ChoiceSettingArea from './ChoiceSettingArea';

/**
 * Toolbar 组件属性
 */
interface ToolbarProps {
  /** 项目ID */
  projectId?: number;
  /** 需求ID */
  requirementId: number;
  /** 是否分组显示 */
  isGrouped: boolean;
  /** 是否全部展开 */
  isAllExpanded: boolean;
  /** 已选择用例数量 */
  selectedCount: number;
  /** 用例总数 */
  totalCount: number;
  /** 全选回调 */
  onSelectAll: () => void;
  /** 展开全部回调 */
  onExpandAll: () => void;
  /** 收起全部回调 */
  onCollapseAll: () => void;
  /** 清除选择回调 */
  onClearSelection: () => void;
  /** 刷新回调 */
  onRefresh: () => void;
  /** 切换分组回调 */
  onToggleGroup: () => void;
  /** 添加用例回调 */
  onAddCase: () => void;
  /** 上传点击回调 */
  onUploadClick: () => void;
  /** 用例选择回调 */
  onCaseSelect: (caseIds: number[]) => void;
  /** 刷新回调 */
  onRefreshCallback: () => void;
  /** 所有用例列表 */
  allTestCase: ITestCase[];
  /** 已选择的用例ID列表 */
  selectedCase: number[];
  /** 设置选中用例回调 */
  onSelectedCaseChange: (
    ids: number[] | ((prev: number[]) => number[]),
  ) => void;
}

const { Text } = Typography;

/**
 * 工具栏组件
 * 提供用例选择、分组切换，添加等操作
 * @param props - 组件属性
 */
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
  projectId,
  onCaseSelect,
  requirementId,
  onRefreshCallback,
  allTestCase,
  selectedCase,
  onSelectedCaseChange,
}) => {
  const { colors, spacing, borderRadius, shadows } = useCaseHubTheme();
  const [openDrawer, setOpenDrawer] = useState(false);

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

  const handleCaseSelect = async (caseIds: number[]) => {
    onCaseSelect(caseIds);
    setOpenDrawer(false);
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
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

      <Space>
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

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setOpenDrawer(true)}
        >
          关联用例
        </Button>
      </Space>
      {/* 批量操作悬浮栏 */}
      {selectedCount > 0 && (
        <div
          style={{
            position: 'fixed',
            bottom: 80,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 100,
          }}
        >
          <ChoiceSettingArea
            requirementId={requirementId}
            callback={onRefreshCallback}
            allTestCase={allTestCase}
            showCheckButton={selectedCount > 0}
            selectedCase={selectedCase}
            setSelectedCase={onSelectedCaseChange}
          />
        </div>
      )}
      <MyDrawer
        open={openDrawer}
        setOpen={setOpenDrawer}
        onClose={() => setOpenDrawer(false)}
      >
        <ChoiceCaseTable
          hideAddButton={false}
          onCaseSelect={handleCaseSelect}
          projectId={projectId}
        />
      </MyDrawer>
    </div>
  );
};

export default Toolbar;

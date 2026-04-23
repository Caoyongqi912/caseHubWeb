import { useGlassStyles } from '@/components/Glass/useGlassStyles';
import { ProTable } from '@ant-design/pro-components';
import type { ActionType, ProColumns } from '@ant-design/pro-table/lib/typing';
import { TablePaginationConfig, TableProps } from 'antd';
import type { ExpandableConfig } from 'rc-table/lib/interface';
import type { TableProps as RcTableProps } from 'rc-table/lib/Table';
import { CSSProperties, FC, MutableRefObject, useMemo } from 'react';

export interface MyProTableProps {
  columns: ProColumns[];
  request?: (params: any, sort: any) => Promise<any>;
  dataSource?: RcTableProps<any>['data'];
  onSave?: (_: any, record: any) => Promise<any>;
  onDelete?: (_: any, record: any) => Promise<any>;
  rowKey: string;
  toolBarRender?: () => React.ReactNode | false;
  actionRef?: MutableRefObject<ActionType | undefined>;
  rowSelection?: TableProps<any>['rowSelection'];
  search?: boolean | { labelWidth?: number; showHiddenNum?: boolean };
  reload?: boolean | ((e: React.MouseEvent) => void);
  form?: Record<string, unknown>;
  pagination?: TablePaginationConfig | false;
  persistenceKey?: string;
  expandable?: ExpandableConfig<any>;
  headerTitle?: React.ReactNode;
  size?: 'small' | 'middle' | 'large';
  className?: string;
  tableLayout?: 'auto' | 'fixed' | 'scroll';
  tableAlertOptionRender?: (props: {
    selectedRowKeys: React.Key[];
    selectedRows: any[];
  }) => React.ReactNode;
  cardStyle?: CSSProperties;
}

const DEFAULT_PAGINATION: TablePaginationConfig = {
  showQuickJumper: true,
  defaultPageSize: 10,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50', '100'],
};

const DEFAULT_SEARCH_CONFIG = {
  labelWidth: 'auto' as const,
  showHiddenNum: true,
};

const MyProTable: FC<MyProTableProps> = (props) => {
  const styles = useGlassStyles();

  const {
    columns,
    dataSource,
    request,
    onSave,
    onDelete,
    rowKey,
    toolBarRender,
    actionRef,
    rowSelection,
    search = true,
    reload = true,
    form,
    pagination,
    persistenceKey,
    expandable,
    headerTitle,
    size,
    className,
    tableLayout,
    tableAlertOptionRender,
    cardStyle,
  } = props;

  const resolvedPagination = useMemo(() => {
    if (pagination === false) return false;
    return { ...DEFAULT_PAGINATION, ...pagination };
  }, [pagination]);

  const resolvedSearch = useMemo(() => {
    if (search === false) return false;
    if (typeof search === 'object') {
      return { ...DEFAULT_SEARCH_CONFIG, ...search };
    }
    return DEFAULT_SEARCH_CONFIG;
  }, [search]);

  return (
    <div
      style={{
        ...styles.glassCard(),
      }}
      className={className}
    >
      <ProTable
        tableAlertOptionRender={tableAlertOptionRender}
        tableStyle={{ width: '100%', minHeight: '70vh' }}
        form={form}
        formProps={{ labelAlign: 'left' }}
        dataSource={dataSource}
        columns={columns}
        actionRef={actionRef}
        scroll={{ x: 'auto' }}
        //@ts-ignore
        tableLayout={tableLayout}
        request={request}
        editable={{
          type: 'single',
          onSave: onSave,
          onDelete: onDelete,
        }}
        columnsState={{
          persistenceKey: persistenceKey ?? 'pro-table',
          persistenceType: 'localStorage',
        }}
        rowKey={rowKey}
        rowSelection={rowSelection || false}
        search={resolvedSearch}
        options={{
          density: true,
          setting: {
            listsHeight: 400,
          },
          reload: reload as boolean | ((e: React.MouseEvent) => void),
        }}
        expandable={expandable}
        pagination={resolvedPagination}
        dateFormatter="string"
        headerTitle={headerTitle ? headerTitle : null}
        //@ts-ignore
        toolBarRender={toolBarRender}
        size={size}
        className={className}
        cardStyle={cardStyle}
      />
    </div>
  );
};

export default MyProTable;

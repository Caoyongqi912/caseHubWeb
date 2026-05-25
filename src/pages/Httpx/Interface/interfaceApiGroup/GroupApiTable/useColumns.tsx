import MyModal from '@/components/MyModal';
import UserSelect from '@/components/Table/UserSelect';
import GroupBaseInfo from '@/pages/Httpx/Interface/interfaceApiGroup/GroupBaseInfo';
import { IInterfaceGroup } from '@/pages/Httpx/types';
import {
  DeleteOutlined,
  DeliveredProcedureOutlined,
  FolderOutlined,
  LinkOutlined,
  MoreOutlined,
  NumberOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { ProColumns } from '@ant-design/pro-components';
import { Button, Dropdown, Popconfirm, Space, Tag } from 'antd';
import { FormInstance } from 'antd/es/form';
import { useMemo } from 'react';

interface UseColumnsOptions {
  styles: { colors: { primary: string } };
  groupForm: FormInstance<IInterfaceGroup>;
  actionRef: React.MutableRefObject<any>;
  onSaveBaseInfo: (values: IInterfaceGroup) => Promise<boolean>;
  onViewDetail: (record: IInterfaceGroup) => void;
  onMoveGroup: (record: IInterfaceGroup) => void;
  onDeleteGroup: (id: number) => Promise<void>;
}

const tagBaseStyle = {
  borderRadius: 6,
  fontSize: 12,
  padding: '4px 8px',
};

const uidTagStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  fontFamily: 'monospace',
  fontSize: 12,
  padding: '4px 8px',
  borderRadius: 6,
};

export const useColumns = (
  options: UseColumnsOptions,
): ProColumns<IInterfaceGroup>[] => {
  const {
    styles,
    groupForm,
    actionRef,
    onSaveBaseInfo,
    onViewDetail,
    onMoveGroup,
    onDeleteGroup,
  } = options;

  return useMemo(
    () => [
      {
        title: 'ID',
        dataIndex: 'uid',
        key: 'uid',
        copyable: true,
        width: 130,
        render: (_, record) => (
          <Tag
            style={{
              ...uidTagStyle,
              background: `${styles.colors.primary}15`,
              color: styles.colors.primary,
            }}
          >
            <NumberOutlined />
            {record.uid}
          </Tag>
        ),
      },
      {
        title: '组名',
        dataIndex: 'interface_group_name',
        key: 'interface_group_name',
        width: 240,
        render: (_, record) => (
          <MyModal
            form={groupForm}
            title={record.interface_group_name}
            onFinish={onSaveBaseInfo}
            trigger={
              <Tag style={tagBaseStyle}>
                <FolderOutlined />
                {record.interface_group_name}
              </Tag>
            }
          >
            <GroupBaseInfo />
          </MyModal>
        ),
      },
      {
        title: '描述',
        dataIndex: 'interface_group_desc',
        key: 'interface_group_desc',
        ellipsis: true,
        width: 320,
      },
      {
        title: '接口数',
        dataIndex: 'interface_group_api_num',
        key: 'interface_group_api_num',
        width: 100,
        render: (_, record) => (
          <Tag style={tagBaseStyle}>{record.interface_group_api_num || 0}</Tag>
        ),
      },
      {
        title: '创建人',
        dataIndex: 'creator',
        key: 'creator',
        valueType: 'select',
        width: 110,
        formItemRender: () => <UserSelect />,
        render: (_, record) => (
          <Tag style={{ ...tagBaseStyle, borderRadius: 12 }}>
            <UserOutlined />
            {record.creatorName}
          </Tag>
        ),
      },
      {
        title: '操作',
        valueType: 'option',
        key: 'option',
        fixed: 'right',
        width: 130,
        render: (_, record) => (
          <Space size={4}>
            <Button
              size="small"
              type="primary"
              icon={<LinkOutlined />}
              onClick={() => onViewDetail(record)}
            >
              详情
            </Button>
            <Dropdown
              menu={{
                items: [
                  {
                    key: '3',
                    label: '移动至',
                    icon: <DeliveredProcedureOutlined />,
                    onClick: () => onMoveGroup(record),
                  },
                  { type: 'divider' },
                  {
                    key: '2',
                    icon: <DeleteOutlined />,
                    danger: true,
                    label: (
                      <Popconfirm
                        title="确认删除？"
                        description="删除后数据将无法恢复"
                        okText="确认删除"
                        cancelText="取消"
                        okButtonProps={{ danger: true }}
                        onConfirm={() => onDeleteGroup(record.id)}
                      >
                        <a>删除</a>
                      </Popconfirm>
                    ),
                  },
                ],
              }}
            >
              <Button size="small" type="text" icon={<MoreOutlined />} />
            </Dropdown>
          </Space>
        ),
      },
    ],
    [
      styles,
      groupForm,
      actionRef,
      onSaveBaseInfo,
      onViewDetail,
      onMoveGroup,
      onDeleteGroup,
    ],
  );
};

import { IModule } from '@/api';
import {
  dropModule,
  insertModule,
  queryTreeModuleByProject,
  removeModule,
  updateModule,
} from '@/api/base';
import EmptyModule from '@/components/LeftComponents/EmptyModule';
import {
  getLocalStorageModule,
  getParentKey,
  module2Tree,
  setLocalStorageModule,
} from '@/components/LeftComponents/func';
import ModuleModal from '@/components/LeftComponents/ModuleModal';
import { useAccess } from '@@/exports';
import {
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  FolderOpenOutlined,
  FolderOutlined,
  MoreOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import {
  Badge,
  Button,
  Dropdown,
  Input,
  MenuProps,
  message,
  Modal,
  Space,
  theme,
  Tooltip,
  Tree,
  TreeProps,
  Typography,
} from 'antd';
import React, { FC, useEffect, useMemo, useState } from 'react';
import {
  borderRadius,
  shadows,
  spacing,
  styleHelpers,
  typography,
} from './styles';

const { useToken } = theme;
const { Search } = Input;
const { Text } = Typography;

type HandleAction = {
  title: string;
  key: number;
};

type IHandle = {
  AddRoot: HandleAction;
  AddChild: HandleAction;
  EditModule: HandleAction;
  RemoveModule: HandleAction;
};

const Handle: IHandle = {
  AddRoot: { title: '新增模块', key: 1 },
  AddChild: { title: '新增子模块', key: 2 },
  EditModule: { title: '编辑模块', key: 3 },
  RemoveModule: { title: '删除模块', key: 4 },
};

interface IProps {
  currentProjectId?: number;
  moduleType: number;
  onModuleChange: (moduleId: number) => void;
}

const ModuleTree: FC<IProps> = (props) => {
  const { currentProjectId, moduleType, onModuleChange } = props;
  const { isAdmin } = useAccess();
  const { token } = useToken();

  const [reload, setReload] = useState(0);
  const [modules, setModules] = useState<IModule[]>([]);
  const [modulesTree, setModulesTree] = useState<any[]>([]);

  const [open, setOpen] = useState(false);
  const [currentModule, setCurrentModule] = useState<IModule | null>(null);
  const [handleModule, setHandleModule] = useState<HandleAction>(
    Handle.AddRoot,
  );

  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [autoExpandParent, setAutoExpandParent] = useState(true);

  const styles = useMemo(
    () => ({
      headerCard: {
        marginBottom: spacing.lg,
        borderRadius: borderRadius.xl,
        border: `1px solid ${token.colorBorder}`,
        boxShadow: shadows.card,
        background: `linear-gradient(135deg, ${token.colorBgContainer} 0%, ${token.colorPrimaryBg} 100%)`,
        overflow: 'hidden',
        position: 'relative' as const,
      },
      treeCard: {
        borderRadius: borderRadius.xl,
        border: `1px solid ${token.colorBorder}`,
        boxShadow: shadows.card,
        background: token.colorBgContainer,
      },
      treeItem: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        borderRadius: borderRadius.sm,
        margin: '2px 0',
        cursor: 'pointer',
        padding: `${spacing.xs}px ${spacing.sm}px`,
        minHeight: 25,
      },
      actionBtn: {
        borderRadius: borderRadius.round,
        width: 24,
        height: 24,
        minWidth: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
    }),
    [token],
  );

  useEffect(() => {
    if (currentProjectId) {
      queryTreeModuleByProject(currentProjectId, moduleType).then(
        ({ code, data }) => {
          if (code === 0 && data) {
            setModules(data);
            setModulesTree(module2Tree(data));
            localStorageFun(data);
          }
        },
      );
    } else {
      setModules([]);
      setModulesTree([]);
      setSelectedKeys([]);
      setExpandedKeys([]);
    }
  }, [currentProjectId, reload]);

  const localStorageFun = (modulesList: IModule[]) => {
    const storageNum = getLocalStorageModule(moduleType);
    if (storageNum) {
      const moduleId = parseInt(storageNum);
      const moduleExists = checkModuleExists(modulesList, moduleId);

      if (moduleExists) {
        onModuleChange(moduleId);
        setSelectedKeys([moduleId]);
        setExpandedKeys([moduleId]);
        setAutoExpandParent(true);
      } else {
        localStorage.removeItem('module_type_' + moduleType);
        setSelectedKeys([]);
        setExpandedKeys([]);
      }
    }
  };

  const checkModuleExists = (
    modulesList: IModule[],
    targetId: number,
  ): boolean => {
    for (const module of modulesList) {
      if (module.key === targetId) return true;
      if (module.children?.length) {
        if (checkModuleExists(module.children, targetId)) return true;
      }
    }
    return false;
  };

  const TreeModule = useMemo(() => {
    const loop: any = (data: IModule[]) =>
      data.map((item: IModule) => {
        const strTitle = item.title;
        const index = strTitle.indexOf(searchValue);
        const beforeStr = strTitle.substring(0, index);
        const afterStr = strTitle.slice(index + searchValue.length);
        const title =
          index > -1 ? (
            <Text
              style={{
                fontSize: typography.fontSize.base,
              }}
            >
              {beforeStr}
              <Text
                strong
                style={{
                  color: token.colorPrimary,
                  padding: `0 ${spacing.xs}px`,
                  borderRadius: borderRadius.xs,
                  fontWeight: typography.fontWeight.semibold,
                }}
              >
                {searchValue}
              </Text>
              {afterStr}
            </Text>
          ) : (
            <Text
              strong
              style={{
                fontSize: typography.fontSize.base,
                fontWeight: typography.fontWeight.medium,
              }}
            >
              {strTitle}
            </Text>
          );
        if (item.children) {
          return {
            title,
            key: item.key,
            children: loop(item.children),
          };
        }
        return {
          title,
          key: item.key,
        };
      });
    return loop(modules);
  }, [modules, searchValue, token.colorPrimary, token.colorPrimaryBg]);

  const handleReload = () => {
    setReload(reload + 1);
  };

  const onDrop: TreeProps['onDrop'] = async (info) => {
    const { code } = await dropModule({
      id: info.dragNode.key,
      targetId: info.dropToGap ? null : info.node.key,
    });
    if (code === 0) handleReload();
  };

  const menuItem = (node: IModule): MenuProps['items'] => {
    return [
      {
        key: '1',
        label: (
          <Text
            strong
            style={{
              fontSize: typography.fontSize.base,
              color: token.colorText,
            }}
          >
            编辑
          </Text>
        ),
        onClick: async () => {
          setOpen(true);
          setCurrentModule(node);
          setHandleModule(Handle.EditModule);
        },
        icon: <EditOutlined style={{ color: token.colorPrimary }} />,
      },
      {
        type: 'divider',
      },
      {
        key: '2',
        label: (
          <Text
            strong
            style={{
              fontSize: typography.fontSize.base,
              color: token.colorError,
            }}
          >
            删除
          </Text>
        ),
        onClick: async () => {
          return Modal.confirm({
            title: (
              <span
                style={{
                  fontSize: typography.fontSize.lg,
                  fontWeight: typography.fontWeight.semibold,
                }}
              >
                确认删除
              </span>
            ),
            content: (
              <Text
                style={{
                  fontSize: typography.fontSize.sm,
                  color: token.colorTextSecondary,
                }}
              >
                删除后该模块下的所有内容将无法恢复，确定要继续吗？
              </Text>
            ),
            icon: (
              <ExclamationCircleOutlined
                style={{ color: token.colorWarning, fontSize: 22 }}
              />
            ),
            okText: '确定删除',
            okType: 'danger',
            cancelText: '取消',
            okButtonProps: {
              style: {
                ...styleHelpers.buttonPrimary(token),
                backgroundColor: token.colorError,
                borderColor: token.colorError,
              },
            },
            cancelButtonProps: {
              style: {
                borderRadius: borderRadius.md,
              },
            },
            onOk() {
              removeModule({ moduleId: node.key }).then(
                async ({ code, msg }) => {
                  if (code === 0) {
                    message.success(msg);
                    handleReload();
                  }
                },
              );
            },
          });
        },
        icon: <DeleteOutlined style={{ color: token.colorError }} />,
      },
    ];
  };

  const TreeTitleRender = (tree: any) => {
    const isSelected = selectedKeys.includes(tree.key);
    const isHovered = currentModule && currentModule.key === tree.key;

    return (
      <div
        style={{
          ...styles.treeItem,
          background: isSelected
            ? `linear-gradient(135deg, ${token.colorPrimaryBg} 0%, ${token.colorPrimaryBgHover} 100%)`
            : isHovered
            ? token.colorFillAlter
            : 'transparent',
          border: isSelected
            ? `1px solid ${token.colorPrimaryBorder}`
            : '1px solid transparent',
          ...styleHelpers.transition([
            'background-color',
            'border-color',
            'transform',
          ]),
        }}
        onClick={() => setCurrentModule(tree)}
        onMouseEnter={() => setCurrentModule(tree)}
      >
        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            alignItems: 'center',
            gap: spacing.sm,
          }}
        >
          {tree.children && tree.children.length > 0 ? (
            <FolderOutlined
              style={{
                fontSize: typography.fontSize.sm,
                color: isSelected ? token.colorPrimary : token.colorWarning,
              }}
            />
          ) : (
            <FileTextOutlined
              style={{
                fontSize: typography.fontSize.sm,
                color: isSelected
                  ? token.colorPrimary
                  : token.colorTextSecondary,
              }}
            />
          )}
          <Text
            strong
            style={{
              fontSize: typography.fontSize.base,
              color: isSelected ? token.colorPrimary : token.colorText,
              lineHeight: 1.4,
            }}
          >
            {tree.title}
          </Text>

          {tree.count > 0 && (
            <Badge
              count={tree.count}
              size="small"
              style={{
                fontSize: typography.fontSize.xs,
                fontWeight: typography.fontWeight.medium,
                backgroundColor: isSelected
                  ? token.colorPrimary
                  : token.colorInfoBg,
                color: isSelected ? '#fff' : token.colorInfoText,
                boxShadow: shadows.xs,
              }}
            />
          )}
        </div>

        {isAdmin && isHovered && (
          <Space
            size={2}
            style={{
              marginLeft: spacing.xs,
              ...styleHelpers.transition(['opacity']),
            }}
          >
            <Tooltip title="添加子模块" placement="top">
              <Button
                type="text"
                size="small"
                icon={<PlusOutlined />}
                onClick={async (event) => {
                  event.stopPropagation();
                  setCurrentModule(tree);
                  setHandleModule(Handle.AddChild);
                  setOpen(true);
                }}
                style={{
                  ...styles.actionBtn,
                  color: token.colorPrimary,
                  ...styleHelpers.transition(['background-color', 'color']),
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = token.colorPrimaryBg;
                  e.currentTarget.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              />
            </Tooltip>
            <Dropdown
              menu={{ items: menuItem(tree) }}
              trigger={['click']}
              placement="bottomRight"
            >
              <Button
                type="text"
                size="small"
                icon={<MoreOutlined />}
                onClick={(e) => e.stopPropagation()}
                style={{
                  ...styles.actionBtn,
                  ...styleHelpers.transition(['background-color', 'color']),
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = token.colorFillAlter;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              />
            </Dropdown>
          </Space>
        )}
      </div>
    );
  };

  const OnSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setSearchValue(value);

    if (!value) {
      setExpandedKeys([]);
      return;
    }

    const newExpandedKeys = modulesTree
      .map((item) => {
        if (item.title.indexOf(value) > -1) {
          return getParentKey(item.key, modules);
        }
        return null;
      })
      .filter(
        (item, i, self): item is React.Key =>
          !!(item && self.indexOf(item) === i),
      );
    setExpandedKeys(newExpandedKeys);
    setAutoExpandParent(true);
  };

  const onModuleFinish = async (value: { title: string }) => {
    let result;

    switch (handleModule) {
      case Handle.AddRoot:
        if (!currentProjectId) return;
        result = await insertModule({
          title: value.title,
          project_id: currentProjectId,
          module_type: moduleType,
        });
        break;

      case Handle.AddChild:
        if (!currentProjectId || !currentModule) return;
        result = await insertModule({
          title: value.title,
          project_id: currentProjectId,
          module_type: moduleType,
          parent_id: currentModule.key,
        });
        break;

      case Handle.EditModule:
        if (!currentModule) return;
        result = await updateModule({
          id: currentModule.key,
          title: value.title,
        });
        break;

      default:
        return;
    }

    if (result?.code === 0) {
      message.success(result.msg);
      setOpen(false);
      handleReload();
    }
  };

  return (
    <>
      <ModuleModal
        title={handleModule.title}
        open={open}
        onFinish={onModuleFinish}
        setOpen={setOpen}
      />

      {modules.length > 0 ? (
        <div>
          <Space
            direction={'vertical'}
            size={'middle'}
            style={{ width: '100%' }}
          >
            <ProCard
              size="small"
              style={styles.headerCard}
              bodyStyle={{ padding: spacing.lg }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 3,
                  background: `linear-gradient(90deg, ${token.colorPrimary} 0%, ${token.colorPrimaryBg} 100%)`,
                }}
              />
              <Space
                direction="vertical"
                style={{ width: '100%' }}
                size={spacing.md}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing.sm,
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: borderRadius.lg,
                        background: `linear-gradient(135deg, ${token.colorPrimary} 0%, ${token.colorPrimaryHover} 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: shadows.sm,
                      }}
                    >
                      <FolderOpenOutlined
                        style={{
                          fontSize: typography.fontSize.md,
                          color: '#fff',
                        }}
                      />
                    </div>
                    <Text
                      strong
                      style={{
                        fontSize: typography.fontSize.md,
                        fontWeight: typography.fontWeight.semibold,
                      }}
                    >
                      模块目录
                    </Text>
                  </div>
                  {isAdmin && (
                    <Tooltip title="新建根模块" placement="left">
                      <Button
                        type="primary"
                        size="small"
                        icon={<PlusOutlined />}
                        onClick={() => {
                          setHandleModule(Handle.AddRoot);
                          setCurrentModule(null);
                          setOpen(true);
                        }}
                        style={{
                          ...styleHelpers.buttonPrimary(token),
                          padding: `0 ${spacing.md}px`,
                          height: 30,
                          fontSize: typography.fontSize.xs,
                          display: 'flex',
                          alignItems: 'center',
                          gap: spacing.xs,
                        }}
                      >
                        新建
                      </Button>
                    </Tooltip>
                  )}
                </div>

                <Search
                  placeholder="搜索模块..."
                  prefix={
                    <SearchOutlined
                      style={{ color: token.colorTextSecondary }}
                    />
                  }
                  allowClear
                  variant="filled"
                  onChange={OnSearchChange}
                  style={{
                    borderRadius: borderRadius.md,
                  }}
                />
              </Space>
            </ProCard>
            <ProCard
              size="small"
              bodyStyle={{
                padding: spacing.sm,
                maxHeight: 'calc(100vh - 350px)',
                overflowY: 'auto',
              }}
              style={styles.treeCard}
            >
              <Tree
                showLine={{ showLeafIcon: false }}
                showIcon={false}
                style={{ width: 'auto' }}
                draggable={isAdmin}
                blockNode
                onExpand={(newExpandedKeys: React.Key[]) => {
                  setExpandedKeys(newExpandedKeys);
                  setAutoExpandParent(false);
                }}
                onDrop={onDrop}
                expandedKeys={expandedKeys}
                autoExpandParent={autoExpandParent}
                selectedKeys={selectedKeys}
                onSelect={(_: React.Key[], info: any) => {
                  const nodeKey = info.node.key;
                  setSelectedKeys([nodeKey]);
                  onModuleChange(nodeKey);
                  setLocalStorageModule(moduleType, nodeKey);
                }}
                treeData={TreeModule}
                titleRender={TreeTitleRender}
              />

              {modules.length > 0 && (
                <div
                  style={{
                    marginTop: spacing.md,
                    padding: `${spacing.sm}px ${spacing.md}px`,
                    borderTop: `1px solid ${token.colorBorder}`,
                    fontSize: typography.fontSize.xs,
                    textAlign: 'center',
                    fontWeight: typography.fontWeight.medium,
                    color: token.colorTextSecondary,
                    borderRadius: `0 0 ${borderRadius.md}px ${borderRadius.md}px`,
                    background: `linear-gradient(135deg, ${token.colorFillAlter} 0%, ${token.colorBgContainer} 100%)`,
                  }}
                >
                  <Space split={<span>•</span>} size={spacing.sm}>
                    <span>共 {modules.length} 个模块</span>
                    <span>
                      {
                        modules.filter(
                          (m) => m.children && m.children.length > 0,
                        ).length
                      }{' '}
                      个文件夹
                    </span>
                  </Space>
                </div>
              )}
            </ProCard>
          </Space>
        </div>
      ) : (
        isAdmin && (
          <EmptyModule
            currentProjectId={currentProjectId}
            moduleType={moduleType}
            callBack={handleReload}
          />
        )
      )}
    </>
  );
};

export default ModuleTree;

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
  Tooltip,
  Tree,
  TreeProps,
  Typography,
} from 'antd';
import React, { FC, useEffect, useMemo, useState } from 'react';
import {
  borderRadius,
  colors,
  shadows,
  spacing,
  styleHelpers,
  typography,
} from './designTokens';

const { Search } = Input;
const { Text } = Typography;

// 模块操作类型定义
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

// 模块操作枚举，用于区分不同的操作类型
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

  // 数据状态
  const [reload, setReload] = useState(0); // 刷新标记
  const [modules, setModules] = useState<IModule[]>([]); // 模块列表
  const [modulesTree, setModulesTree] = useState<any[]>([]); // 扁平化的模块树，用于搜索

  // 弹窗状态
  const [open, setOpen] = useState(false);
  const [currentModule, setCurrentModule] = useState<IModule | null>(null);
  const [handleModule, setHandleModule] = useState<HandleAction>(
    Handle.AddRoot,
  );

  // 交互状态
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [autoExpandParent, setAutoExpandParent] = useState(true);

  // 加载模块数据
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

  // 从 localStorage 恢复上次选中的模块
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
        // 模块已被删除，清理无效缓存
        localStorage.removeItem('module_type_' + moduleType);
        setSelectedKeys([]);
        setExpandedKeys([]);
      }
    }
  };

  // 递归检查模块是否存在
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

  // 构建树节点数据，处理搜索高亮
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
                  color: colors.error[500],
                  // backgroundColor: colors.error[50],
                  padding: `${spacing.xs / 2}px ${spacing.xs}px`,
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
  }, [modules, searchValue]);

  const handleReload = () => {
    setReload(reload + 1);
  };

  // 拖拽排序
  const onDrop: TreeProps['onDrop'] = async (info) => {
    const { code } = await dropModule({
      id: info.dragNode.key,
      targetId: info.dropToGap ? null : info.node.key,
    });
    if (code === 0) handleReload();
  };

  // 右键菜单项
  const menuItem = (node: IModule): MenuProps['items'] => {
    return [
      {
        key: '1',
        label: (
          <Text
            strong
            style={{
              fontSize: typography.fontSize.base,
              color: colors.neutral[700],
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
        icon: <EditOutlined style={{ color: colors.primary[500] }} />,
      },
      {
        key: '2',
        label: (
          <Text
            strong
            style={{
              fontSize: typography.fontSize.base,
              color: colors.error[500],
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
                你确定要删除这个目录吗?
              </span>
            ),
            icon: (
              <ExclamationCircleOutlined
                style={{ color: colors.warning[500] }}
              />
            ),
            okText: '确定',
            okType: 'danger',
            cancelText: '点错了',
            okButtonProps: {
              style: {
                borderRadius: borderRadius.md,
                fontWeight: typography.fontWeight.medium,
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
        icon: <DeleteOutlined style={{ color: colors.error[500] }} />,
      },
    ];
  };

  // 树节点渲染
  const TreeTitleRender = (tree: any) => {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          borderRadius: borderRadius.md,
          margin: `${spacing.xs}px 0`,
          cursor: 'pointer',
        }}
        onClick={() => setCurrentModule(tree)}
      >
        <Space align="center" style={{ flex: 1, minWidth: 0 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Text strong>{tree.title}</Text>

            {tree.count > 0 && (
              <Badge
                count={tree.count}
                size="small"
                style={{
                  marginLeft: spacing.sm,
                  fontSize: typography.fontSize.xs,
                  fontWeight: typography.fontWeight.medium,
                }}
              />
            )}
          </div>
        </Space>

        {isAdmin && currentModule && currentModule.key === tree.key && (
          <Space
            style={{
              marginLeft: spacing.sm,
              ...styleHelpers.transition(['opacity']),
            }}
            size={spacing.xs}
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
                  color: colors.primary[500],
                  borderRadius: borderRadius.sm,
                  width: 24,
                  height: 24,
                  minWidth: 24,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  ...styleHelpers.transition(['background-color', 'color']),
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
                  borderRadius: borderRadius.sm,
                  width: 24,
                  height: 24,
                  minWidth: 24,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  ...styleHelpers.transition(['background-color', 'color']),
                }}
              />
            </Dropdown>
          </Space>
        )}
      </div>
    );
  };

  // 搜索框变化，自动展开匹配的节点
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

  // 模块操作完成回调
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
            {/* 搜索区域卡片 */}
            <ProCard
              size="small"
              style={{
                marginBottom: spacing.lg,
                borderRadius: borderRadius.xl,
                borderLeft: `4px solid ${colors.primary[500]}`,
                border: `1px solid ${colors.primary[100]}`,
                boxShadow: shadows.card,
                ...styleHelpers.transition(['box-shadow']),
              }}
              bodyStyle={{ padding: spacing.md }}
            >
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
                  <Text
                    strong
                    style={{
                      fontSize: typography.fontSize.md,
                      fontWeight: typography.fontWeight.semibold,
                    }}
                  >
                    模块目录
                  </Text>
                  {isAdmin && (
                    <Tooltip title="新建根模块" placement="left">
                      <Button
                        type="link"
                        size="small"
                        icon={<PlusOutlined />}
                        onClick={() => {
                          setHandleModule(Handle.AddRoot);
                          setCurrentModule(null);
                          setOpen(true);
                        }}
                        style={{
                          borderRadius: borderRadius.md,
                          padding: `0 ${spacing.sm}px`,
                          height: 28,
                          fontSize: typography.fontSize.xs,
                          fontWeight: typography.fontWeight.medium,
                          color: colors.primary[600],
                          ...styleHelpers.transition([
                            'background-color',
                            'color',
                          ]),
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
                    <SearchOutlined style={{ color: colors.neutral[500] }} />
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
                maxHeight: 'calc(100vh - 300px)',
                overflowY: 'auto',
              }}
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
                    padding: spacing.sm,
                    borderTop: `1px solid ${colors.functional.divider}`,
                    fontSize: typography.fontSize.xs,
                    textAlign: 'center',
                    fontWeight: typography.fontWeight.medium,
                    borderRadius: `0 0 ${borderRadius.md}px ${borderRadius.md}px`,
                  }}
                >
                  共 {modules.length} 个模块 •{' '}
                  {
                    modules.filter((m) => m.children && m.children.length > 0)
                      .length
                  }{' '}
                  个文件夹
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

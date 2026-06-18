import { IModule } from '@/api';
import React from 'react';

export const module2Tree = (modules: IModule[]) => {
  const treeData: any[] = [];
  const traverse = (data: any[]) => {
    for (let i = 0; i < data.length; i++) {
      const node = data[i];
      treeData.push(node);
      if (node.children) {
        traverse(node.children);
      }
    }
  };
  traverse(modules);
  return treeData;
};

export const getParentKey = (key: React.Key, tree: IModule[]): React.Key => {
  let parentKey: React.Key;
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i];
    if (node.children) {
      if (node.children.some((item) => item.key === key)) {
        parentKey = node.key;
      } else if (getParentKey(key, node.children)) {
        parentKey = getParentKey(key, node.children);
      }
    }
  }
  return parentKey!;
};

export const setLocalStorageModule = (module_type: number, data: string) => {
  localStorage.setItem('module_type_' + module_type, data);
};

export const getLocalStorageModule = (module_type: number) => {
  return localStorage.getItem('module_type_' + module_type);
};

/**
 * 按 module_id 聚合的 case 数 Map, 走 fetchAllCaseIdsByModule 的结果
 * - key=module_id (number)  -> 该目录直接挂载的用例数
 * - 实际渲染的 count 由 applyRecursiveCounts 自底向上累加 (自身 + 全部后代)
 */
export type CaseCountMap = Map<number, number>;

/**
 * 递归聚合: 把每节点的 count 设为"自身 + 全部后代"的总和
 * - 不改原对象, 返回新树 (原 module 引用保持 -> 配合 React key 不重渲染)
 * - 后端若已带 count 字段, 这里会覆盖 (以聚合结果为准, 避免后端只给了自身数)
 *
 * @param modules  从 queryTreeModuleByProject 拿到的树
 * @param directCounts  module_id -> 该目录下直接挂载的用例数 (来自 fetchAllCaseIdsByModule)
 */
export const applyRecursiveCounts = (
  modules: IModule[],
  directCounts: CaseCountMap,
): IModule[] => {
  const visit = (node: IModule): IModule => {
    const own = directCounts.get(node.key) ?? 0;
    const children = (node.children ?? []).map(visit);
    const childrenSum = children.reduce((acc, c) => acc + (c.count ?? 0), 0);
    return {
      ...node,
      count: own + childrenSum,
      children: children.length > 0 ? children : node.children,
    };
  };
  return modules.map(visit);
};

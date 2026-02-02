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

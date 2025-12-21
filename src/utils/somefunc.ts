import { IModule, IModuleEnum } from '@/api';
import { queryTreeModuleByProject } from '@/api/base';
import React, { useEffect, useState } from 'react';

export const pageData = async (code: number, data: any, setter?: any) => {
  if (code === 0) {
    if (setter) {
      setter(data.items);
    }
    return {
      data: data.items,
      total: data.pageInfo.total,
      success: true,
      pageSize: data.pageInfo.page,
      current: data.pageInfo.limit,
    };
  }
  return {
    data: [],
    success: false,
    total: 0,
  };
};

export const queryData = async (code: number, data: any, setter?: any) => {
  if (code === 0) {
    if (setter) {
      setter(data);
    }
    return {
      data: data,
      total: data.length,
      success: true,
    };
  }
  return {
    data: [],
    success: false,
    total: 0,
  };
};

export const data2LabelValue = (data: any) => {
  return data?.map((item: any) => ({
    label: item.title,
    value: item.id,
  }));
};

/**
 * 获取模块
 * @param projectId
 * @param module_Type
 * @param setModuleEnum
 */
export const fetchModulesEnum = async (
  projectId: number | string,
  module_Type: number,
  setModuleEnum: React.Dispatch<React.SetStateAction<IModuleEnum[]>>,
) => {
  const { code, data } = await queryTreeModuleByProject(projectId, module_Type);
  if (code === 0) {
    setModuleEnum(loopData(data));
  } else {
    setModuleEnum([]);
  }
};

const loopData = (data: IModule[]): IModuleEnum[] => {
  return data.map((item) => {
    if (item.children) {
      return {
        title: item.title,
        value: item.key,
        children: loopData(item.children),
      };
    }
    return { title: item.title, value: item.key };
  });
};

export const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

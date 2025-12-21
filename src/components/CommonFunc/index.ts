import { IEnv, IModule, IModuleEnum } from '@/api';
import { queryEnvBy, queryProject } from '@/api/base';
import React from 'react';

export const queryProjects = async (
  setter: React.Dispatch<
    React.SetStateAction<
      {
        label: string;
        value: number;
      }[]
    >
  >,
) => {
  queryProject().then(({ code, data }) => {
    if (code === 0) {
      const projects = data.map((item) => ({
        label: item.title,
        value: item.id,
      }));
      setter(projects);
      return projects;
    }
    return [];
  });
};

export const queryProjectEnum = async (
  setter: React.Dispatch<React.SetStateAction<any>>,
) => {
  queryProject().then(({ code, data }) => {
    if (code === 0) {
      const mapData = data.reduce((acc: any, obj) => {
        acc[obj.id] = { text: obj.title };
        return acc;
      }, {});
      setter(mapData);
    }
  });
};

export const queryEnvByProjectId = async (
  project_id: number,
  setEnv: React.Dispatch<
    React.SetStateAction<{ key: number; label: string; value: number }[]>
  >,
  noEnv: boolean,
) => {
  queryEnvBy({ project_id: project_id } as IEnv).then(
    async ({ code, data }) => {
      if (code === 0) {
        // 请求成功
        const envs = data.map((item) => ({
          label: item.name,
          key: item.id,
          value: item.id,
        }));
        if (noEnv) {
          const noEnv = { label: '自定义', key: 99999, value: 99999 };
          setEnv([noEnv, ...envs]); // 设置环境列表
        } else {
          setEnv(envs); // 设置环境列表
        }
      }
    },
  );
};

export const queryEnvByProjectIdFormApi = async (
  projectId: number | string,
  setter: React.Dispatch<
    React.SetStateAction<{ label: string; value: number | null }[]>
  >,
  noEnv: boolean,
) => {
  queryEnvBy({ project_id: projectId } as IEnv).then(async ({ code, data }) => {
    if (code === 0) {
      // 请求成功
      const envs = data.map((item) => ({
        label: item.name,
        value: item.id,
      }));
      if (noEnv) {
        const noEnv = { label: '自定义', value: -1 };
        setter([noEnv, ...envs]); // 设置环境列表
      } else {
        setter(envs); // 设置环境列表
      }
    }
  });
};

export const loopModule = (data: IModule[]): IModuleEnum[] => {
  return data.map((item) => {
    if (item.children) {
      return {
        title: item.title,
        value: item.key,
        children: loopModule(item.children),
      };
    }
    return { title: item.title, value: item.key };
  });
};

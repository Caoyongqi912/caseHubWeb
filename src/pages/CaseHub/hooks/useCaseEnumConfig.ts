/**
 * @file pages/CaseHub/hooks/useCaseEnumConfig.ts
 * @description 通用枚举配置 Hook（用例等级 / 状态 / 评审状态 / 用例类型）
 *
 * 设计要点：
 * 1. 模块级 promise 缓存：同一 configKey 同一时刻只发一次请求，避免重复打接口
 * 2. 订阅模型：所有调用方共享一份数据，组件 unmount 不影响其他订阅者
 * 3. 失败 / 禁用：拉取失败时返回空数组，由消费方自行处理空态
 * 4. 主动刷新：提供 refresh() 便于在配置中心修改后拉新数据
 *
 * 用法：
 *   const { options, loading, error, refresh } = useCaseEnumConfig('CASE_LEVEL');
 */

import { queryCaseEnumConfig } from '@/api/case/caseConfig';
import { useCallback, useEffect, useState } from 'react';
import { CaseEnumOption, transformEnumDataToOptions } from './caseEnumOption';

interface CacheEntry {
  /** 解析后的选项（按 sort 升序、过滤 enabled=false） */
  data: CaseEnumOption[];
  /** 是否正在拉取中 */
  loading: boolean;
  /** 是否拉取失败过（用于 UI 提示） */
  error: boolean;
  /** 拉取中或已完成的 Promise，用于去重 */
  inflight?: Promise<void>;
}

const cache = new Map<string, CacheEntry>();
const subscribers = new Map<string, Set<() => void>>();

const ensureEntry = (configKey: string): CacheEntry => {
  let entry = cache.get(configKey);
  if (!entry) {
    entry = { data: [], loading: false, error: false };
    cache.set(configKey, entry);
  }
  return entry;
};

const notify = (configKey: string) => {
  subscribers.get(configKey)?.forEach((cb) => cb());
};

const load = (configKey: string): Promise<void> => {
  const entry = ensureEntry(configKey);
  // 已有进行中的请求：复用
  if (entry.inflight) return entry.inflight;

  entry.loading = true;
  entry.error = false;
  notify(configKey);

  entry.inflight = queryCaseEnumConfig(configKey)
    .then((res) => {
      if (res?.code === 0 && Array.isArray(res.data)) {
        entry.data = transformEnumDataToOptions(res.data);
        entry.error = false;
      } else {
        entry.data = [];
        entry.error = res?.code !== 0;
      }
    })
    .catch(() => {
      entry.data = [];
      entry.error = true;
    })
    .finally(() => {
      entry.loading = false;
      entry.inflight = undefined;
      notify(configKey);
    });

  return entry.inflight;
};

export interface UseCaseEnumConfigResult {
  /** 解析后的选项列表（按 sort 升序，已过滤 enabled=false） */
  options: CaseEnumOption[];
  /** 是否正在拉取 */
  loading: boolean;
  /** 是否拉取失败 */
  error: boolean;
  /** 主动刷新（覆盖缓存并重新请求） */
  refresh: () => Promise<void>;
}

/**
 * 拉取指定 configKey 的枚举配置
 * 多次调用同一 configKey 只会触发一次实际请求
 */
export const useCaseEnumConfig = (
  configKey: string,
): UseCaseEnumConfigResult => {
  const entry = ensureEntry(configKey);
  // 订阅模型：cache 变化时强制重渲以读到新 entry 内容
  // 实际数据来自模块级 cache（每次 load 完成后整 entry 引用会"换"）
  const [, setVersion] = useState(0);

  useEffect(() => {
    const set = subscribers.get(configKey) ?? new Set<() => void>();
    const cb = () => setVersion((n) => n + 1);
    set.add(cb);
    subscribers.set(configKey, set);

    // 首次进入：若尚未拉取过，触发加载
    if (!entry.loading && !entry.inflight && entry.data.length === 0) {
      void load(configKey);
    }

    return () => {
      set.delete(cb);
    };
    // 只在 configKey 变化时重订阅；entry 引用每次 render 都新，但 effect 只在初始化时跑
  }, [configKey]);

  // refresh 引用稳定，依赖空数组
  const refresh = useCallback(() => load(configKey), [configKey]);

  return {
    options: entry.data,
    loading: entry.loading,
    error: entry.error,
    refresh,
  };
};

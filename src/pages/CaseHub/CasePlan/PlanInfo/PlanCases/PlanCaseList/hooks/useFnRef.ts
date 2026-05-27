/**
 * @file PlanCaseList/hooks/useFnRef.ts
 * @description 工具 hook：用于保持回调函数引用的稳定性
 * 解决在 useCallback/useEffect 中使用回调函数时的闭包陷阱问题
 */

import { useCallback, useEffect, useRef } from 'react';

/**
 * 保持回调函数引用稳定
 * 返回的 ref 始终指向最新的回调函数，避免因依赖变化导致的不必要重渲染
 *
 * @param fn - 需要保持引用的回调函数
 * @returns 一个 ref 对象，其 current 属性始终指向最新的 fn
 *
 * @example
 * const onClickRef = useFnRef(onClick);
 *
 * useEffect(() => {
 *   button.onclick = onClickRef.current;
 * }, []);
 */
export const useFnRef = <T extends (...args: unknown[]) => unknown>(
  fn: T,
): React.MutableRefObject<T> => {
  const fnRef = useRef(fn);

  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  return fnRef;
};

/**
 * 批量保持多个回调函数引用稳定
 * 支持可选的回调函数（undefined 或带 optional 标记的函数）
 * 支持具体的参数类型定义
 *
 * @param callbacks - 回调函数对象
 * @returns 一个 ref 对象，包含所有最新的回调函数
 *
 * @example
 * const callbacksRef = useFnsRef({
 *   onSave,
 *   onDelete,
 *   onCancel,
 * });
 *
 * useEffect(() => {
 *   modal.onOk = callbacksRef.current.onSave;
 * }, []);
 */
export const useFnsRef = <
  T extends Record<string, ((...args: never[]) => unknown) | undefined>,
>(
  callbacks: T,
): React.MutableRefObject<T> => {
  const callbacksRef = useRef(callbacks);

  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  return callbacksRef;
};

/**
 * 保持异步函数引用稳定
 * 与 useFnRef 类似，但专门处理异步操作场景
 *
 * @param asyncFn - 异步回调函数
 * @returns 一个 ref 对象，其 current 属性始终指向最新的 asyncFn
 */
export const useAsyncFnRef = <
  T extends (...args: unknown[]) => Promise<unknown>,
>(
  asyncFn: T,
): React.MutableRefObject<T> => {
  const asyncFnRef = useRef(asyncFn);

  useEffect(() => {
    asyncFnRef.current = asyncFn;
  }, [asyncFn]);

  return asyncFnRef;
};

/**
 * 创建稳定的事件处理器包装器
 * 用于需要稳定函数引用但不改变原函数行为的场景
 *
 * @param handler - 原事件处理器
 * @returns 包装后的事件处理器
 *
 * @example
 * const handleClick = useEventHandler((e) => {
 *   doSomething(e);
 * });
 */
export const useEventHandler = <E extends React.SyntheticEvent>(
  handler: (event: E) => void,
): ((event: E) => void) => {
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  return useCallback((event: E) => {
    handlerRef.current(event);
  }, []);
};

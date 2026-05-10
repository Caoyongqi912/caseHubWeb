import type { NodeObj } from 'mind-elixir/dist/types/types';

export type MindNode = NodeObj;

export const exportAsJson = (
  data: MindNode,
  filename: string = 'mindmap.json',
): void => {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

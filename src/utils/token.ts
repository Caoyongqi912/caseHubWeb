export function setToken(token: string) {
  return localStorage.setItem('TOKEN', token);
}

export function getToken() {
  return localStorage.getItem('TOKEN');
}

export function clearToken() {
  return localStorage.clear();
}

export const setThem = (t: string) => {
  return localStorage.setItem('app-theme', t);
};
export const getThem = () => {
  return localStorage.getItem('app-theme');
};

// 工具函数放在单独的文件中（如 utils/splitter.ts）
export const setSplitter = (
  key: string,
  left: number,
  right: number,
): boolean => {
  try {
    localStorage.setItem(key, `${left}:${right}`);
    return true;
  } catch (error) {
    console.error(`Failed to save splitter position for key ${key}:`, error);
    return false;
  }
};

export const getSplitter = (
  key: string,
): { left: number; right: number } | null => {
  try {
    const value = localStorage.getItem(key);
    if (!value) return null;

    const [leftStr, rightStr] = value.split(':');
    const left = parseFloat(leftStr);
    const right = parseFloat(rightStr);

    if (isNaN(left) || isNaN(right)) {
      console.warn(`Invalid splitter value for key ${key}: ${value}`);
      return null;
    }

    return { left, right };
  } catch (error) {
    console.error(`Failed to get splitter position for key ${key}:`, error);
    return null;
  }
};

export const clearSplitter = (key: string): boolean => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Failed to clear splitter position for key ${key}:`, error);
    return false;
  }
};

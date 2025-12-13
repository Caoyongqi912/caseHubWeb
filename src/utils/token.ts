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

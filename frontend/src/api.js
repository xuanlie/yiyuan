import { api } from './api-client';
// 扩展 api：token 过期时跳转登录
const originalRequest = api.request.bind(api);
api.request = async function(...args) {
  try {
    return await originalRequest(...args);
  } catch (e) {
    if (e.message === 'Unauthorized') {
      api.logout();
      window.location.href = '/login';
    }
    throw e;
  }
};
export { api };
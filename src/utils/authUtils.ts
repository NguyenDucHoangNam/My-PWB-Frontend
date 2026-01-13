// Global logout function for axios interceptor
export const globalLogout = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  // Force redirect to login page
  // window.location.href = '/login';
};

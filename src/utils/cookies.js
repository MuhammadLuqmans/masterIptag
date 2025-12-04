/**
 * Cookie utility functions
 */

/**
 * Get a cookie value by name
 * @param {string} name - The name of the cookie
 * @returns {string|null} The cookie value or null if not found
 */
export const getCookie = (name) => {
  return localStorage.getItem(name);
  // const value = `; ${document.cookie}`;
  // const parts = value.split(`; ${name}=`);
  // if (parts.length === 2) return parts.pop().split(";").shift();
  // return null;
};

/**
 * Set a cookie
 * @param {string} name - The name of the cookie
 * @param {string} value - The value to store
 * @param {number} maxAge - Maximum age in seconds (default: 900 = 15 minutes)
 * @param {string} path - Cookie path (default: '/')
 */
export const setCookie = (name, value, maxAge = 900, path = "/") => {
  localStorage.setItem('placeId', value);
  document.cookie = `${name}=${value}; max-age=${maxAge}; path=${path}`;
};

/**
 * Delete a cookie by name
 * @param {string} name - The name of the cookie to delete
 * @param {string} path - Cookie path (default: '/')
 */
export const deleteCookie = (name, path = "/") => {
  document.cookie = `${name}=; max-age=0; path=${path}`;
};

/**
 * Clear all application cookies
 * This function removes all cookies related to the app:
 * - placeId: The current business/activity ID
 * - activityName: The cached activity name
 * - activityLogo: The cached activity logo URL
 * @param {string} path - Cookie path (default: '/')
 */
export const clearAllCookies = (path = "/") => {
  const appCookies = ["placeId", "activityName", "activityLogo"];
  appCookies.forEach((name) => {
    deleteCookie(name, path);
  });
};

export function getToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("workstation-token");
}

export function setToken(token: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("workstation-token", token);
}

export function removeToken() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem("workstation-token");
}

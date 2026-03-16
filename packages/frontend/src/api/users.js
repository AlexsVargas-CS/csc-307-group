const API_BASE = `${import.meta.env?.VITE_API_URL || ""}/api`;

export async function searchUsers(query) {
  const params = new URLSearchParams({ query });
  const res = await fetch(
    `${API_BASE}/users/search?${params}`,
  );
  if (!res.ok)
    throw new Error("User search failed");
  return res.json();
}

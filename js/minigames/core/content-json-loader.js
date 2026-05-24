const JSON_CACHE = new Map();

export async function loadContentJson(path) {
  if (JSON_CACHE.has(path)) {
    return JSON_CACHE.get(path);
  }

  const promise = fetch(path).then(async (response) => {
    if (!response.ok) {
      throw new Error(`Content load failed for ${path}: ${response.status}`);
    }
    return response.json();
  });

  JSON_CACHE.set(path, promise);
  return promise;
}

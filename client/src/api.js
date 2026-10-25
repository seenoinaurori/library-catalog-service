export async function getJson(path, signal) {
  let response;

  try {
    response = await fetch(path, { signal, headers: { Accept: 'application/json' } });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new Error('Could not connect to the library catalog. Check that the API is running.');
  }

  let payload;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(payload?.error || `The request failed (${response.status}).`);
  }

  return payload;
}

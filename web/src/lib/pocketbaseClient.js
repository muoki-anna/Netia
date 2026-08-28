import Pocketbase from 'pocketbase';

// Use the local PocketBase instance during development so local sign-ups appear
// in the dashboard at http://127.0.0.1:8090/_/.
const POCKETBASE_API_URL = import.meta.env.DEV
  ? 'http://127.0.0.1:8090'
  : '/hcgi/platform';

const pocketbaseClient = new Pocketbase(POCKETBASE_API_URL);

export default pocketbaseClient;
export { pocketbaseClient };

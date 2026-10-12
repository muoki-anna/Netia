import Pocketbase from 'pocketbase';

// Use the local PocketBase instance during development so local sign-ups appear
// in the dashboard at http://127.0.0.1:8090/_/.
const POCKETBASE_API_URL =
  import.meta.env.VITE_POCKETBASE_URL ||
  (typeof window !== 'undefined' && window.location.hostname
    ? `${window.location.protocol}//${window.location.hostname}:8090`
    : 'http://netiaxke.com:8090');

const pocketbaseClient = new Pocketbase(POCKETBASE_API_URL);

export default pocketbaseClient;
export { pocketbaseClient };

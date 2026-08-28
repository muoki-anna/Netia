export default async function authMiddleware(req, res, next) {
  const reject = () => res.status(401).json({ error: 'Unauthorized' });
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return reject();
  const token = header.slice('Bearer '.length).trim();
  try {
    const response = await fetch('http://localhost:8090/api/collections/users/auth-refresh', {
      method: 'POST',
      headers: { Authorization: token },
    });
    if (!response.ok) return reject();
    const data = await response.json();
    if (!data?.record?.id) return reject();
    req.user = { id: data.record.id };
  } catch {
    return reject();
  }
  return next();
}

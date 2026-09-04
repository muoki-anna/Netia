import pocketbaseClient from '@/lib/pocketbaseClient';

export async function getBlogs({ limit = 50, offset = 0, sort = '-created' } = {}) {
  const page = Math.floor(offset / limit) + 1;
  const result = await pocketbaseClient.collection('blogs').getList(page, limit, {
    sort,
  });

  return {
    items: result.items,
    total: result.totalItems,
  };
}

export async function getBlogBySlug(slug) {
  try {
    return await pocketbaseClient.collection('blogs').getFirstListItem(`slug="${slug}"`);
  } catch (error) {
    if (error.status === 404) return null;
    throw error;
  }
}

export async function createBlog(data) {
  return await pocketbaseClient.collection('blogs').create(data);
}

export async function updateBlog(id, data) {
  return await pocketbaseClient.collection('blogs').update(id, data);
}

export async function deleteBlog(id) {
  return await pocketbaseClient.collection('blogs').delete(id);
}

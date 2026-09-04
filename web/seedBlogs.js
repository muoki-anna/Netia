import { posts } from './src/data/blogData.js';

// Requires PocketBase running locally on 8090
const PB_URL = 'http://127.0.0.1:8090/api/collections/blogs/records';

async function seed() {
  for (const post of posts) {
    console.log(`Seeding: ${post.title}`);
    
    // Convert date string to ISO date
    const dateObj = new Date(post.date);

    const data = {
      title: post.title,
      slug: post.slug,
      category: post.category,
      author: post.author || 'NetiaX Agronomy Team',
      date: dateObj.toISOString(),
      readTime: post.readTime,
      image: post.image,
      excerpt: post.excerpt,
      content: post.content, // array of strings
      related: post.related || []
    };

    try {
      const res = await fetch(PB_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        const err = await res.text();
        console.error(`Failed to seed ${post.slug}: ${err}`);
      } else {
        console.log(`Successfully seeded ${post.slug}`);
      }
    } catch (e) {
      console.error(e);
    }
  }
}

seed();

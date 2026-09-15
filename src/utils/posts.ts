import { getCollection } from 'astro:content';

export interface PostMeta {
  slug: string;
  title: string;
  description: string;
  datePublished: string;
  readMinutes: number;
  category: string;
  cover?: any;
}

// Ensure you have a 'blog' collection in your src/content directory
const allPosts = await getCollection('blog').catch(() => []);

export const posts: PostMeta[] = allPosts.map(post => {
  // Use frontmatter or fallback for calculating read minutes
  const wordCount = post.body ? post.body.split(/\s+/).length : 5000;
  const readMinutes = Math.ceil(wordCount / 200);

  let category = "ENGINEERING GUIDE";
  if (post.data.tags && post.data.tags.includes('strategy guide')) {
    category = "STRATEGY & ARCHITECTURE";
  }

  return {
    slug: post.slug,
    title: post.data.title,
    description: post.data.description,
    datePublished: new Date(post.data.pubDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    readMinutes,
    category,
    cover: post.data.cover,
  };
}).sort((a, b) => new Date(b.datePublished).getTime() - new Date(a.datePublished).getTime());

export const strategyPosts = posts.filter(p => p.category === "STRATEGY & ARCHITECTURE");
export const engineeringPosts = posts.filter(p => p.category === "ENGINEERING GUIDE");

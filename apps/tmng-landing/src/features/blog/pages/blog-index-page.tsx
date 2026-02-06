import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { ENDPOINTS } from "@/config/endpoints";
import NewsletterForm from "@/features/blog/newsletter-form";
import { QueryProvider } from "@/providers/query-provider";
import { type Post } from "../types";

// Simple React Post Card
function PostCard({ post }: { post: Post }) {
    return (
        <div className="flex flex-col bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all cursor-pointer group h-full">
            <div className="h-48 overflow-hidden relative bg-purple-100">
                <img 
                    src={post.coverImage || "/images/blog/default.png"} 
                    alt={post.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                />
            </div>
            <div className="p-6 flex flex-col grow">
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-bold text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                        {post.categories?.[0]?.name || "Article"}
                    </span>
                    <span className="text-xs text-gray-500">
                        {new Date(post.publishedAt).toLocaleDateString()}
                    </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors line-clamp-2">
                    {post.title}
                </h3>
                <p className="text-gray-600 text-sm line-clamp-3 mb-4 grow">
                    {post.excerpt}
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-xs font-bold overflow-hidden">
                        {post.author?.avatar ? (
                            <img src={post.author.avatar} alt={post.author.name} className="w-full h-full object-cover" />
                        ) : (
                            post.author?.name?.substring(0, 2).toUpperCase() || "TM"
                        )}
                    </div>
                    <div className="text-xs">
                        <div className="font-bold text-gray-900">{post.author?.name || "Team TMNG"}</div>
                        <div className="text-gray-500">{post.readTimeMinutes || 5} min read</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Internal component containing the logic
function BlogIndexContent() {

  // Fetch posts list using TanStack Query
  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ['posts', 'list'],
    queryFn: async ({ signal }) => {
      const res = await apiClient.get(`${ENDPOINTS.PUBLIC.POSTS}?limit=10`, { signal });
      return res.data.data as Post[];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fetch featured post using TanStack Query
  const { data: featuredData, isLoading: featuredLoading } = useQuery({
    queryKey: ['posts', 'featured'],
    queryFn: async ({ signal }) => {
      const res = await apiClient.get(`${ENDPOINTS.PUBLIC.POSTS}/featured?isFeatured=true&limit=1`, { signal });
      return res.data.data?.[0] as Post | undefined;
    },
    staleTime: 5 * 60 * 1000,
  });

  const posts = postsData || [];
  const featuredPost = featuredData || null;
  const loading = postsLoading || featuredLoading;

  // RENDER LOADING
  if (loading) {
      return (
          <div className="min-h-screen pt-32 pb-20 flex justify-center">
              <div className="animate-spin w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full"></div>
          </div>
      );
  }

  // RENDER EMPTY / ERROR
  if (posts.length === 0 && !loading) {
      return (
        <div className="min-h-screen pt-32 pb-20 flex flex-col items-center justify-center text-center px-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No posts found</h2>
            <p className="text-gray-600 mb-8 max-w-md">
                We couldn't load the articles. Please make sure the API is running or try again later.
            </p>
            <button 
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
            >
                Retry
            </button>
        </div>
      );
  }

  // RENDER LIST
  return (
    <div className="bg-white min-h-screen">
        {favoritePostSection(featuredPost)}

        <section className="py-20 bg-slate-50 border-t border-gray-200">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {posts.map(post => (
                            <a href={`/blog/${post.slug}`} key={post.slug} className="block h-full"> 
                                <PostCard post={post} /> 
                            </a>
                        ))}
                    </div>
                </div>
                
                <div className="lg:col-span-1">
                    <div className="sticky top-32">
                         <div className="bg-purple-600 rounded-3xl p-8 text-white relative overflow-hidden">
                             <div className="relative z-10">
                                 <h3 className="text-xl font-bold mb-2">Weekly Digest</h3>
                                 <p className="text-purple-200 text-sm mb-6">Get the latest updates directly in your inbox.</p>
                                 <NewsletterForm />
                             </div>
                         </div>
                    </div>
                </div>
            </div>
        </section>
    </div>
  );
}

// Helper for featured post section with links
function favoritePostSection(featuredPost: Post | null) {
  if (!featuredPost) return null;
  return (
      <section className="pt-32 pb-20 relative">
          <div className="max-w-7xl mx-auto px-6">
              <div className="mb-12">
                  <span className="text-purple-600 font-bold uppercase tracking-wider text-sm">Featured Post</span>
                  <h1 className="text-4xl text-gray-900 font-bold mt-2">Latest Insights</h1>
              </div>
              
              <a href={`/blog/${featuredPost.slug}`} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center cursor-pointer group">
                  <div className="lg:col-span-7 h-64 lg:h-96 rounded-3xl overflow-hidden shadow-2xl relative">
                      <img 
                          src={featuredPost.coverImage || "/images/blog/default.png"} 
                          alt={featuredPost.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                  </div>
                  <div className="lg:col-span-5">
                      <div className="flex items-center gap-3 mb-4">
                          <span className="px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded-full">
                              {featuredPost.categories?.[0]?.name || "Highlight"}
                          </span>
                          <span className="text-gray-500 text-sm">
                              {new Date(featuredPost.publishedAt).toLocaleDateString()}
                          </span>
                      </div>
                      <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 group-hover:text-purple-600 transition-colors">
                          {featuredPost.title}
                      </h2>
                      <p className="text-gray-600 text-lg mb-6 line-clamp-3">
                          {featuredPost.excerpt}
                      </p>
                  </div>
              </a>
          </div>
      </section>
  );
}

// Export wrapper with QueryProvider
export function BlogIndexPage() {
  return (
    <QueryProvider>
      <BlogIndexContent />
    </QueryProvider>
  );
}

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { ENDPOINTS } from "@/config/endpoints";
import { marked } from "marked";
import { type Post } from "../types";
import { QueryProvider } from "@/providers/query-provider";

interface Props {
  slug: string;
}

function BlogDetailPage({ slug }: Props) {
  // Fetch Detail
  const { data: post, isLoading, error } = useQuery({
    queryKey: ['post', slug],
    queryFn: async ({ signal }) => {
      if (!slug) return null;
      const res = await apiClient.get(`${ENDPOINTS.PUBLIC.POSTS}/${slug}`, { signal });
      const p = res.data.data;
      if (p?.content) {
        p.contentHtml = await marked.parse(p.content);
      }
      return p as Post;
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading || !post || error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-white">
           {error ? <p>Failed to load post</p> : <div className="animate-spin w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full"></div>}
        </div>
      );
  }

  return (
    <article className="min-h-screen bg-white text-gray-900 pb-20 font-sans selection:bg-purple-100 selection:text-purple-900">
        
        {/* Hero Section */}
        <header className="relative w-full max-w-5xl mx-auto px-6 pt-32 pb-12 text-center">
            {/* Categories */}
            <div className="flex justify-center gap-2 mb-6 animate-fade-in-up">
                {post.categories?.map((c) => (
                    <span key={c.slug} className="px-4 py-1.5 bg-purple-50 text-purple-700 rounded-full text-xs font-bold tracking-wide uppercase hover:bg-purple-100 transition-colors">
                        {c.name}
                    </span>
                ))}
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 mb-8 leading-[1.1] animate-fade-in-up delay-100">
                {post.title}
            </h1>

            {/* Meta */}
            <div className="flex items-center justify-center gap-6 md:gap-8 text-gray-500 animate-fade-in-up delay-200">
                <div className="flex items-center gap-3 text-left">
                     <div className="w-12 h-12 rounded-full bg-gray-100 border border-gray-200 overflow-hidden shrink-0">
                        {post.author?.avatar ? (
                             <img src={post.author.avatar} alt={post.author.name} className="w-full h-full object-cover" />
                        ) : (
                             <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold bg-gray-50">
                                {post.author?.name?.charAt(0) || "T"}
                             </div>
                        )}
                     </div>
                     <div>
                         <div className="font-bold text-gray-900 text-sm">{post.author?.name || "Team TMNG"}</div>
                         <div className="text-xs">{post.author?.role || "Editor"}</div>
                     </div>
                </div>
                <div className="h-8 w-px bg-gray-200"></div>
                <div className="text-sm font-medium">
                    {new Date(post.publishedAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}
                </div>
                <div className="h-8 w-px bg-gray-200"></div>
                <div className="text-sm font-medium">
                    {post.readTimeMinutes || 5} min read
                </div>
            </div>
        </header>

        {/* Featured Image */}
        <div className="max-w-6xl mx-auto px-4 md:px-6 mb-16 animate-fade-in-up delay-300">
            <div className="relative aspect-21/9 rounded-3xl overflow-hidden shadow-2xl">
                 <img 
                    src={post.coverImage || "/images/blog/default.png"} 
                    alt={post.title} 
                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-1000"
                 />
                 <div className="absolute inset-0 ring-1 ring-black/10 rounded-3xl"></div>
            </div>
        </div>

        {/* Content Content */}
        <div className="max-w-3xl mx-auto px-6 animate-fade-in-up delay-500">
            <div 
                className="prose prose-lg md:prose-xl prose-slate prose-headings:font-bold prose-headings:tracking-tight prose-a:text-purple-600 hover:prose-a:text-purple-700 prose-img:rounded-2xl prose-img:shadow-lg prose-quoteless"
                dangerouslySetInnerHTML={{ __html: post.contentHtml || "" }} 
            />
            
            {/* Tags / Share */}
            <div className="mt-16 pt-8 border-t border-gray-100">
                 <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                     <div className="text-gray-500 text-sm font-medium">
                         Share this article
                     </div>
                     <div className="flex gap-4">
                         {/* Simple Share Buttons (Placeholders) */}
                         {['Twitter', 'LinkedIn', 'Facebook'].map(network => (
                             <button key={network} className="px-4 py-2 rounded-full border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-purple-600 transition-colors cursor-pointer">
                                 {network}
                             </button>
                         ))}
                     </div>
                 </div>
            </div>
        </div>

        {/* Author Box */}
        <div className="max-w-3xl mx-auto px-6 mt-20">
            <div className="bg-gray-50 rounded-3xl p-8 md:p-10 flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8 text-center md:text-left">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white border-4 border-white shadow-lg shrink-0 overflow-hidden">
                     {post.author?.avatar ? (
                         <img src={post.author.avatar} alt={post.author.name} className="w-full h-full object-cover" />
                     ) : (
                         <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-2xl">
                            {post.author?.name?.charAt(0) || "T"}
                         </div>
                     )}
                </div>
                <div>
                     <h3 className="text-xl font-bold text-gray-900 mb-2">Written by {post.author?.name}</h3>
                     <p className="text-gray-600 leading-relaxed mb-4">
                        {post.author?.bio || "Digital enthusiast and key contributor to the TMNG platform. Sharing insights on technology, design, and the future of web development."}
                     </p>
                     <div className="flex justify-center md:justify-start gap-4">
                         <a href="#" className="text-purple-600 font-bold text-sm hover:underline">View Profile</a>
                     </div>
                </div>
            </div>
        </div>

    </article>
  );
}

// Export wrapper with QueryProvider
export function BlogDetailPageWrapper({ slug }: Props) {
  return (
    <QueryProvider>
      <BlogDetailPage slug={slug} />
    </QueryProvider>
  );
}

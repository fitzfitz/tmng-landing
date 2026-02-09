import { usePost, useIncrementPostViews } from "../api/use-posts";
import { useParams, Link } from "react-router-dom";
import { useEffect } from "react";
import { Loader2, Calendar, Clock, User, ArrowLeft, Tag } from "lucide-react";

export function BlogDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading, error } = usePost(slug!);
  const incrementViews = useIncrementPostViews();

  useEffect(() => {
    if (!slug) return;

    // React 19 pattern: Make side effects idempotent
    // Track viewed posts in sessionStorage to prevent duplicate increments
    const viewedKey = `post_viewed_${slug}`;
    const hasViewed = sessionStorage.getItem(viewedKey);

    if (!hasViewed) {
      sessionStorage.setItem(viewedKey, "true");
      incrementViews.mutate(slug);
    }
  }, [slug, incrementViews]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Post Not Found
          </h1>
          <p className="text-gray-600 mb-8">
            The blog post you're looking for doesn't exist.
          </p>
          <Link
            to="/blog"
            className="text-purple-600 hover:text-purple-700 font-semibold"
          >
            ← Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <article className="py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Blog
        </Link>

        {/* Header */}
        <div className="max-w-4xl mx-auto">
          {/* Category */}
          {post.category && (
            <div className="mb-4">
              <span className="px-3 py-1 rounded-full text-sm font-semibold text-purple-600 bg-purple-100">
                {post.category.name}
              </span>
            </div>
          )}

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {post.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-8 pb-8 border-b border-gray-200">
            {post.author && (
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" />
                <span>{post.author.name}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span>
                {new Date(post.publishedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            {post.readingTime && (
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>{post.readingTime} min read</span>
              </div>
            )}
            {post.views && post.views > 0 && (
              <div className="flex items-center gap-2">
                <span>{post.views.toLocaleString()} views</span>
              </div>
            )}
          </div>

          {/* Cover Image */}
          {post.coverImage && (
            <div className="aspect-video rounded-2xl overflow-hidden mb-12">
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Content */}
          <div
            className="prose prose-lg prose-purple max-w-none mb-12"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="pt-8 border-t border-gray-200">
              <div className="flex items-center gap-3 flex-wrap">
                <Tag className="w-5 h-5 text-gray-600" />
                {post.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="px-3 py-1 rounded-full text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

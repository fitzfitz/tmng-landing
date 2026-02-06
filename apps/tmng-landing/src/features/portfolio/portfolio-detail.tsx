import { useState, useEffect } from "react";
import apiClient from "@/lib/api-client";
import { marked } from "marked";
import { format } from "date-fns";
import { Loader2, ArrowLeft, ExternalLink, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { QueryProvider } from "@/providers/query-provider";

type PortfolioItem = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: string;
  tags: string[];
  coverImage: string;
  client: string;
  liveUrl: string;
  repoUrl: string;
  gallery: string[];
  completedAt: string;
};

function PortfolioDetailContent() {
  const [slug, setSlug] = useState<string | null>(null);
  const [contentHtml, setContentHtml] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSlug(params.get("slug"));
  }, []);

  const { data: project, isLoading, isError } = useQuery({
    queryKey: ['portfolio', 'detail', slug],
    queryFn: async () => {
      if (!slug) throw new Error("No slug");
      const res = await apiClient.get(`/portfolio/public/${slug}`);
      if (!res.data.success) throw new Error("Failed");
      return res.data.data as PortfolioItem;
    },
    enabled: !!slug,
  });

  useEffect(() => {
    if (project?.content) {
      Promise.resolve(marked.parse(project.content)).then((html) => setContentHtml(html as string));
    }
  }, [project]);

  if (isLoading || !slug) {
    return (
      <div className="flex justify-center items-center py-32 bg-gray-900 min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-900 text-white">
        <h2 className="text-2xl font-bold mb-4">Project not found</h2>
        <Button variant="outline" as="a" href="/work">
           Back to Work
        </Button>
      </div>
    );
  }

  return (
    <article className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 md:pt-48 md:pb-24 bg-gray-900 overflow-hidden text-left">
        {project.coverImage && (
          <div className="absolute inset-0">
            <img src={project.coverImage} alt="" className="w-full h-full object-cover opacity-30" />
            <div className="absolute inset-0 bg-linear-to-t from-gray-900 via-gray-900/50 to-transparent"></div>
          </div>
        )}
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl">
            <a href="/work" className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Projects
            </a>

            <div className="flex items-center gap-3 mb-6">
              <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-sm font-medium border border-purple-500/30">
                {project.category}
              </span>
              {project.client && (
                <span className="text-gray-400 text-sm border-l border-gray-700 pl-3">
                  Client: {project.client}
                </span>
              )}
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              {project.title}
            </h1>
            
            <p className="text-xl text-gray-300 max-w-2xl mb-8 leading-relaxed">
              {project.summary}
            </p>
            
            <div className="flex flex-wrap gap-4">
              {project.liveUrl && (
                <Button as="a" href={project.liveUrl} size="lg" className="bg-purple-600 hover:bg-purple-700 text-white" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" /> Visit Live Site
                </Button>
              )}
              {project.repoUrl && (
                <Button as="a" href={project.repoUrl} variant="outline" size="lg" className="border-gray-700 bg-transparent text-gray-300 hover:bg-gray-800 hover:text-white" target="_blank" rel="noopener noreferrer">
                  <Github className="w-4 h-4 mr-2" /> View Code
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Sidebar */}
            <aside className="hidden lg:block lg:col-span-3 lg:col-start-1">
               <div className="sticky top-24 space-y-8">
                 <div>
                   <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Project Info</h3>
                   <dl className="space-y-4 text-sm">
                     {project.client && (
                       <div>
                         <dt className="text-gray-500">Client</dt>
                         <dd className="font-medium text-gray-900">{project.client}</dd>
                       </div>
                     )}
                     {project.completedAt && (
                       <div>
                         <dt className="text-gray-500">Date</dt>
                         <dd className="font-medium text-gray-900">
                           {format(new Date(project.completedAt), "MMMM yyyy")}
                         </dd>
                       </div>
                     )}
                     <div>
                       <dt className="text-gray-500">Category</dt>
                       <dd className="font-medium text-gray-900">{project.category}</dd>
                     </div>
                   </dl>
                 </div>
                 
                 {project.tags && project.tags.length > 0 && (
                   <div>
                     <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Tech Stack</h3>
                     <div className="flex flex-wrap gap-2">
                       {project.tags.map((tag) => (
                         <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">
                           {tag}
                         </span>
                       ))}
                     </div>
                   </div>
                 )}
               </div>
            </aside>

            {/* Main Content */}
            <div className="lg:col-span-8 lg:col-start-5">
              <div 
                className="prose prose-lg prose-purple max-w-none text-gray-600"
                dangerouslySetInnerHTML={{ __html: contentHtml }}
              />
              
              {/* Gallery */}
              {project.gallery && project.gallery.length > 0 && (
                <div className="mt-16 pt-16 border-t border-gray-100">
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">Project Gallery</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {project.gallery.map((img, idx) => (
                      <img 
                        key={idx}
                        src={img} 
                        alt={`Gallery image ${idx + 1}`} 
                        className="rounded-xl shadow-sm border border-gray-100 w-full h-auto hover:shadow-md transition-shadow"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </article>
  );
}

// Export wrapper with QueryProvider
export function PortfolioDetailPage() {
  return (
    <QueryProvider>
      <PortfolioDetailContent />
    </QueryProvider>
  );
}

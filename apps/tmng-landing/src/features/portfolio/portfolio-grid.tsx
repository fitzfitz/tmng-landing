import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { Loader2 } from "lucide-react";
import { QueryProvider } from "@/providers/query-provider";

type PortfolioItem = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  category: string;
  tags: string[];
  coverImage: string;
  client: string;
};

function PortfolioGrid() {
  const { data: projects, isLoading, isError } = useQuery({
    queryKey: ['portfolio', 'public'],
    queryFn: async () => {
      const res = await apiClient.get("/portfolio/public");
      return res.data.data as PortfolioItem[];
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-24 text-red-500">
        Failed to load projects. Please try again later.
      </div>
    );
  }

  const items = projects || [];

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Our Work</h1>
          <p className="text-xl text-gray-600">
            A showcase of our recent projects, featuring custom web applications, mobile apps, and digital transformations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.length > 0 ? (
            items.map((project) => (
              <a 
                key={project.id} 
                href={`/work/project?slug=${project.slug}`} 
                className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="relative aspect-video overflow-hidden bg-gray-200">
                  {project.coverImage ? (
                    <img 
                      src={project.coverImage} 
                      alt={project.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <span className="text-sm">No Image</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="text-white font-medium border border-white/30 px-4 py-2 rounded-full backdrop-blur-sm">View Project</span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold tracking-wider text-purple-600 uppercase">{project.category}</span>
                    {project.client && (
                      <span className="text-xs text-gray-500">{project.client}</span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">{project.title}</h3>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                    {project.summary}
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {(project.tags || []).slice(0, 3).map((tag) => (
                      <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">{tag}</span>
                    ))}
                  </div>
                </div>
              </a>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">No projects found.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// Export wrapper with QueryProvider
export function PortfolioGridPage() {
  return (
    <QueryProvider>
      <PortfolioGrid />
    </QueryProvider>
  );
}

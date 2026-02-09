import { useProjects } from "../api/use-projects";
import { useState } from "react";
import { Loader2, ExternalLink, Github } from "lucide-react";
import { Link } from "react-router-dom";

export function ProjectsList() {
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading, error } = useProjects({
    page: currentPage,
    limit: 12,
  });

  if (error) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">Failed to load projects</p>
          <p className="text-gray-600 mt-2">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Our Work
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explore our portfolio of successful projects and client solutions
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
          </div>
        )}

        {/* Projects Grid */}
        {!isLoading && data?.data && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {data.data.map((project) => (
                <Link
                  key={project.id}
                  to={`/work/${project.slug}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300"
                >
                  {/* Cover Image */}
                  <div className="aspect-video bg-gradient-to-br from-purple-100 to-purple-200 relative overflow-hidden">
                    {project.coverImage ? (
                      <img
                        src={project.coverImage}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-purple-600/30 text-6xl font-bold">
                          {project.title.charAt(0)}
                        </div>
                      </div>
                    )}
                    {project.featured && (
                      <div className="absolute top-4 right-4">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold text-white bg-purple-600">
                          Featured
                        </span>
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold text-purple-600 bg-white/90 backdrop-blur-sm">
                        {project.category.name}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                      {project.title}
                    </h3>
                    {project.client && (
                      <p className="text-sm text-gray-500 mb-3">
                        Client: {project.client}
                      </p>
                    )}
                    <p className="text-gray-600 line-clamp-3 mb-4">
                      {project.description}
                    </p>

                    {/* Technologies */}
                    {project.technologies &&
                      project.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {project.technologies
                            .slice(0, 3)
                            .map((tech, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 text-xs font-medium text-purple-700 bg-purple-50 rounded"
                              >
                                {tech}
                              </span>
                            ))}
                          {project.technologies.length > 3 && (
                            <span className="px-2 py-1 text-xs font-medium text-gray-500">
                              +{project.technologies.length - 3} more
                            </span>
                          )}
                        </div>
                      )}

                    {/* Links */}
                    <div className="flex items-center gap-3">
                      {project.projectUrl && (
                        <div className="flex items-center gap-1 text-purple-600 text-sm font-semibold">
                          <span>View Project</span>
                          <ExternalLink className="w-4 h-4" />
                        </div>
                      )}
                      {project.githubUrl && (
                        <Github className="w-4 h-4 text-gray-600" />
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {data.pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2">
                {Array.from(
                  { length: data.pagination.totalPages },
                  (_, i) => i + 1,
                ).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                      currentPage === page
                        ? "bg-purple-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}

            {/* Empty State */}
            {data.data.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">No projects found</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

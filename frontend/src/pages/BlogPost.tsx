import { useParams, Link, Navigate } from 'react-router-dom'
import { StaticPageLayout } from '@/components/StaticPageLayout'
import { blogPosts } from '@/features/blog/blogData'

export const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>()

  // Find current post
  const post = blogPosts.find((p) => p.slug === slug)

  if (!post) {
    return <Navigate to="/blog" replace />
  }

  // Get recommended articles (excluding current article)
  const recommendations = blogPosts.filter((p) => p.slug !== slug).slice(0, 2)

  return (
    <StaticPageLayout
      title={post.title}
      subtitle={
        <span className="text-sm font-semibold text-[var(--text-secondary)] block pt-2">
          Published on {post.publishedAt} &bull; {post.readTime}
        </span>
      }
    >
      <div className="space-y-12">
        {/* Navigation Breadcrumbs / Back button */}
        <div>
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <span>←</span> Back to Thunder Blog
          </Link>
        </div>

        {/* Dynamic Big Article Banner */}
        <div className={`w-full bg-gradient-to-tr ${post.bannerGradient} rounded-2xl p-8 md:p-16 text-white relative overflow-hidden flex flex-col justify-end min-h-[260px] md:min-h-[360px] border border-white/5`}>
          <span className="absolute top-8 right-8 text-7xl opacity-10">⚡</span>
          <span className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase self-start border border-white/10 mb-6">
            {post.category}
          </span>
          <div className="space-y-4 max-w-3xl">
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight tracking-tight">
              {post.title}
            </h1>
          </div>
        </div>

        {/* Content Wrapper */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Article Content */}
          <article className="lg:col-span-8 bg-[var(--bg-surface-2)] p-8 md:p-10 rounded-xl border border-[var(--border-subtle)] glass">
            {/* Author Section */}
            <div className="flex items-center gap-3 pb-8 border-b border-[var(--border-subtle)] mb-8">
              <div className={`w-12 h-12 rounded-full ${post.author.avatarColor} flex items-center justify-center text-white text-base font-bold`}>
                {post.author.avatarInitials}
              </div>
              <div>
                <span className="text-sm font-bold text-[var(--text-primary)] block">{post.author.name}</span>
                <span className="text-xs text-[var(--text-muted)] block">Writer & Product Architect</span>
              </div>
            </div>

            {/* Content html injected */}
            <div
              className="blog-content text-[var(--text-secondary)] space-y-6 leading-relaxed text-base md:text-lg"
              dangerouslySetInnerHTML={{ __html: post.contentHtml }}
            />
          </article>

          {/* Lateral Recommendations Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-[var(--bg-surface-2)] p-6 rounded-xl border border-[var(--border-subtle)] glass space-y-6">
              <h3 className="text-sm font-bold text-[var(--text-primary)] border-b border-[var(--border-subtle)] pb-3">
                Suggested Articles
              </h3>
              <div className="flex flex-col gap-6">
                {recommendations.map((rec) => (
                  <Link
                    key={rec.slug}
                    to={`/blog/${rec.slug}`}
                    className="block group space-y-2.5"
                  >
                    <span className="text-[10px] font-extrabold text-blue-450 uppercase tracking-wider block">
                      {rec.category}
                    </span>
                    <h4 className="text-sm font-bold text-[var(--text-primary)] group-hover:text-blue-400 transition-colors leading-snug">
                      {rec.title}
                    </h4>
                    <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                      {rec.description}
                    </p>
                  </Link>
                ))}
              </div>
            </div>

            {/* Call to action sidebar card */}
            <div className="bg-gradient-to-tr from-blue-600/10 to-indigo-750/10 p-6 rounded-xl border border-blue-500/25 text-center space-y-4">
              <h3 className="text-base font-bold text-[var(--text-primary)]">Get Organized Today</h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Experience lightning-fast Kanban boards with instant drag-and-drop state sync.
              </p>
              <Link
                to="/register"
                className="block w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs py-2.5 rounded-lg shadow-md hover:shadow-blue-500/15 transition-all"
              >
                Create Free Account
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </StaticPageLayout>
  )
}
export default BlogPost

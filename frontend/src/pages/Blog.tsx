import { useState } from 'react'
import { Link } from 'react-router-dom'
import { StaticPageLayout } from '@/components/StaticPageLayout'
import { blogPosts } from '@/features/blog/blogData'

export const Blog = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')

  // Categories extracted from posts
  const categories = ['All', ...new Set(blogPosts.map((p) => p.category))]

  // Filter posts
  const filteredPosts = blogPosts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = activeCategory === 'All' || post.category === activeCategory
    return matchesSearch && matchesCategory
  })

  const featuredPost = blogPosts[0]
  const listPosts = searchQuery || activeCategory !== 'All' ? filteredPosts : filteredPosts.slice(1)

  return (
    <StaticPageLayout
      title="Thunder Blog"
      subtitle="Insights, updates, and deep dives into productivity and project management."
    >
      <div className="space-y-12">
        {/* Search and Category Filter Row */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[var(--bg-surface-2)] p-4 rounded-xl border border-[var(--border-subtle)] glass">
          {/* Categories */}
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                  activeCategory === cat
                    ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-500/10'
                    : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-slate-500'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="w-full md:w-80 relative">
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="dark-input pl-10"
            />
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm pointer-events-none">
              🔍
            </span>
          </div>
        </div>

        {/* Featured Post (Only when no filtering is active) */}
        {!searchQuery && activeCategory === 'All' && featuredPost && (
          <div className="bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] rounded-2xl glass overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0 group">
            {/* Featured Gradient Banner */}
            <div className={`lg:col-span-6 bg-gradient-to-tr ${featuredPost.bannerGradient} flex flex-col justify-between p-8 md:p-12 text-white relative min-h-[300px] lg:min-h-[400px]`}>
              <span className="absolute top-6 left-6 text-5xl opacity-20">⚡</span>
              <span className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase self-start border border-white/20">
                Featured Article
              </span>
              <div className="space-y-4">
                <span className="text-xs text-white/70 block font-medium">
                  {featuredPost.publishedAt} &bull; {featuredPost.readTime}
                </span>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold leading-tight tracking-tight">
                  {featuredPost.title}
                </h2>
              </div>
            </div>

            {/* Featured Post Info */}
            <div className="lg:col-span-6 p-8 md:p-12 flex flex-col justify-between gap-8">
              <div className="space-y-4">
                <span className="text-xs font-extrabold text-blue-500 uppercase tracking-widest">
                  {featuredPost.category}
                </span>
                <p className="text-[var(--text-secondary)] leading-relaxed text-base md:text-lg">
                  {featuredPost.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[var(--border-subtle)]">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${featuredPost.author.avatarColor} flex items-center justify-center text-white text-sm font-bold`}>
                    {featuredPost.author.avatarInitials}
                  </div>
                  <div>
                    <span className="text-sm font-bold text-[var(--text-primary)] block">{featuredPost.author.name}</span>
                    <span className="text-xs text-[var(--text-muted)] block">Writer & Contributor</span>
                  </div>
                </div>

                <Link
                  to={`/blog/${featuredPost.slug}`}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow-md hover:shadow-blue-500/10 hover:-translate-y-0.5 transition-all flex items-center gap-1.5"
                >
                  Read Post <span>→</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Regular Posts Grid */}
        {listPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listPosts.map((post) => (
              <div
                key={post.slug}
                className="bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] rounded-xl glass overflow-hidden flex flex-col justify-between hover:border-blue-500/30 transition-all duration-300 group"
              >
                {/* Banner Gradient Card top */}
                <div className={`h-40 bg-gradient-to-tr ${post.bannerGradient} p-6 flex flex-col justify-between text-white relative`}>
                  <span className="absolute top-4 left-4 text-3xl opacity-10">⚡</span>
                  <span className="bg-black/35 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase self-start border border-white/5">
                    {post.category}
                  </span>
                  <span className="text-[10px] text-white/80 block font-medium">
                    {post.publishedAt} &bull; {post.readTime}
                  </span>
                </div>

                {/* Body Content */}
                <div className="p-6 flex-1 flex flex-col justify-between gap-6">
                  <div className="space-y-3">
                    <h3 className="text-lg font-bold text-[var(--text-primary)] group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
                      {post.title}
                    </h3>
                    <p className="text-[var(--text-secondary)] text-sm leading-relaxed line-clamp-3">
                      {post.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-[var(--border-subtle)]">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full ${post.author.avatarColor} flex items-center justify-center text-white text-xs font-bold`}>
                        {post.author.avatarInitials}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[var(--text-primary)] block">{post.author.name}</span>
                      </div>
                    </div>

                    <Link
                      to={`/blog/${post.slug}`}
                      className="text-xs font-semibold text-blue-500 hover:text-blue-400 flex items-center gap-1"
                    >
                      Read <span>→</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-[var(--bg-surface-2)] rounded-xl border border-[var(--border-subtle)] glass">
            <span className="text-4xl block mb-3">🔍</span>
            <p className="text-[var(--text-secondary)]">No articles match your search or filter requirements.</p>
            <button
              onClick={() => {
                setSearchQuery('')
                setActiveCategory('All')
              }}
              className="mt-4 text-xs font-semibold text-blue-400 hover:text-blue-300 hover:underline"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </StaticPageLayout>
  )
}
export default Blog

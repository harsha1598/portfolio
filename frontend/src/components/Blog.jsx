import React, { useState, useEffect } from 'react';
import { Calendar, Tag, ArrowLeft, Clock, Share2, BookOpen, ChevronRight } from 'lucide-react';

export default function Blog({ profile, posts = [], onBackToPortfolio }) {
  const [selectedPostSlug, setSelectedPostSlug] = useState(null);

  const selectedPost = posts.find((p) => p.slug === selectedPostSlug);

  useEffect(() => {
    const author = profile?.name || 'Developer';
    if (selectedPost) {
      document.title = `${selectedPost.title} | ${author}`;
    } else {
      document.title = `${author} | Technical Blog & Articles`;
    }
  }, [selectedPost, profile]);

  // Markdown / formatted text simple renderer
  const renderFormattedContent = (content) => {
    if (!content) return null;

    const lines = content.split('\n');
    const elements = [];
    let inCodeBlock = false;
    let codeBlockContent = [];
    let codeLanguage = '';

    lines.forEach((line, index) => {
      // Code block toggle
      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          elements.push(
            <pre
              key={`code-${index}`}
              className="my-4 p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto"
            >
              <code>{codeBlockContent.join('\n')}</code>
            </pre>
          );
          codeBlockContent = [];
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
          codeLanguage = line.trim().replace('```', '');
        }
        return;
      }

      if (inCodeBlock) {
        codeBlockContent.push(line);
        return;
      }

      // Headings
      if (line.startsWith('### ')) {
        elements.push(
          <h3 key={index} className="text-xl font-bold text-white mt-6 mb-3">
            {line.replace('### ', '')}
          </h3>
        );
        return;
      }
      if (line.startsWith('## ')) {
        elements.push(
          <h2 key={index} className="text-2xl font-extrabold text-white mt-8 mb-4">
            {line.replace('## ', '')}
          </h2>
        );
        return;
      }
      if (line.startsWith('# ')) {
        elements.push(
          <h1 key={index} className="text-3xl font-extrabold text-white mt-10 mb-5">
            {line.replace('# ', '')}
          </h1>
        );
        return;
      }

      // Blockquotes
      if (line.startsWith('> ')) {
        elements.push(
          <blockquote
            key={index}
            className="my-4 pl-4 border-l-2 border-emerald-400 text-slate-300 italic text-sm"
          >
            {line.replace('> ', '')}
          </blockquote>
        );
        return;
      }

      // Bullet lists
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const text = line.trim().substring(2);
        elements.push(
          <li key={index} className="ml-5 list-disc text-slate-300 text-sm leading-relaxed mb-1">
            <span dangerouslySetInnerHTML={{ __html: formatInline(text) }} />
          </li>
        );
        return;
      }

      // Empty line / spacer
      if (!line.trim()) {
        elements.push(<div key={index} className="h-3" />);
        return;
      }

      // Normal paragraph
      elements.push(
        <p
          key={index}
          className="text-slate-300 text-sm sm:text-base leading-relaxed mb-3"
          dangerouslySetInnerHTML={{ __html: formatInline(line) }}
        />
      );
    });

    if (inCodeBlock && codeBlockContent.length) {
      elements.push(
        <pre
          key="code-last"
          className="my-4 p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto"
        >
          <code>{codeBlockContent.join('\n')}</code>
        </pre>
      );
    }

    return elements;
  };

  const formatInline = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="text-slate-200 italic">$1</em>')
      .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-slate-800 text-emerald-300 font-mono text-xs">$1</code>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer" class="text-emerald-400 underline hover:text-emerald-300">$1</a>');
  };

  // Estimate read time
  const estimateReadTime = (content) => {
    const words = content ? content.split(/\s+/).length : 0;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min read`;
  };

  return (
    <div className="min-h-screen pt-28 pb-24 bg-[#07090e] text-slate-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800/80">
          <button
            onClick={() => {
              if (selectedPost) {
                setSelectedPostSlug(null);
              } else {
                onBackToPortfolio?.();
              }
            }}
            className="flex items-center gap-2 text-xs sm:text-sm font-mono text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>{selectedPost ? 'Back to All Articles' : 'Back to Portfolio'}</span>
          </button>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span>Technical Blog & Insights</span>
          </div>
        </div>

        {/* View 1: Single Post Detail */}
        {selectedPost ? (
          <article className="animate-fadeIn">
            {/* Post Header */}
            <header className="mb-10">
              <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-400 mb-4">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(selectedPost.created_at || Date.now()).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {estimateReadTime(selectedPost.content)}
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-6 leading-tight">
                {selectedPost.title}
              </h1>

              {selectedPost.tags && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {selectedPost.tags.split(',').map((tag, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono bg-slate-900 border border-slate-800 text-slate-300"
                    >
                      <Tag className="w-3 h-3 text-emerald-400" />
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              )}

              {selectedPost.excerpt && (
                <p className="text-base sm:text-lg text-slate-300 font-medium italic border-l-2 border-emerald-400 pl-4 py-1 mb-8">
                  {selectedPost.excerpt}
                </p>
              )}
            </header>

            {/* Post Content */}
            <div className="p-6 sm:p-10 rounded-2xl bg-slate-900/40 border border-slate-800/80 prose prose-invert max-w-none">
              {renderFormattedContent(selectedPost.content)}
            </div>

            {/* Post Footer */}
            <div className="mt-10 pt-6 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => setSelectedPostSlug(null)}
                className="px-4 py-2 rounded-xl text-xs font-mono bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
              >
                ← Back to Articles
              </button>
            </div>
          </article>
        ) : (
          /* View 2: Articles List */
          <div className="animate-fadeIn">
            {/* Header */}
            <div className="text-center max-w-2xl mx-auto mb-14">
              <p className="text-xs font-mono uppercase tracking-widest text-emerald-400 mb-2">
                // Engineering Articles & Thoughts
              </p>
              <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
                Technical Knowledge Base
              </h1>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                Architectural patterns, data engineering blueprints, backend optimization, and full-stack learnings.
              </p>
            </div>

            {/* Post Cards Grid */}
            {posts.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-slate-900/30 border border-slate-800/60">
                <BookOpen className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white mb-2">No Articles Published Yet</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Publish articles with markdown formatting anytime via the Admin Panel.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {posts.map((post) => (
                  <div
                    key={post.id || post.slug}
                    onClick={() => setSelectedPostSlug(post.slug)}
                    className="group p-6 sm:p-7 rounded-2xl bg-slate-900/40 border border-slate-800/80 hover:border-emerald-500/40 hover:bg-slate-900/70 transition-all duration-300 flex flex-col justify-between cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs font-mono text-slate-500 mb-3">
                        <span className="flex items-center gap-1.5 text-emerald-400/90">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(post.created_at || Date.now()).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                        <span className="flex items-center gap-1 text-slate-400">
                          <Clock className="w-3.5 h-3.5" />
                          {estimateReadTime(post.content)}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-white group-hover:text-emerald-300 transition-colors mb-3 leading-snug">
                        {post.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-slate-400 leading-relaxed line-clamp-3 mb-6">
                        {post.excerpt || post.content?.substring(0, 140) + '...'}
                      </p>
                    </div>

                    <div>
                      {post.tags && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {post.tags.split(',').slice(0, 3).map((tag, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800/80 text-slate-300 border border-slate-700/60"
                            >
                              {tag.trim()}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-1 text-xs font-mono font-semibold text-emerald-400 group-hover:translate-x-1 transition-transform">
                        <span>Read Article</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

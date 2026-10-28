'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  FileText, Plus, Search, Pencil, Trash2, ExternalLink,
  CheckCircle2, Clock, AlertTriangle, X, Loader2
} from 'lucide-react';

export type ArticleItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  featuredImage?: string | null;
  published: boolean;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
};

const CATEGORY_PRESETS = [
  'Non-Destructive Testing',
  'Quality Control & Assurance',
  'ASME & ISO Standards',
  'Welding Inspection',
  'Engineering Careers',
  'Technical Guides',
];

export function ArticleDesk() {
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<ArticleItem | null>(null);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState(CATEGORY_PRESETS[0]);
  const [customCategory, setCustomCategory] = useState('');
  const [author, setAuthor] = useState('Faculty, Savvy Training Institute');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [published, setPublished] = useState(true);

  // Delete confirmation modal state
  const [deletingArticle, setDeletingArticle] = useState<ArticleItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadArticles = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/articles', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setArticles(data.articles || []);
      }
    } catch {
      setNotice({ type: 'error', message: 'Failed to load articles from server.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    articles.forEach((a) => {
      if (a.category) set.add(a.category);
    });
    return ['All', ...Array.from(set)];
  }, [articles]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return articles.filter((a) => {
      const matchCat = selectedCategory === 'All' || a.category === selectedCategory;
      const matchQuery =
        !q ||
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        a.author.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [articles, selectedCategory, query]);

  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleOpenCreate = () => {
    setEditingArticle(null);
    setTitle('');
    setSlug('');
    setCategory(CATEGORY_PRESETS[0]);
    setCustomCategory('');
    setAuthor('Faculty, Savvy Training Institute');
    setExcerpt('');
    setContent('');
    setPublished(true);
    setModalOpen(true);
  };

  const handleOpenEdit = (article: ArticleItem) => {
    setEditingArticle(article);
    setTitle(article.title);
    setSlug(article.slug);
    if (CATEGORY_PRESETS.includes(article.category)) {
      setCategory(article.category);
      setCustomCategory('');
    } else {
      setCategory('Custom');
      setCustomCategory(article.category);
    }
    setAuthor(article.author);
    setExcerpt(article.excerpt);
    setContent(article.content);
    setPublished(article.published !== false);
    setModalOpen(true);
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editingArticle) {
      setSlug(slugify(val));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setNotice(null);

    const finalCategory = category === 'Custom' ? (customCategory.trim() || 'General') : category;
    const payload = {
      id: editingArticle?.id,
      title: title.trim(),
      slug: slugify(slug || title),
      category: finalCategory,
      author: author.trim() || 'Savvy Editorial Team',
      excerpt: excerpt.trim(),
      content: content.trim(),
      published,
    };

    try {
      const method = editingArticle ? 'PATCH' : 'POST';
      const res = await fetch('/api/articles', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        setNotice({
          type: 'success',
          message: editingArticle ? 'Article updated successfully.' : 'New article published successfully.',
        });
        setModalOpen(false);
        loadArticles();
      } else {
        setNotice({ type: 'error', message: data.message || 'Failed to save article.' });
      }
    } catch {
      setNotice({ type: 'error', message: 'Network error while saving article.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingArticle) return;
    setDeleting(true);
    setNotice(null);

    try {
      const res = await fetch('/api/articles', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deletingArticle.id }),
      });

      const data = await res.json();
      if (res.ok) {
        setNotice({ type: 'success', message: 'Article deleted successfully.' });
        setDeletingArticle(null);
        loadArticles();
      } else {
        setNotice({ type: 'error', message: data.message || 'Failed to delete article.' });
      }
    } catch {
      setNotice({ type: 'error', message: 'Network error while deleting article.' });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Notice Banner */}
      {notice && (
        <div
          className={`flex items-center justify-between gap-3 p-4 rounded-xl border text-sm ${
            notice.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {notice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{notice.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotice(null)}
            className="text-xs hover:opacity-75 font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Panel */}
      <section className="rounded-2xl border border-border bg-white p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-forest" />
              <h2 className="text-xl font-bold text-foreground">Articles &amp; Technical Guides</h2>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Manage technical knowledge base articles, ASME/ISO compliance guides, and institute updates.
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="pill-button-forest py-2.5 px-4 text-xs font-semibold flex items-center gap-2 shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Write New Article</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="mt-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-forest text-white'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search articles..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-border bg-background focus:outline-none focus:border-forest"
            />
          </div>
        </div>

        {/* Article Table */}
        <div className="mt-5">
          {loading ? (
            <div className="py-12 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin text-forest" />
              <span>Loading articles...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
              No articles match your search or filter criteria.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 border-b border-border text-foreground font-semibold">
                  <tr>
                    <th className="py-3 px-4">Title &amp; Slug</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Author</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Published Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-white">
                  {filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-surface/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-foreground text-sm line-clamp-1">{item.title}</div>
                        <div className="text-[11px] text-muted-foreground font-mono mt-0.5">/blogs/{item.slug}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-forest/10 text-forest font-medium text-[11px]">
                          {item.category || 'General'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-muted-foreground">{item.author}</td>
                      <td className="py-3.5 px-4">
                        {item.published ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                            Published
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-semibold">
                            <Clock className="w-3 h-3 text-amber-600" />
                            Draft
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-muted-foreground whitespace-nowrap">
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-GB') : (item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('en-GB') : '—')}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {item.published && (
                            <Link
                              href={`/blogs/${item.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                              title="View Live Article"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          )}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 rounded-lg border border-border hover:bg-forest/10 hover:border-forest text-muted-foreground hover:text-forest transition-colors"
                            title="Edit Article"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingArticle(item)}
                            className="p-1.5 rounded-lg border border-border hover:bg-rose-50 hover:border-rose-300 text-muted-foreground hover:text-rose-600 transition-colors"
                            title="Delete Article"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* New / Edit Article Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white rounded-2xl border border-border shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-border bg-surface/30">
              <div>
                <h3 className="text-base font-bold text-foreground">
                  {editingArticle ? 'Edit Article' : 'Write New Article'}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {editingArticle ? 'Update article details, copy, or publication status.' : 'Author a new technical guide or announcement for the website.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 overflow-y-auto flex flex-col gap-4 text-xs">
              <div>
                <label className="block font-semibold text-foreground mb-1">
                  Article Title <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Ultrasonic Flaw Sizing & Acceptance Standards"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background focus:outline-none focus:border-forest"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    URL Slug <span className="text-rose-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="ultrasonic-flaw-sizing"
                    value={slug}
                    onChange={(e) => setSlug(slugify(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-border bg-background focus:outline-none focus:border-forest"
                  />
                  <span className="text-[10px] text-muted-foreground mt-0.5 block">
                    Public URL: /blogs/{slug || '...'}
                  </span>
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    Author <span className="text-rose-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Dr. Robert Davies, PCN Level 3"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background focus:outline-none focus:border-forest"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-foreground mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background focus:outline-none focus:border-forest"
                  >
                    {CATEGORY_PRESETS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                    <option value="Custom">+ Custom Category</option>
                  </select>
                </div>

                {category === 'Custom' && (
                  <div>
                    <label className="block font-semibold text-foreground mb-1">Custom Category Name</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Advanced Radiography"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background focus:outline-none focus:border-forest"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">
                  Excerpt (Summary) <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="A concise 2-3 sentence overview displayed on article cards..."
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background focus:outline-none focus:border-forest"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">
                  Article Content <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={8}
                  placeholder="Full article copy, technical breakdowns, code citations, and procedures..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-sans rounded-lg border border-border bg-background focus:outline-none focus:border-forest"
                />
              </div>

              <div className="p-3 bg-muted/40 rounded-xl border border-border flex items-center justify-between">
                <div>
                  <div className="font-semibold text-foreground">Publication State</div>
                  <div className="text-[11px] text-muted-foreground">
                    {published ? 'Article will be visible to public visitors on /blogs.' : 'Article is saved as a draft and hidden from public view.'}
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={published}
                    onChange={(e) => setPublished(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-forest"></div>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={saving}
                  className="px-4 py-2 rounded-lg border border-border hover:bg-muted text-muted-foreground font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="pill-button-forest px-5 py-2 text-xs font-semibold flex items-center gap-2"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingArticle ? 'Save Changes' : 'Publish Article'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl border border-border shadow-2xl p-6 text-xs">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">Delete Article</h3>
            <p className="mt-2 text-muted-foreground leading-relaxed">
              Are you sure you want to delete <strong className="text-foreground">"{deletingArticle.title}"</strong>? This will permanently remove the article from the public catalogue and knowledge base.
            </p>
            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeletingArticle(null)}
                disabled={deleting}
                className="px-4 py-2 rounded-lg border border-border hover:bg-muted text-muted-foreground font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold flex items-center gap-1.5"
              >
                {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
'use client';

import React, { useEffect, useState } from 'react';

type PortalItem = {
  id: string;
  kind: 'info' | 'zoom' | 'schedule' | 'update';
  title: string;
  detail: string;
  zoomUrl?: string;
  startsAt?: string;
  published: boolean;
};

type FaqDraft = { id: string; question: string; answer: string };
type Feedback = { id: string; name: string; phone: string; body: string; status: string; createdAt: string; courseTitle?: string; rating?: number };
type Review = { id: string; authorName: string; courseTitle: string; rating: number; body: string; status: string };
type Thread = { id: string; title: string; category?: string; pending?: boolean; hidden: boolean; example?: boolean; replies: { id: string; authorName: string; body: string; approved?: boolean }[] };

export function WebsiteDesk() {
  const [pricesOn, setPricesOn] = useState(false);
  const [items, setItems] = useState<PortalItem[]>([]);
  const [faqs, setFaqs] = useState<FaqDraft[]>([]);
  const [message, setMessage] = useState('');

  async function load() {
    const [settings, portal, faqResponse] = await Promise.all([
      fetch('/api/website-settings', { cache: 'no-store' }).then((res) => res.json()),
      fetch('/api/portal?manage=1', { cache: 'no-store' }).then((res) => res.json()),
      fetch('/api/faqs', { cache: 'no-store' }).then((res) => res.json()),
    ]);
    setPricesOn(settings.show_course_prices === true);
    setItems(portal.items || []);
    setFaqs(faqResponse.faqs || []);
  }

  useEffect(() => { load().catch(() => setMessage('The website settings could not be loaded.')); }, []);

  async function savePrices(next: boolean) {
    const response = await fetch('/api/website-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ show_course_prices: next }),
    });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.message || 'The price setting could not be saved.');
      return;
    }
    setPricesOn(data.show_course_prices === true);
    setMessage(data.show_course_prices ? 'Course prices are visible on the public website.' : 'Course prices are hidden on the public website.');
  }

  async function saveItem(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch('/api/portal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        kind: form.get('kind'),
        title: form.get('title'),
        detail: form.get('detail'),
        zoomUrl: form.get('zoomUrl'),
        startsAt: form.get('startsAt'),
        published: form.get('published') === 'on',
      }),
    });
    const data = await response.json();
    if (!data.ok) {
      setMessage(data.message || 'The portal item could not be saved.');
      return;
    }
    event.currentTarget.reset();
    setMessage('Portal item saved.');
    load();
  }

  async function remove(id: string) {
    await fetch(`/api/portal?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    load();
  }

  async function toggle(item: PortalItem) {
    await fetch('/api/portal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...item, published: !item.published }),
    });
    load();
  }

  function updateFaq(index: number, field: 'question' | 'answer', value: string) {
    setFaqs((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item));
  }

  async function saveFaqs() {
    const response = await fetch('/api/faqs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ faqs }),
    });
    const data = await response.json();
    if (!response.ok || !data.ok) {
      setMessage(data.message || 'The questions could not be saved.');
      return;
    }
    setFaqs(data.faqs || []);
    setMessage('Homepage questions saved.');
  }

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-border bg-white p-5">
        <h2 className="text-xl font-semibold">Course prices</h2>
        <p className="mt-2 text-sm text-muted-foreground">When this is off, public pages do not show a price, a zero, or a placeholder.</p>
        <button type="button" onClick={() => savePrices(!pricesOn)} className="mt-4 rounded-full bg-[#B83268] px-4 py-2 text-sm font-semibold text-white">
          {pricesOn ? 'Turn price display off' : 'Turn price display on'}
        </button>
      </div>
      <div className="rounded-2xl border border-border bg-white p-5">
        <h2 className="text-xl font-semibold">Learning portal</h2>
        <form onSubmit={saveItem} className="mt-4 grid gap-3 md:grid-cols-2">
          <select name="kind" className="rounded-lg border px-3 py-2 text-sm" defaultValue="zoom">
            <option value="info">Course information</option>
            <option value="zoom">Zoom call</option>
            <option value="schedule">Schedule</option>
            <option value="update">Update</option>
          </select>
          <input name="title" required placeholder="Title" className="rounded-lg border px-3 py-2 text-sm" />
          <input name="startsAt" type="datetime-local" className="rounded-lg border px-3 py-2 text-sm" />
          <input name="zoomUrl" placeholder="Zoom link" className="rounded-lg border px-3 py-2 text-sm" />
          <textarea name="detail" placeholder="Details" className="md:col-span-2 rounded-lg border px-3 py-2 text-sm" />
          <label className="flex items-center gap-2 text-sm"><input name="published" type="checkbox" defaultChecked /> Published</label>
          <button className="rounded-full bg-[#B83268] px-4 py-2 text-sm font-semibold text-white" type="submit">Add portal item</button>
        </form>
        <ul className="mt-5 space-y-3">
          {items.map((item) => (
            <li key={item.id} className="rounded-xl border p-3 text-sm">
              <strong>{item.title}</strong>
              <span className="ml-2 text-muted-foreground">{item.published ? 'Published' : 'Hidden'} · {item.kind}</span>
              <p className="mt-1">{item.detail}</p>
              {item.startsAt && <p>{item.startsAt}</p>}
              <div className="mt-2 flex gap-2">
                <button type="button" className="underline" onClick={() => toggle(item)}>{item.published ? 'Hide' : 'Publish'}</button>
                <button type="button" className="underline" onClick={() => remove(item.id)}>Delete</button>
              </div>
            </li>
          ))}
          {items.length === 0 && <li className="text-sm text-muted-foreground">No portal items yet.</li>}
        </ul>
      </div>
      <div className="rounded-2xl border border-border bg-white p-5">
        <h2 className="text-xl font-semibold">Homepage questions</h2>
        <p className="mt-2 text-sm text-muted-foreground">These answers appear in Frequently Asked Questions. Keep them to information already published on the site.</p>
        <div className="mt-4 space-y-4">
          {faqs.map((faq, index) => (
            <div key={faq.id || index} className="rounded-xl border p-3">
              <input value={faq.question} onChange={(event) => updateFaq(index, 'question', event.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm" aria-label="Question" />
              <textarea value={faq.answer} onChange={(event) => updateFaq(index, 'answer', event.target.value)} className="mt-2 min-h-24 w-full rounded-lg border px-3 py-2 text-sm" aria-label="Answer" />
              <button type="button" className="mt-2 text-sm underline" onClick={() => setFaqs((current) => current.filter((_, itemIndex) => itemIndex !== index))}>Remove</button>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" className="rounded-full border px-4 py-2 text-sm" onClick={() => setFaqs((current) => [...current, { id: '', question: '', answer: '' }])}>Add question</button>
          <button type="button" className="rounded-full bg-[#B83268] px-4 py-2 text-sm font-semibold text-white" onClick={saveFaqs}>Save questions</button>
        </div>
      </div>
      {message && <p className="text-sm">{message}</p>}
    </section>
  );
}

export function CommunityDesk() {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [threads, setThreads] = useState<Thread[]>([]);

  async function load() {
    const data = await fetch('/api/community?manage=1', { cache: 'no-store' }).then((res) => res.json());
    setFeedback(data.feedback || []);
    setReviews(data.reviews || []);
    setThreads(data.threads || []);
  }

  useEffect(() => { load().catch(() => undefined); }, []);

  async function act(payload: Record<string, unknown>) {
    await fetch('/api/community', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    load();
  }

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-border bg-white p-5">
        <h2 className="text-xl font-semibold">Student feedback</h2>
        <ul className="mt-4 space-y-3">
          {feedback.map((item) => (
            <li key={item.id} className="rounded-xl border p-3 text-sm">
              <strong>{item.name}</strong> · {item.phone} · {item.status}
              {(item.courseTitle || item.rating) && <span> · {item.courseTitle || 'No course'}{item.rating ? ` · ${item.rating}/5` : ''}</span>}
              <p className="mt-1">{item.body}</p>
              <div className="mt-2 flex gap-3">
                <button type="button" className="underline" onClick={() => act({ type: 'feedback-status', id: item.id, status: 'approved' })}>Approve</button>
                <button type="button" className="underline" onClick={() => act({ type: 'feedback-status', id: item.id, status: 'hidden' })}>Hide</button>
                <button type="button" className="underline" onClick={() => act({ type: 'delete-feedback', id: item.id })}>Delete</button>
              </div>
            </li>
          ))}
          {feedback.length === 0 && <li className="text-sm text-muted-foreground">No feedback yet.</li>}
        </ul>
      </div>
      <div className="rounded-2xl border border-border bg-white p-5">
        <h2 className="text-xl font-semibold">Course reviews</h2>
        <p className="mt-2 text-sm text-muted-foreground">Approved reviews can appear on the homepage. Phone numbers are not stored with course reviews.</p>
        <ul className="mt-4 space-y-3">
          {reviews.map((review) => (
            <li key={review.id} className="rounded-xl border p-3 text-sm">
              <strong>{review.authorName}</strong> · {review.courseTitle} · {review.rating}/5 · {review.status}
              <p className="mt-1">{review.body}</p>
              <div className="mt-2 flex gap-3">
                <button type="button" className="underline" onClick={() => act({ type: 'review-status', id: review.id, status: 'approved' })}>Approve</button>
                <button type="button" className="underline" onClick={() => act({ type: 'review-status', id: review.id, status: 'rejected' })}>Hide</button>
                <button type="button" className="underline" onClick={() => act({ type: 'delete-review', id: review.id })}>Remove</button>
              </div>
            </li>
          ))}
          {reviews.length === 0 && <li className="text-sm text-muted-foreground">No course reviews yet.</li>}
        </ul>
      </div>
      <div className="rounded-2xl border border-border bg-white p-5">
        <h2 className="text-xl font-semibold">Discussions</h2>
        <ul className="mt-4 space-y-3">
          {threads.map((thread) => (
            <li key={thread.id} className="rounded-xl border p-3 text-sm">
              <strong>{thread.title}</strong>
              <span className="ml-2 text-muted-foreground">{thread.category} {thread.example ? '· Example' : ''} {thread.pending ? '· Awaiting approval' : ''} {thread.hidden ? '· Hidden' : ''}</span>
              <div className="mt-2 flex gap-3">
                <button type="button" className="underline" onClick={() => act({ type: 'moderate', id: thread.id, action: thread.hidden ? 'restore' : 'hide' })}>{thread.hidden ? 'Restore' : 'Hide'}</button>
                {!thread.example && <button type="button" className="underline" onClick={() => act({ type: 'delete-thread', id: thread.id })}>Delete</button>}
              </div>
              {thread.replies.filter((reply) => reply.approved === false).map((reply) => (
                <div key={reply.id} className="mt-2 border-t pt-2">
                  <p>{reply.authorName}: {reply.body}</p>
                  <button type="button" className="underline" onClick={() => act({ type: 'reply-status', threadId: thread.id, replyId: reply.id, approved: true })}>Approve reply</button>
                </div>
              ))}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

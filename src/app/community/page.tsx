'use client';

import React, { useEffect, useState } from 'react';

type Course = { id: string; title: string };
type Reply = { id: string; authorName: string; body: string; createdAt: string; approved?: boolean };
type Thread = {
  id: string;
  title: string;
  body: string;
  category?: string;
  initials?: string;
  example?: boolean;
  createdAt: string;
  replies: Reply[];
};

const fieldClass = 'w-full rounded-xl border border-[#F0D5DE] bg-white px-3 py-3 text-[#1F1F1F]';

export default function CommunityPage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [canModerate, setCanModerate] = useState(false);
  const [openThread, setOpenThread] = useState('');
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function load() {
    setLoading(true);
    try {
      const session = await fetch('/api/auth/session', { cache: 'no-store' }).then((res) => res.json()).catch(() => null);
      const admin = session?.account?.role === 'admin';
      const response = await fetch(admin ? '/api/community?manage=1' : '/api/community', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'The community could not be loaded.');
      setThreads(data.threads || []);
      setCourses(data.courses || []);
      setCanModerate(Boolean(data.canModerate));
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The community could not be loaded.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function send(event: React.FormEvent<HTMLFormElement>, type: 'feedback' | 'thread' | 'reply') {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries());
    if (type === 'feedback' && (rating < 1 || rating > 5)) {
      setNotice('');
      setError('Choose a rating from 1 to 5.');
      return;
    }
    if (type === 'thread') {
      const text = String(payload.discussion || '').trim();
      payload.title = text.slice(0, 80);
      payload.body = text;
    }
    const response = await fetch('/api/community', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, type, rating: type === 'feedback' ? rating : undefined }),
    });
    const data = await response.json();
    if (!data.ok) {
      setNotice('');
      setError(data.message || 'That could not be sent.');
      return;
    }
    form.reset();
    if (type === 'feedback') setRating(0);
    setError('');
    setNotice(type === 'reply'
      ? 'Your reply is waiting for approval.'
      : 'Thank you. This will appear after it is approved.');
    load();
  }

  const examples = threads.filter((thread) => thread.example);
  const discussions = threads;

  return (
    <div className="bg-[#FBF6F8] pb-20">
      <section data-no-reveal className="site-container py-12 sm:py-16">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#B14B6C]">Student community</p>
        <h1 className="mt-3 max-w-3xl text-[#1F1F1F]">Share feedback and talk to other students</h1>
        <div className="mt-8 grid items-start gap-6 lg:grid-cols-2">
          <form onSubmit={(event) => send(event, 'feedback')} className="rounded-3xl border border-[#F0D5DE] bg-white p-6 sm:p-8">
            <h2 className="text-[#1F1F1F]">Leave your feedback</h2>
            <p className="mt-2 text-[#565656]">Tell us about your course. Reviews are checked before they appear on the site.</p>
            <input name="website" className="hidden" tabIndex={-1} autoComplete="off" />
            <label className="mt-5 block text-sm font-semibold text-[#1F1F1F]" htmlFor="feedback-name">Your name</label>
            <input id="feedback-name" name="name" required autoComplete="name" className={`mt-2 ${fieldClass}`} />
            <label className="mt-4 block text-sm font-semibold text-[#1F1F1F]" htmlFor="feedback-phone">Phone number</label>
            <input id="feedback-phone" name="phone" required autoComplete="tel" className={`mt-2 ${fieldClass}`} />
            <label className="mt-4 block text-sm font-semibold text-[#1F1F1F]" htmlFor="feedback-course">Course</label>
            <select id="feedback-course" name="courseTitle" required className={`mt-2 ${fieldClass}`} defaultValue="">
              <option value="" disabled>Choose a course</option>
              {courses.map((course) => <option key={course.id} value={course.title}>{course.title}</option>)}
            </select>
            <fieldset className="mt-4">
              <legend className="text-sm font-semibold text-[#1F1F1F]">Rating</legend>
              <div className="mt-2 flex gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={rating === value}
                    onClick={() => setRating(value)}
                    className={`h-11 w-11 rounded-full border text-sm font-semibold ${rating === value ? 'border-[#B14B6C] bg-[#B14B6C] text-white' : 'border-[#F0D5DE] bg-white text-[#B14B6C]'}`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </fieldset>
            <label className="mt-4 block text-sm font-semibold text-[#1F1F1F]" htmlFor="feedback-body">Your review</label>
            <textarea id="feedback-body" name="body" required minLength={12} rows={5} className={`mt-2 ${fieldClass}`} />
            <button className="mt-5 rounded-full bg-[#B14B6C] px-5 py-3 font-semibold text-white" type="submit">Submit feedback</button>
          </form>

          <div className="rounded-3xl border border-[#F0D5DE] bg-white p-6 sm:p-8">
            <h2 className="text-[#1F1F1F]">Student forum</h2>
            {examples.length > 0 && <p className="mt-2 text-sm font-semibold uppercase tracking-wide text-[#687587]">Example threads</p>}
            {loading && <p className="mt-4 text-[#565656]">Loading discussions…</p>}
            {!loading && discussions.length === 0 && <p className="mt-4 text-[#565656]">No discussions yet.</p>}
            <div className="mt-4 divide-y divide-[#F0E2E7]">
              {discussions.map((thread) => {
                const replies = thread.replies.length;
                return (
                  <article key={thread.id} className="py-4 first:pt-0">
                    <button type="button" onClick={() => setOpenThread((current) => current === thread.id ? '' : thread.id)} className="flex w-full items-start gap-3 text-left">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#B14B6C] text-sm font-semibold text-white">{thread.initials || 'ST'}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold text-[#1F1F1F]">{thread.title}</span>
                        <span className="mt-2 flex flex-wrap items-center gap-2">
                          {thread.category && <span className="rounded-full bg-[#FBEAF0] px-2.5 py-1 text-xs font-semibold text-[#B14B6C]">{thread.category}</span>}
                          {thread.example
                            ? <span className="rounded-full bg-[#FBF6F8] px-2.5 py-1 text-xs font-semibold text-[#687587]">Example</span>
                            : <span className="text-sm text-[#565656]">{replies} {replies === 1 ? 'reply' : 'replies'}</span>}
                        </span>
                      </span>
                    </button>
                    {openThread === thread.id && (
                      <div className="mt-3 pl-14">
                        {thread.body && <p className="text-[#565656]">{thread.body}</p>}
                        {thread.example && <p className="mt-2 text-sm text-[#687587]">This is a sample topic. It does not include a stored conversation or a live reply count.</p>}
                        <div className="mt-3 space-y-2">
                          {thread.replies.map((reply) => (
                            <p key={reply.id} className="text-sm text-[#1F1F1F]"><strong>{reply.authorName}: </strong>{reply.body}</p>
                          ))}
                        </div>
                        <form onSubmit={(event) => send(event, 'reply')} className="mt-4 space-y-2">
                          <input type="hidden" name="threadId" value={thread.id} />
                          <input name="website" className="hidden" tabIndex={-1} autoComplete="off" />
                          <input name="name" required placeholder="Your name" aria-label="Your name" className={fieldClass} />
                          <textarea name="body" required minLength={12} placeholder="Write a reply" aria-label="Reply" className={fieldClass} />
                          <button className="text-sm font-semibold text-[#B14B6C]" type="submit">Send reply for approval</button>
                        </form>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
            <form onSubmit={(event) => send(event, 'thread')} className="mt-6 border-t border-[#F0E2E7] pt-5">
              <h3 className="text-[#1F1F1F]">New discussion</h3>
              <input name="website" className="hidden" tabIndex={-1} autoComplete="off" />
              <label className="mt-3 block text-sm font-semibold text-[#1F1F1F]" htmlFor="thread-name">Your name</label>
              <input id="thread-name" name="name" required className={`mt-2 ${fieldClass}`} />
              <label className="mt-3 block text-sm font-semibold text-[#1F1F1F]" htmlFor="thread-body">Discussion</label>
              <textarea id="thread-body" name="discussion" required minLength={12} rows={3} placeholder="What would you like to ask other students?" className={`mt-2 ${fieldClass}`} />
              <button className="mt-4 rounded-full bg-[#B14B6C] px-5 py-3 font-semibold text-white" type="submit">Post</button>
            </form>
            {canModerate && <p className="mt-4 text-sm text-[#565656]">Approve or hide posts from Admin, then Community.</p>}
          </div>
        </div>
        {(error || notice) && <p className={`mt-6 ${error ? 'text-red-700' : 'text-[#00823B]'}`} role="status">{error || notice}</p>}
      </section>
    </div>
  );
}

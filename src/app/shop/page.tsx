'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { PageHeroBanner } from '@/components/common/PageHeroBanner';

type Product = {
  id: string;
  title: string;
  format: string;
  includes: string[];
  priceGbp: number | null;
  published: boolean;
  fileName?: string | null;
};

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [status, setStatus] = useState('Loading resources…');
  const [error, setError] = useState('');

  async function load() {
    setError('');
    try {
      const session = await fetch('/api/auth/session', { cache: 'no-store' }).then((res) => res.json()).catch(() => null);
      const admin = session?.account?.role === 'admin';
      setIsAdmin(admin);
      const response = await fetch(admin ? '/api/shop?manage=1' : '/api/shop', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'The shop could not be loaded.');
      setProducts(data.products || []);
      setStatus(data.products?.length ? '' : 'No shop resources are published yet.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The shop could not be loaded.');
      setStatus('');
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function saveProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const response = await fetch('/api/shop', { method: 'POST', body: new FormData(form) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.ok) {
      setError(data.message || 'The product could not be saved.');
      return;
    }
    form.reset();
    setError('');
    load();
  }

  return (
    <div className="bg-white pb-20">
      <PageHeroBanner
        badgeText="Shop"
        title="Course manuals and business resources"
        description="The reference shop lists four resources. It does not publish prices or the downloadable files, and its basket does not complete a payment."
        imageSrc="/images/heroes/about-hero.jpg"
        imageAlt="Savvy training workspace"
      />
      <section className="site-container py-14">
        {status && <p className="text-sm text-[#565656]">{status}</p>}
        {error && <p className="text-sm text-red-700" role="alert">{error}</p>}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {products.map((product) => (
            <article key={product.id} className="rounded-2xl border border-[#F0E2E7] p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-[#B14B6C]">{product.format}</p>
              <h2 className="mt-2 text-xl font-semibold text-[#1F1F1F]">{product.title}</h2>
              <ul className="mt-3 list-disc pl-5 text-sm text-[#565656]">
                {product.includes.map((item) => <li key={item}>{item}</li>)}
              </ul>
              {product.priceGbp != null && (
              <p className="mt-4 text-sm font-semibold text-[#1F1F1F]">£{product.priceGbp}</p>
              )}
              <Link href={`/contact-us?item=${encodeURIComponent(product.title)}`} className="mt-4 inline-flex rounded-full bg-[#B14B6C] px-5 py-2.5 text-sm font-semibold text-white">
                Buy Now
              </Link>
              <p className="mt-1 text-xs text-[#687587]">
                {product.fileName ? 'A file is stored for administrators. It is not offered as a public download because the source shop has no checkout.' : 'No downloadable file has been published for this resource.'}
              </p>
              {!product.published && <p className="mt-2 text-xs font-semibold text-amber-700">Unpublished</p>}
              {isAdmin && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {product.fileName && (
                    <a className="text-sm font-semibold text-[#B14B6C]" href={`/api/shop?file=${product.id}`}>Download stored file</a>
                  )}
                  <button
                    type="button"
                    className="text-sm font-semibold text-[#B14B6C]"
                    onClick={async () => {
                      await fetch('/api/shop', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: product.id, title: product.title, published: !product.published, priceGbp: product.priceGbp, includes: product.includes, format: product.format }),
                      });
                      load();
                    }}
                  >
                    {product.published ? 'Unpublish' : 'Publish'}
                  </button>
                  <button
                    type="button"
                    className="text-sm font-semibold text-red-700"
                    onClick={async () => {
                      await fetch(`/api/shop?id=${product.id}`, { method: 'DELETE' });
                      load();
                    }}
                  >
                    Remove
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>

        {isAdmin && (
          <form onSubmit={saveProduct} className="mt-10 max-w-xl rounded-3xl border border-[#F0E2E7] p-6 flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-[#1F1F1F]">Add a shop resource</h2>
            <input name="title" required placeholder="Title" className="rounded-xl border border-[#F0E2E7] px-3 py-2 text-sm" />
            <input name="format" placeholder="Format, for example PDF download" className="rounded-xl border border-[#F0E2E7] px-3 py-2 text-sm" />
            <textarea name="includes" placeholder="One included item per line" rows={4} className="rounded-xl border border-[#F0E2E7] px-3 py-2 text-sm" />
            <input name="priceGbp" inputMode="decimal" placeholder="Price in GBP, or leave blank" className="rounded-xl border border-[#F0E2E7] px-3 py-2 text-sm" />
            <input name="file" type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp" className="text-sm" />
            <button className="rounded-full bg-[#B14B6C] px-4 py-2 text-sm font-semibold text-white" type="submit">Save product</button>
          </form>
        )}
      </section>
    </div>
  );
}

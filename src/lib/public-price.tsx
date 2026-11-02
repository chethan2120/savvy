'use client';

import { useEffect, useState } from 'react';

export function useShowCoursePrices() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    fetch('/api/website-settings', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => setShow(data.show_course_prices === true))
      .catch(() => setShow(false));
  }, []);
  return show;
}

export function gbpLabel(course: { currency_prices?: { GBP?: number | null } | null }) {
  const value = course.currency_prices?.GBP;
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return null;
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(value);
}

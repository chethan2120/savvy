'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, Download, Filter, RefreshCw, Eye, X,
  Calendar, Phone, Mail, MapPin, BookOpen, CheckCircle,
  Clock, AlertCircle, ChevronLeft, ChevronRight, FileSpreadsheet
} from 'lucide-react';

interface ContactEnquiry {
  id: string;
  createdAt: string;
  fullName: string;
  phone: string;
  email: string;
  location: string;
  courseId?: string;
  courseName: string;
  otherCourse?: string;
  message?: string;
  status: 'new' | 'contacted' | 'in_progress' | 'enrolled' | 'closed';
}

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-50 text-blue-700 border-blue-200',
  contacted: 'bg-purple-50 text-purple-700 border-purple-200',
  in_progress: 'bg-amber-50 text-amber-700 border-amber-200',
  enrolled: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  closed: 'bg-gray-50 text-gray-700 border-gray-200',
};

export function ContactInfoPanel() {
  const [enquiries, setEnquiries] = useState<ContactEnquiry[]>([]);
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [query, setQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Detail Modal
  const [activeEnquiry, setActiveEnquiry] = useState<ContactEnquiry | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Fetch course list for filter dropdown
  useEffect(() => {
    fetch('/api/public-courses')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.courses) {
          setCourses(data.courses.map((c: any) => ({ id: c.id, title: c.title })));
        }
      })
      .catch(() => {});
  }, []);

  const loadEnquiries = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set('query', query.trim());
      if (selectedCourse !== 'all') params.set('course', selectedCourse);
      if (selectedStatus !== 'all') params.set('status', selectedStatus);
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);
      params.set('page', String(page));
      params.set('limit', '12');

      const res = await fetch(`/api/contacts?${params.toString()}`);
      if (!res.ok) {
        throw new Error('Failed to load contact enquiries.');
      }
      const data = await res.json();
      setEnquiries(data.enquiries || []);
      setTotalPages(data.totalPages || 1);
      setTotalCount(data.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching records.');
    } finally {
      setLoading(false);
    }
  }, [query, selectedCourse, selectedStatus, startDate, endDate, page]);

  useEffect(() => {
    loadEnquiries();
  }, [loadEnquiries]);

  // Handle status update
  const handleUpdateStatus = async (id: string, status: ContactEnquiry['status']) => {
    setUpdatingStatus(true);
    try {
      const res = await fetch('/api/contacts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        setEnquiries((prev) =>
          prev.map((e) => (e.id === id ? { ...e, status } : e))
        );
        if (activeEnquiry && activeEnquiry.id === id) {
          setActiveEnquiry({ ...activeEnquiry, status });
        }
      }
    } catch {
      // ignore
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Export to Excel handler
  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set('query', query.trim());
      if (selectedCourse !== 'all') params.set('course', selectedCourse);
      if (selectedStatus !== 'all') params.set('status', selectedStatus);
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);

      const url = `/api/contacts/export?${params.toString()}`;
      // Direct browser download
      window.location.href = url;
    } catch {
      alert('Unable to generate Excel file right now.');
    } finally {
      setTimeout(() => setExporting(false), 2000);
    }
  };

  const resetFilters = () => {
    setQuery('');
    setSelectedCourse('all');
    setSelectedStatus('all');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner / Controls */}
      <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-border">
          <div>
            <h2 className="text-xl font-bold text-foreground">Contact Enquiries Desk</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Review and manage prospective learner enquiries submitted through the public Contact Us form.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Export to Excel Button */}
            <button
              type="button"
              onClick={handleExportExcel}
              disabled={exporting || loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
              <span>{exporting ? 'Generating Excel...' : 'Export to Excel (.xlsx)'}</span>
            </button>

            <button
              type="button"
              onClick={loadEnquiries}
              className="p-2.5 rounded-full border border-border bg-background hover:bg-white text-foreground transition-colors"
              title="Refresh Records"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name, email, phone, location..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:border-forest"
            />
          </div>

          {/* Course filter */}
          <div>
            <select
              value={selectedCourse}
              onChange={(e) => {
                setSelectedCourse(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none cursor-pointer"
            >
              <option value="all">All Courses</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="new">New (Unread)</option>
              <option value="contacted">Contacted</option>
              <option value="in_progress">In Progress</option>
              <option value="enrolled">Enrolled</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          {/* Date range filters */}
          <div className="flex items-center gap-1">
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="w-full px-2 py-2 rounded-xl border border-border bg-background text-[11px] text-foreground focus:outline-none"
              title="From date"
            />
            <span className="text-xs text-muted-foreground">-</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="w-full px-2 py-2 rounded-xl border border-border bg-background text-[11px] text-foreground focus:outline-none"
              title="To date"
            />
          </div>
        </div>

        {(query || selectedCourse !== 'all' || selectedStatus !== 'all' || startDate || endDate) && (
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground pt-2">
            <span>Filtering records ({totalCount} matching)</span>
            <button type="button" onClick={resetFilters} className="text-forest underline font-semibold">
              Reset filters
            </button>
          </div>
        )}
      </section>

      {/* Enquiries Table */}
      <section className="rounded-2xl border border-border bg-white overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-xs text-muted-foreground">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-forest" />
            Loading contact records...
          </div>
        ) : error ? (
          <div className="p-10 text-center text-xs text-rose-600 bg-rose-50">
            {error}
          </div>
        ) : enquiries.length === 0 ? (
          <div className="p-14 text-center text-xs text-muted-foreground">
            <Mail className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-foreground">No Contact Enquiries Found</h3>
            <p className="mt-1">There are no enquiries matching the chosen filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-background border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Enquirer Name</th>
                  <th className="py-3 px-4">Contact Info</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Course of Interest</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {enquiries.map((enq) => (
                  <tr key={enq.id} className="hover:bg-[#F7F8FA] transition-colors">
                    {/* Date */}
                    <td className="py-3 px-4 whitespace-nowrap text-muted-foreground">
                      <div className="font-semibold text-foreground">
                        {new Date(enq.createdAt).toLocaleDateString('en-GB')}
                      </div>
                      <div className="text-[10px]">
                        {new Date(enq.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    {/* Name */}
                    <td className="py-3 px-4 font-bold text-foreground whitespace-nowrap">
                      {enq.fullName}
                    </td>

                    {/* Phone & Email */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-medium text-foreground">{enq.phone}</div>
                      <div className="text-muted-foreground text-[11px]">{enq.email}</div>
                    </td>

                    {/* Location */}
                    <td className="py-3 px-4 text-foreground whitespace-nowrap">
                      {enq.location}
                    </td>

                    {/* Course */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-foreground line-clamp-1 max-w-xs">
                        {enq.courseName}
                      </div>
                      {enq.otherCourse && (
                        <div className="text-[10px] text-amber-700 italic">
                          Requested: {enq.otherCourse}
                        </div>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border capitalize ${
                          STATUS_COLORS[enq.status] || STATUS_COLORS.new
                        }`}
                      >
                        {enq.status.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setActiveEnquiry(enq)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border bg-white hover:bg-background text-xs font-semibold text-foreground transition-colors shadow-subtle"
                      >
                        <Eye className="w-3.5 h-3.5 text-forest" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground bg-background">
            <div>
              Showing page {page} of {totalPages} ({totalCount} total enquiries)
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg border border-border bg-white disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg border border-border bg-white disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Enquiry Detail Modal */}
      {activeEnquiry && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setActiveEnquiry(null)}
        >
          <div
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-border flex flex-col gap-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-border">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Enquiry ID: {activeEnquiry.id}
                </span>
                <h3 className="text-xl font-bold text-foreground mt-0.5">
                  {activeEnquiry.fullName}
                </h3>
                <span className="text-xs text-muted-foreground">
                  Submitted {new Date(activeEnquiry.createdAt).toLocaleString('en-GB')}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setActiveEnquiry(null)}
                className="p-1.5 rounded-full hover:bg-background text-muted-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-background border border-border flex items-start gap-3">
                <Phone className="w-4 h-4 text-forest shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-muted-foreground">Contact Number</strong>
                  <a href={`tel:${activeEnquiry.phone}`} className="font-bold text-foreground text-sm hover:underline">
                    {activeEnquiry.phone}
                  </a>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-background border border-border flex items-start gap-3">
                <Mail className="w-4 h-4 text-forest shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-muted-foreground">Email Address</strong>
                  <a href={`mailto:${activeEnquiry.email}`} className="font-bold text-foreground text-sm hover:underline">
                    {activeEnquiry.email}
                  </a>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-background border border-border flex items-start gap-3">
                <MapPin className="w-4 h-4 text-forest shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-muted-foreground">Location</strong>
                  <span className="font-bold text-foreground text-sm">
                    {activeEnquiry.location}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-background border border-border flex items-start gap-3">
                <BookOpen className="w-4 h-4 text-forest shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-muted-foreground">Selected Course</strong>
                  <span className="font-bold text-foreground text-sm">
                    {activeEnquiry.courseName}
                  </span>
                </div>
              </div>
            </div>

            {/* Other Course Request If Any */}
            {activeEnquiry.otherCourse && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                <strong className="block font-bold">Custom Course Requested:</strong>
                <p className="mt-1">{activeEnquiry.otherCourse}</p>
              </div>
            )}

            {/* Message Body */}
            <div>
              <h4 className="text-xs font-bold text-foreground mb-2">Message & Notes</h4>
              <div className="p-4 rounded-xl bg-background border border-border text-xs text-foreground whitespace-pre-wrap leading-relaxed">
                {activeEnquiry.message || 'No additional message was provided.'}
              </div>
            </div>

            {/* Status Change Selector */}
            <div className="pt-4 border-t border-border flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-foreground">Update Status:</span>
                <select
                  value={activeEnquiry.status}
                  disabled={updatingStatus}
                  onChange={(e) => handleUpdateStatus(activeEnquiry.id, e.target.value as any)}
                  className="px-3 py-1.5 rounded-xl border border-border bg-white text-xs font-bold text-foreground cursor-pointer"
                >
                  <option value="new">New (Unread)</option>
                  <option value="contacted">Contacted</option>
                  <option value="in_progress">In Progress</option>
                  <option value="enrolled">Enrolled</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => setActiveEnquiry(null)}
                className="px-5 py-2 rounded-full bg-foreground text-white text-xs font-semibold hover:bg-black transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

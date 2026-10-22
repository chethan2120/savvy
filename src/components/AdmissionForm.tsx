'use client';

import React, { useEffect, useState } from 'react';
import { defaultSettings } from '@/lib/data';
import { useCourseCatalog } from '@/lib/useCourseCatalog';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { friendlyError } from '@/lib/friendly-error';
import { CheckCircle, AlertCircle, Upload, Loader2, Phone, MessageCircle } from 'lucide-react';

export const AdmissionForm: React.FC = () => {
  const { courses, loading: coursesLoading } = useCourseCatalog();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    city: '',
    qualification: '',
    selected_course: 'NDT Level II Course',
    preferred_mode: 'Classroom',
    message: '',
    consent: true,
  });

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [marksheetFile, setMarksheetFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (courses.length && !courses.some((course) => course.title === formData.selected_course)) {
      setFormData((current) => ({ ...current, selected_course: courses[0].title }));
    }
  }, [courses, formData.selected_course]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'photo' | 'marksheet') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB). An inline message, not an alert() — a browser
    // dialog reads as an error the applicant cannot act on.
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage(
        `“${file.name}” is larger than 5 MB. Please choose a smaller file, or send it to us on WhatsApp instead.`,
      );
      setStatus('error');
      e.target.value = '';
      return;
    }
    if (status === 'error') setStatus('idle');

    if (fileType === 'photo') {
      setPhotoFile(file);
    } else {
      setMarksheetFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const missing = [
      !formData.full_name.trim() && 'your full name',
      !formData.email.trim() && 'your email address',
      !formData.phone.trim() && 'your phone number',
    ].filter(Boolean) as string[];
    if (missing.length > 0) {
      setErrorMessage(`Please enter ${missing.join(', ')} before submitting — we need it to contact you.`);
      setStatus('error');
      return;
    }

    // Honest behaviour: never show a success screen when there is no backend
    // to actually store the application. Guide the applicant to call/WhatsApp.
    if (!isSupabaseConfigured) {
      setErrorMessage(
        'Online applications are not available right now. Please contact our counsellors directly to enrol — they will complete your application over call or WhatsApp.',
      );
      setStatus('error');
      return;
    }

    setStatus('submitting');
    setErrorMessage('');

    try {
      let photo_path = '';
      let marksheet_path = '';

      // Uploads used to fail silently: the error was swallowed and the path
      // stayed empty, so the application reached the admin panel with no photo
      // and no marksheet and nobody knew a file had been lost. A failed upload
      // now stops the submission and says so.
      if (photoFile) {
        const photoExt = photoFile.name.split('.').pop();
        const photoFileName = `${Date.now()}_photo.${photoExt}`;
        const { data: photoData, error: photoErr } = await supabase.storage
          .from('admissions-files')
          .upload(photoFileName, photoFile);
        if (photoErr || !photoData) {
          setErrorMessage(`Your photo could not be uploaded. ${friendlyError(photoErr, 'file')}`);
          setStatus('error');
          return;
        }
        photo_path = photoData.path;
      }

      if (marksheetFile) {
        const markExt = marksheetFile.name.split('.').pop();
        const markFileName = `${Date.now()}_marksheet.${markExt}`;
        const { data: markData, error: markErr } = await supabase.storage
          .from('admissions-files')
          .upload(markFileName, marksheetFile);
        if (markErr || !markData) {
          setErrorMessage(`Your marksheet could not be uploaded. ${friendlyError(markErr, 'file')}`);
          setStatus('error');
          return;
        }
        marksheet_path = markData.path;
      }

      // Insert record into Supabase
      const { error: dbError } = await supabase.from('admission_applications').insert([
        {
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone,
          city: formData.city,
          qualification: formData.qualification,
          selected_course: formData.selected_course,
          preferred_mode: formData.preferred_mode,
          message: formData.message,
          photo_path,
          marksheet_path,
          consent: formData.consent,
          status: 'pending',
        },
      ]);

      if (dbError) throw dbError;
      setStatus('success');
    } catch (err: unknown) {
      console.error('Admission submission failed:', err);
      setErrorMessage(
        `We could not submit your application online just now. ${friendlyError(err, 'application')} You can also call or WhatsApp our counsellors and we will enrol you directly.`,
      );
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="editorial-card p-8 md:p-12 text-center flex flex-col items-center gap-4 bg-surface border-forest/30">
        <div className="w-16 h-16 rounded-full bg-forest/10 text-forest flex items-center justify-center">
          <CheckCircle className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-normal text-foreground">Application Submitted Successfully</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          Thank you for applying to Savvy Training Institute. Our career counsellor will contact you within 24 hours to guide you through enrolment.
        </p>
        <button
          onClick={() => {
            setStatus('idle');
            setFormData({
              full_name: '',
              email: '',
              phone: '',
              city: '',
              qualification: '',
              selected_course: 'NDT Level II Course',
              preferred_mode: 'Classroom',
              message: '',
              consent: true,
            });
            setPhotoFile(null);
            setMarksheetFile(null);
          }}
          className="pill-button-secondary text-xs px-6 py-2.5 mt-2"
        >
          Submit Another Application
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="editorial-card p-6 md:p-10 flex flex-col gap-6 bg-surface">
      <div className="flex flex-col gap-1">
        <h3 className="text-2xl font-normal text-foreground">Student Admission Form</h3>
        <p className="text-xs text-muted-foreground">Fill out the official enrolment application form below.</p>
      </div>

      {status === 'error' && (
        <div role="alert" className="flex flex-col gap-3 p-4 text-xs bg-yellow/20 rounded-xl border border-border">
          <div className="flex items-start gap-2 text-foreground">
            <AlertCircle className="w-4 h-4 shrink-0 text-safety-orange mt-0.5" />
            <span>{errorMessage}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href={`tel:${defaultSettings.phone_primary.replace(/\s/g, '')}`}
              className="pill-button-secondary text-xs py-2 px-4 flex items-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5" /> {defaultSettings.phone_primary}
            </a>
            <a
              href={`https://wa.me/${defaultSettings.whatsapp_number}`}
              target="_blank"
              rel="noopener noreferrer"
              className="pill-button-forest text-xs py-2 px-4 flex items-center gap-1.5"
            >
              <MessageCircle className="w-3.5 h-3.5" /> WhatsApp Counsellor
            </a>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-foreground">Full Name *</label>
          <input
            type="text"
            name="full_name"
            required
            value={formData.full_name}
            onChange={handleChange}
            placeholder="e.g. Rahul Sharma"
            className="w-full bg-background border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-forest"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-foreground">Email Address *</label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="e.g. rahul@example.com"
            className="w-full bg-background border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-forest"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-foreground">Phone Number *</label>
          <input
            type="tel"
            name="phone"
            required
            value={formData.phone}
            onChange={handleChange}
            placeholder="+91 9876543210"
            className="w-full bg-background border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-forest"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-foreground">City / Location</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="e.g. Bengaluru"
            className="w-full bg-background border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-forest"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-foreground">Highest Qualification</label>
          <input
            type="text"
            name="qualification"
            value={formData.qualification}
            onChange={handleChange}
            placeholder="e.g. B.Tech Mechanical / Diploma / 12th"
            className="w-full bg-background border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-forest"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-foreground">Select Course Program *</label>
          <select
            name="selected_course"
            value={formData.selected_course}
            onChange={handleChange}
            disabled={coursesLoading || courses.length === 0}
            className="w-full bg-background border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-forest"
          >
            {courses.length === 0 && <option value="">{coursesLoading ? 'Loading courses…' : 'Courses unavailable'}</option>}
            {courses.map((c) => (
              <option key={c.id} value={c.title}>
                {c.title} ({c.duration})
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-foreground">Preferred Training Mode</label>
          <select
            name="preferred_mode"
            value={formData.preferred_mode}
            onChange={handleChange}
            className="w-full bg-background border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-forest"
          >
            <option value="Classroom">Classroom Lab Training (Bengaluru)</option>
            <option value="Online">Online Interactive Classes</option>
            <option value="Hybrid">Hybrid Mode</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-foreground">Message / Remarks</label>
        <textarea
          name="message"
          rows={3}
          value={formData.message}
          onChange={handleChange}
          placeholder="Any specific queries regarding batch timing or accommodation..."
          className="w-full bg-background border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-forest"
        />
      </div>

      {/* File Upload Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 border-t border-border">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-foreground">Upload Student Photo (Optional)</label>
          <div className="relative border border-dashed border-border rounded-lg p-3 text-center hover:bg-background transition-colors cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'photo')}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Upload className="w-4 h-4 text-forest" />
              <span>{photoFile ? photoFile.name : 'Choose JPG/PNG photo (Max 5MB)'}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-foreground">Upload Last Qualification Marksheet (Optional)</label>
          <div className="relative border border-dashed border-border rounded-lg p-3 text-center hover:bg-background transition-colors cursor-pointer">
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => handleFileChange(e, 'marksheet')}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Upload className="w-4 h-4 text-forest" />
              <span>{marksheetFile ? marksheetFile.name : 'Choose PDF/Image (Max 5MB)'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-2">
        <input
          type="checkbox"
          id="consent"
          name="consent"
          checked={formData.consent}
          onChange={handleChange}
          className="rounded border-border text-forest focus:ring-forest"
        />
        <label htmlFor="consent" className="text-xs text-muted-foreground">
          I consent to receiving career guidance &amp; batch alerts from Savvy Training Institute.
        </label>
      </div>

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="pill-button-forest py-3.5 text-sm font-medium w-full md:w-auto self-start mt-2"
      >
        {status === 'submitting' ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Submitting Application...
          </span>
        ) : (
          'Submit Admission Application'
        )}
      </button>
    </form>
  );
};

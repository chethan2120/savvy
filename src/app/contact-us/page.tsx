import React from 'react';
import { PageHero } from '@/components/PageHero';
import { ContactForm } from '@/components/ContactForm';
import { defaultSettings } from '@/lib/data';
import { MapPin, Phone, Mail, Clock, MessageSquare, ExternalLink } from 'lucide-react';

export const metadata = {
  title: 'Contact Us | Savvy Training Institute Bengaluru',
  description:
    'Get in touch with Savvy Training Institute. Phone: +91 90000 12345. Email: contact@savvytraining.example. Training Centre, Bengaluru, Karnataka, India. These contact details are placeholders.',
};

export default function ContactPage() {
  return (
    <div className="flex flex-col gap-12 pb-20">
      {/* Top Banner */}
      <PageHero
        breadcrumbs={[{ label: 'Contact Us' }]}
        title="Get in Touch"
        description="Have questions about course admissions, fee structures, batch timings, or entry requirements? Contact the institute."
        media={{ type: 'image', src: '/images/hero-contact.png' }}
        mediaAlt="Savvy Training Institute campus entrance at dusk"
        actions={
          <>
            <a
              href={`tel:${defaultSettings.phone_primary.replace(/\s/g, '')}`}
              className="pill-button-forest text-xs py-3 px-6 flex items-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5" /> {defaultSettings.phone_primary}
            </a>
            <a
              href={`mailto:${defaultSettings.email_primary}`}
              className="pill-button-secondary text-xs py-3 px-6 flex items-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5" /> {defaultSettings.email_primary}
            </a>
          </>
        }
      />

      {/* Main Split Layout */}
      <section className="site-container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: NAP & Campus Info */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            <div className="editorial-card p-8 flex flex-col gap-6 bg-surface">
              <span className="accent-tag-periwinkle self-start">Campus Office</span>
              <h2 className="text-h2 font-normal text-foreground">Savvy Training Institute</h2>

              <div className="flex flex-col gap-4 text-xs text-muted-foreground">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-forest shrink-0 mt-0.5" />
                  <div className="flex flex-col">
                    <span className="font-semibold text-foreground">Office Address</span>
                    <span>{defaultSettings.address}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-forest shrink-0 mt-0.5" />
                  <div className="flex flex-col">
                    <span className="font-semibold text-foreground">Call Us</span>
                    <a href={`tel:${defaultSettings.phone_primary.replace(/\s/g, '')}`} className="hover:text-forest transition-colors">
                      {defaultSettings.phone_primary}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-forest shrink-0 mt-0.5" />
                  <div className="flex flex-col">
                    <span className="font-semibold text-foreground">Email Us</span>
                    <a href={`mailto:${defaultSettings.email_primary}`} className="hover:text-forest transition-colors">
                      {defaultSettings.email_primary}
                    </a>
                    <span>Placeholder address. Not a working inbox yet.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-forest shrink-0 mt-0.5" />
                  <div className="flex flex-col">
                    <span className="font-semibold text-foreground">Office Hours</span>
                    <span>Monday – Saturday: 9:00 AM – 7:00 PM IST</span>
                    <span>Sunday: Closed</span>
                  </div>
                </div>
              </div>

              <div className="hairline-divider" />

              <a
                href={`https://wa.me/${defaultSettings.whatsapp_number}`}
                target="_blank"
                rel="noopener noreferrer"
                className="pill-button-forest text-xs py-3 text-center flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4" /> WhatsApp Instant Chat
              </a>
            </div>

            {/* Map Link Card */}
            <div className="editorial-card p-6 flex flex-col gap-3 bg-surface border-border">
              <h4 className="text-sm font-semibold text-foreground">Training Centre</h4>
              <p className="text-xs text-muted-foreground">
                Savvy Training Institute, Training Centre, Bengaluru, Karnataka, India.
              </p>

              <div className="overflow-hidden rounded-xl border border-border">
                <iframe
                  title="Savvy Training Institute — Bengaluru training centre"
                  src="https://www.google.com/maps?q=Training%20Centre%2C%20Bengaluru%2C%20Karnataka%2C%20India&output=embed"
                  width="100%"
                  height="260"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="block w-full border-0"
                />
              </div>

              <a
                href="https://www.google.com/maps/dir/?api=1&destination=Training+Centre+Bengaluru+Karnataka+India"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest hover:underline"
              >
                View Location on Google Maps <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <ContactForm />
          </div>
        </div>
      </section>
    </div>
  );
}

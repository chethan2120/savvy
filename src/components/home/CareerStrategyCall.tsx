import Link from 'next/link';
import { Clock, Video } from 'lucide-react';
import { STRATEGY_CALL_LABEL } from '@/lib/academy-content';

export function CareerStrategyCall({ embedded = false }: { embedded?: boolean }) {
  const card = (
        <div className="overflow-hidden rounded-3xl border border-[#EAD9E0] bg-white shadow-sm">
          <div className="grid gap-8 p-6 sm:p-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)] lg:items-center">
            <div>
              <p className="text-sm font-semibold text-[#B83268]">Free strategy call</p>
              <h2 className="mt-2 text-[#641B38]">40-Minute FREE Technical Career Strategy Call</h2>
              <p className="mt-4 max-w-2xl text-[#641B38]">
                Use this call to talk through the teaching qualification, online course or accreditation route that matches what you want to do next. Send a request and the institute will arrange the Zoom meeting. The form does not reserve a time by itself.
              </p>
            </div>
            <div className="rounded-2xl border border-[#EAD9E0] bg-[#F8EDF1] p-5">
              <p className="flex items-center gap-2 text-[#641B38]">
                <Clock className="h-5 w-5 text-[#B83268]" aria-hidden="true" />
                <span>40 minutes</span>
              </p>
              <p className="mt-3 flex items-start gap-2 text-[#641B38]">
                <Video className="mt-0.5 h-5 w-5 shrink-0 text-[#B83268]" aria-hidden="true" />
                <span>Online Zoom meeting. The link is sent after a time is agreed.</span>
              </p>
              <Link
                href="/contact-us?enquiry=strategy"
                className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-[#B83268] px-6 py-3 text-base font-semibold text-white hover:bg-[#641B38]"
              >
                Book Your Free Call
              </Link>
              <p className="mt-3 text-sm text-[#30262B]">The enquiry is labelled {STRATEGY_CALL_LABEL}.</p>
            </div>
          </div>
        </div>
  );

  if (embedded) return card;

  return (
    <section className="border-y border-[#EAD9E0] bg-[#FCF8F7]" aria-label="40-Minute FREE Technical Career Strategy Call">
      <div className="site-container py-12 sm:py-16">{card}</div>
    </section>
  );
}

import { SavvyLogo } from '@/components/brand/SavvyLogo';

/** Decorative layout only. It is not an issued accreditation or qualification. */
export function ExampleCertificate() {
  return (
    <figure className="mx-auto w-full max-w-xl rounded-3xl border border-[#F0D5DE] bg-[#FBF6F8] p-3 sm:p-4">
      <div className="rounded-2xl border-2 border-[#B14B6C] bg-white px-6 py-7 text-center sm:px-8 sm:py-9">
        <div className="mx-auto h-14 w-14">
          <SavvyLogo markClassName="h-full w-full object-contain" />
        </div>
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#B14B6C]">Savvy Training Institute</p>
        <h2 className="mt-3 text-2xl text-[#1F1F1F] sm:text-3xl">Certificate of Accreditation</h2>
        <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-[#565656]">
          This is an example of the certificate layout shown to visitors. It is not an issued accreditation.
        </p>
        <p className="mt-6 text-sm text-[#565656]">This is to certify that</p>
        <p className="mt-1 text-xl text-[#1F1F1F]">Your Business Name</p>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-[#565656]">
          is shown here only as placeholder wording. A real certificate and logo are available from the account after an application is approved.
        </p>
        <p className="mt-6 inline-flex rounded-full bg-[#FBEAF0] px-4 py-1.5 text-sm font-semibold text-[#B14B6C]">Example only</p>
      </div>
      <figcaption className="px-2 pt-3 text-center text-sm text-[#565656]">
        Example certificate layout. No certificate number, date or signature is shown.
      </figcaption>
    </figure>
  );
}

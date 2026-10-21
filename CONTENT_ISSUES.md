# Content Audit & Discrepancy Log

This document records all content inconsistencies, spelling/grammar errors, and structural issues identified on the source website (https://savvytraining.example/) and how they are resolved in this rebuild.

## 1. Course Duration & Fee Discrepancies

| Issue | Source Page Value | Conflict / Observation | Resolution in Rebuild |
|---|---|---|---|
| NDT Level II Duration | Home & Listing: 45 days | Detail page: 35 days | Standardized on **45 Days** for full ASNT Level 2 modules (UT, RT, MT, PT, VT, RTFI). Recorded 35 days as intensive classroom option. |
| Student Count Stat | Home: 10 K<br>Course Listing: 15K+<br>Course Details: 3500+ | Contradictory metrics across templates | Used **10,000+ Students Trained** as standard primary metric, with 3,500+ certified graduates marker. |
| Course Fees | Listed on Home pricing table and detail pages | Fire & Safety: 45K, NDT: 35K, QA/QC: 35K, HVAC: 25K, Revit MEP: 25K, CSWIP 3.1: 1.80L | Preserved exact source fees in dynamic database records. |

## 2. Typos & Source Formatting Errors Fixed

- **"Education award achived"** → Corrected to "Education Award Achieved".
- **"Instructers"** → Corrected to "Instructors".
- **"Sucessfull Projects"** → Corrected to "Successful Projects".
- **Duplicate Admission Steps on About Page**: Source page contained two conflicting Admission Steps sections. Retained Version A (Inquiry Form → Campus Tour → Application → Acceptance) and eliminated duplicate.
- **Home CTA Link**: Pointed `/contact-us-2` to `/contact-us`.
- **Placeholder Designations**: Removed generic Elementor "Designation" text left under student testimonials (Vikash, Sanjay).

## 3. SEO Cleanup

- Removed artificial keyword stuffing blocks (e.g. `"Keywords: visual testing, visual inspection in NDT..."` exposed in body text).
- Preserved all authoritative keywords organically within headings, meta titles, meta descriptions, and JSON-LD structured data.

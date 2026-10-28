'use client';

import React from 'react';
import { CardsParallax, type iCardItem } from "@/components/ui/scroll-cards";

const technicalApproachCards: iCardItem[] = [
	{
		title: "Code Foundations",
		description: "Rigorous immersion in ASME, ASNT SNT-TC-1A, API, and ISO specifications. Students understand physics, wave mechanics, and radiation safety limits.",
		tag: "Phase 01",
		src: "/images/heroes/blogs-hero.jpg",
		link: "#",
		color: "#0A1B30",
		textColor: "#FFFFFF",
	},
	{
		title: "Instrument Calibration",
		description: "Direct equipment calibration using international V1/V2 reference blocks, DAC curves, magnetic field strength yokes, and film densitometers.",
		tag: "Phase 02",
		src: "/images/heroes/about-hero.jpg",
		link: "#",
		color: "#102B4E",
		textColor: "#FFFFFF",
	},
	{
		title: "Practical Flaw Detection",
		description: "Extensive laboratory hours scanning real welded coupons, casting samples, and piping spools with deliberate discontinuities and defect sizing.",
		tag: "Phase 03",
		src: "/images/course/ndt-level-2-course.png",
		link: "#",
		color: "#0A1B30",
		textColor: "#FFFFFF",
	},
	{
		title: "Assessment & Reporting",
		description: "Structured practical and theory examinations. Graduates learn how to prepare code-compliant inspection test reports and sign off quality documentation.",
		tag: "Phase 04",
		src: "/images/course/qa-and-qc-course.png",
		link: "#",
		color: "#102B4E",
		textColor: "#FFFFFF",
	},
];

const TechnicalApproachScrollCards = () => {
  return (
    <div className="relative w-full">
      <CardsParallax items={technicalApproachCards} />
    </div>
  );
};

export { TechnicalApproachScrollCards };

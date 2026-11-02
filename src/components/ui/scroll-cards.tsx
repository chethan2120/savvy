"use client";
import { FC } from "react";
import Image from "next/image";

// Types
interface iCardItem {
	title: string;
	description: string;
	tag: string;
	src: string;
	link: string;
	color: string;
	textColor: string;
}

interface iCardProps extends Omit<iCardItem, "src" | "link" | "tag"> {
	i: number;
	src: string;
}

// Constants
const TOP_VALUES: Record<number, string> = {
	1: "1/2",
	2: "1/2",
	3: "1/2",
	4: "1/2",
};

// Components
const Card: FC<iCardProps> = ({
	title,
	description,
	color,
	textColor,
	i,
	src,
}) => {
	return (
		<div className="h-screen flex items-center justify-center sticky top-0 md:p-0 px-4">
			<div
				className="relative flex flex-col h-[320px] w-full max-w-[700px] py-12 px-10 md:px-12
				rotate-0 md:h-[420px] md:w-[680px] items-center justify-center mx-auto 
				shadow-2xl rounded-3xl overflow-hidden border border-[#E2E7EE]/30"
				style={{ backgroundColor: color }}
			>
				{/* Dark overlay scrim for pristine readability */}
				<div className="absolute inset-0 bg-[#641B38]/75 z-10 backdrop-blur-[2px]" />

				<span className="font-bold relative text-4xl sm:text-5xl md:text-6xl mt-4 z-20 text-center">
					<span
						className="relative font-sans font-black tracking-tight"
						style={{ color: textColor }}
					>
						{title}
					</span>
				</span>
				<div
					className="text-base sm:text-lg md:text-xl font-medium text-center mb-0 z-20 mt-3 max-w-lg tracking-wide px-4"
					style={{ lineHeight: 1.5, color: textColor }}
				>
					{description}
				</div>
				<div className="absolute inset-0 z-0">
					<Image
						className="w-full h-full object-cover"
						src={src}
						alt={title}
						fill
						sizes="(max-width: 768px) 100vw, 700px"
					/>
				</div>
			</div>
		</div>
	);
};

/**
 * CardSlide component displays a series of cards in a vertical scroll layout
 * Each card contains a title, description, and decorative elements
 */
interface iCardSlideProps {
	items: iCardItem[];
}

const CardsParallax: FC<iCardSlideProps> = ({ items }) => {
	return (
		<div className="relative">
			{items.map((project, i) => {
				return <Card key={`p_${i}`} {...project} i={i} />;
			})}
		</div>
	);
};

export { CardsParallax, type iCardItem };

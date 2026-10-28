import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export interface TestimonialAuthor {
  name: string;
  handle: string;
  avatar: string;
}

export interface TestimonialCardProps {
  author: TestimonialAuthor;
  text: string;
  href?: string;
  className?: string;
}

export function TestimonialCard({
  author,
  text,
  href,
  className,
}: TestimonialCardProps) {
  const Card = href ? 'a' : 'div';

  return (
    <Card
      {...(href ? { href, target: "_blank", rel: "noopener noreferrer" } : {})}
      className={cn(
        "flex flex-col rounded-2xl border border-border/80",
        "bg-white shadow-[0_4px_16px_rgba(26,33,55,0.04)]",
        "p-5 sm:p-6 text-start",
        "hover:border-primary/50 hover:shadow-md",
        "w-[300px] sm:w-[340px] shrink-0",
        "transition-all duration-300",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <Avatar className="h-11 w-11 border border-border">
          <AvatarImage src={author.avatar} alt={author.name} />
          <AvatarFallback>{author.name.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col items-start min-w-0">
          <h3 className="text-sm font-bold text-foreground leading-snug truncate max-w-[220px]">
            {author.name}
          </h3>
          <p className="text-xs text-primary font-medium truncate max-w-[220px]">
            {author.handle}
          </p>
        </div>
      </div>
      <p className="mt-4 text-xs sm:text-[13px] text-muted-foreground leading-relaxed line-clamp-4">
        &ldquo;{text}&rdquo;
      </p>
    </Card>
  );
}

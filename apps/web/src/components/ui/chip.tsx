import { cn } from "@/lib/utils";

export function Chip({
	children,
	className,
	variant = "accent",
}: {
	children: React.ReactNode;
	className?: string;
	variant?: "accent" | "muted" | "orange" | "blue";
}) {
	const variants = {
		accent: "border-accent/30 bg-accent/10 text-accent",
		muted: "border-border/70 bg-background/50 text-muted-foreground",
		orange: "border-orange-500/30 bg-orange-500/10 text-orange-400",
		blue: "border-blue-400/30 bg-blue-400/10 text-blue-400",
	};

	return (
		<span
			className={cn(
				"inline-flex border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em]",
				variants[variant],
				className,
			)}
		>
			{children}
		</span>
	);
}

export function MonoLabel({
	children,
	className,
	as: Tag = "span",
}: {
	children: React.ReactNode;
	className?: string;
	as?: "span" | "p" | "h3" | "label";
}) {
	return (
		<Tag
			className={cn(
				"font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground",
				className,
			)}
		>
			{children}
		</Tag>
	);
}

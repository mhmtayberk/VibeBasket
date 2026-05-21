"use client";

import { Loader2, Save } from "lucide-react";
import { useId, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import type { BasketItem } from "@/store/basketStore";

type SaveStackDialogProps = {
	disabled?: boolean;
	items: BasketItem[];
	targetIds: string[];
	onSaved?: () => void;
};

export function SaveStackDialog({
	disabled,
	items,
	targetIds,
	onSaved,
}: SaveStackDialogProps) {
	const [open, setOpen] = useState(false);
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [isSaving, setIsSaving] = useState(false);
	const nameInputId = useId();
	const notesInputId = useId();

	const itemIds = useMemo(() => items.map((item) => item.id), [items]);

	const handleSave = async () => {
		if (!name.trim()) {
			toast.error("Give this stack a name first.");
			return;
		}

		setIsSaving(true);
		try {
			const response = await fetch("/api/stacks", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					name,
					description,
					itemIds,
					targetIds,
				}),
			});

			const payload = await response.json();
			if (!response.ok) {
				throw new Error(payload.error ?? "Failed to save stack.");
			}

			toast.success("Stack saved to your profile.");
			setOpen(false);
			setName("");
			setDescription("");
			onSaved?.();
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to save stack.",
			);
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger
				disabled={disabled}
				className="inline-flex h-11 items-center justify-center gap-2 border border-accent/70 bg-accent/10 px-4 font-mono text-[11px] uppercase tracking-[0.18em] text-accent transition-colors hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-50"
			>
				<Save className="h-4 w-4" />
				Save stack
			</DialogTrigger>
			<DialogContent className="max-w-md border border-border/80 bg-card/95 p-0 text-foreground ring-0">
				<DialogHeader className="border-b border-border/70 px-5 py-5">
					<DialogTitle className="text-xl font-semibold">
						Save current basket
					</DialogTitle>
					<DialogDescription className="max-w-sm text-sm leading-6 text-muted-foreground">
						Capture your current basket and target IDE selection so you can
						reopen it anytime.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 px-5 py-5">
					<div className="space-y-2">
						<label
							htmlFor={nameInputId}
							className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground"
						>
							Stack name
						</label>
						<input
							id={nameInputId}
							value={name}
							onChange={(event) => setName(event.target.value)}
							placeholder="React Stack"
							className="h-11 w-full border border-border/70 bg-background/50 px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none"
						/>
					</div>

					<div className="space-y-2">
						<label
							htmlFor={notesInputId}
							className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground"
						>
							Notes
						</label>
						<textarea
							id={notesInputId}
							value={description}
							onChange={(event) => setDescription(event.target.value)}
							placeholder="Optional notes for when you come back later."
							rows={4}
							className="w-full resize-none border border-border/70 bg-background/50 px-3 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none"
						/>
					</div>

					<div className="grid grid-cols-2 gap-3 border border-border/60 bg-background/30 p-3">
						<div>
							<p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
								Components
							</p>
							<p className="mt-1 text-sm font-medium text-foreground">
								{items.length}
							</p>
						</div>
						<div>
							<p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
								Targets
							</p>
							<p className="mt-1 text-sm font-medium text-foreground">
								{targetIds.length}
							</p>
						</div>
					</div>

					<Button
						type="button"
						onClick={handleSave}
						disabled={isSaving || items.length === 0 || targetIds.length === 0}
						className="h-11 w-full rounded-none border border-accent bg-accent px-4 font-mono text-[11px] uppercase tracking-[0.18em] text-accent-foreground hover:bg-accent/90"
					>
						{isSaving ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							<Save className="h-4 w-4" />
						)}
						{isSaving ? "Saving" : "Save to profile"}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}

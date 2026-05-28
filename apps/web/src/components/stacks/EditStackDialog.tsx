"use client";

import { Loader2, Save, X, Plus, TerminalSquare } from "lucide-react";
import { useState, useId, useMemo, useEffect } from "react";
import { toast } from "sonner";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { TARGET_OPTIONS } from "@/lib/targets";
import { useBasketStore, type BasketItem } from "@/store/basketStore";

type SavedStackSummary = {
	id: string;
	name: string;
	description?: string | null;
	itemCount: number;
	targetIds: string[];
	items: Array<{
		catalogItemId: string;
		snapshotDisplayName: string;
		catalogItemType: BasketItem["type"];
	}>;
};

type EditStackDialogProps = {
	stack: SavedStackSummary | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSaved: (updatedStack: SavedStackSummary) => void;
};

function typeBadge(type: string) {
	const colors =
		type === "mcp"
			? "border-orange-500/30 bg-orange-500/10 text-orange-400"
			: "border-accent/30 bg-accent/10 text-accent";
	return (
		<span className={`shrink-0 font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 border ${colors}`}>
			{type}
		</span>
	);
}

export function EditStackDialog({ stack, open, onOpenChange, onSaved }: EditStackDialogProps) {
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [items, setItems] = useState<SavedStackSummary["items"]>([]);
	const [targetIds, setTargetIds] = useState<string[]>([]);
	const [isSaving, setIsSaving] = useState(false);

	const nameId = useId();
	const descId = useId();

	const basket = useBasketStore((s) => s.items);
	const activeTargetIds = useBasketStore((s) => s.targetIds);

	useEffect(() => {
		if (stack) {
			setName(stack.name);
			setDescription(stack.description ?? "");
			setItems(stack.items ?? []);
			setTargetIds(stack.targetIds ?? []);
		}
	}, [stack]);

	const basketItemsToAdd = useMemo(() => {
		const ids = new Set(items.map((i) => i.catalogItemId));
		return basket.filter((b) => !ids.has(b.id));
	}, [basket, items]);

	const handleSave = async () => {
		if (!stack) return;
		if (!name.trim()) return toast.error("Please enter a stack name.");
		if (items.length === 0) return toast.error("Stack must contain at least 1 component.");
		if (targetIds.length === 0) return toast.error("Stack must target at least 1 IDE.");

		setIsSaving(true);
		try {
			const res = await fetch(`/api/stacks/${stack.id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: name.trim(),
					description: description.trim() || undefined,
					itemIds: items.map((i) => i.catalogItemId),
					targetIds,
				}),
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error ?? "Failed to save.");
			toast.success("Stack updated.");
			onSaved(data);
			onOpenChange(false);
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Failed to update.");
		} finally {
			setIsSaving(false);
		}
	};

	if (!stack) return null;

	const supportedTargets = TARGET_OPTIONS.filter((t) => t.status === "supported");

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				showCloseButton={false}
				className="!max-w-[1280px] !w-[95vw] border border-border/80 bg-card p-0 shadow-[0_0_80px_rgba(0,0,0,0.9)] rounded-[2px] gap-0"
			>
				{/* Header */}
				<div className="flex items-center justify-between border-b border-border/70 px-8 py-5">
					<div>
						<h2 className="text-lg font-semibold flex items-center gap-2">
							<TerminalSquare className="h-5 w-5 text-accent" />
							Edit Stack
						</h2>
						<p className="text-xs text-muted-foreground mt-0.5">
							{stack.name} — {items.length} item{items.length !== 1 ? "s" : ""} · {targetIds.length} target{targetIds.length !== 1 ? "s" : ""}
						</p>
					</div>
					<button
						type="button"
						onClick={() => onOpenChange(false)}
						className="inline-flex h-9 w-9 items-center justify-center border border-border/60 text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
					>
						<X className="h-4 w-4" />
					</button>
				</div>

				{/* Body */}
				<div className="px-8 py-8 space-y-8">
					{/* Name + Basket Overwrite */}
					<div className="flex items-end gap-4">
						<div className="flex-1 space-y-2">
							<label htmlFor={nameId} className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
								Stack Name
							</label>
							<input
								id={nameId}
								value={name}
								onChange={(e) => setName(e.target.value)}
								className="h-12 w-full border border-border/70 bg-background/50 px-4 text-base text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none"
								placeholder="Production Stack"
							/>
						</div>
						<div className="space-y-2">
							<label htmlFor={descId} className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
								Description
							</label>
							<input
								id={descId}
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								className="h-12 w-full min-w-[260px] border border-border/70 bg-background/50 px-4 text-base text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none"
								placeholder="Optional"
							/>
						</div>
						{basket.length > 0 && (
							<button
								type="button"
								onClick={() => {
									if (!window.confirm("Overwrite this stack with active basket content?")) return;
									setItems(basket.map((b) => ({ catalogItemId: b.id, snapshotDisplayName: b.name, catalogItemType: b.type })));
									setTargetIds(activeTargetIds);
									toast.success("Overwritten from basket.");
								}}
								className="shrink-0 h-12 border border-accent/40 bg-accent/10 px-5 font-mono text-[11px] uppercase tracking-[0.14em] text-accent hover:bg-accent hover:text-accent-foreground hover:border-accent transition-all whitespace-nowrap"
							>
								Use Basket ({basket.length})
							</button>
						)}
					</div>

					{/* Components + Targets */}
					<div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10">
						{/* Left: Components */}
						<div className="space-y-5 min-w-0">
							<div className="flex items-center justify-between border-b border-border/50 pb-3">
								<h3 className="font-mono text-[11px] uppercase tracking-[0.16em] text-foreground">
									Components ({items.length})
								</h3>
							</div>

							{items.map((item) => (
								<div key={item.catalogItemId} className="flex items-center justify-between gap-4 border border-border/50 bg-background/30 pl-4 pr-2 py-3.5 group">
									<div className="flex items-center gap-3 min-w-0">
										{typeBadge(item.catalogItemType)}
										<span className="truncate text-sm text-foreground">{item.snapshotDisplayName}</span>
									</div>
									<button
										type="button"
										onClick={() => setItems((p) => p.filter((i) => i.catalogItemId !== item.catalogItemId))}
										className="shrink-0 p-1.5 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive transition-all"
									>
										<X className="h-4 w-4" />
									</button>
								</div>
							))}

							{items.length === 0 && (
								<div className="border border-dashed border-border/50 p-12 text-center">
									<p className="text-sm text-muted-foreground">No components in this stack.</p>
									<p className="text-xs text-muted-foreground/60 mt-2">Add from your active basket below or browse the catalog.</p>
								</div>
							)}

							{/* Add from Basket */}
							{basketItemsToAdd.length > 0 && (
								<div className="border-t border-border/30 pt-5 space-y-3">
									<h3 className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent">
										Add from Active Basket ({basketItemsToAdd.length} available)
									</h3>
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
										{basketItemsToAdd.map((bItem) => (
											<button
												key={bItem.id}
												type="button"
												onClick={() =>
													setItems((p) => [...p, { catalogItemId: bItem.id, snapshotDisplayName: bItem.name, catalogItemType: bItem.type }])
												}
												className="flex items-center gap-3 border border-dashed border-border/50 px-4 py-3 text-left hover:border-accent/40 hover:bg-accent/5 transition-all group"
											>
												{typeBadge(bItem.type)}
												<span className="truncate text-sm text-muted-foreground group-hover:text-foreground">{bItem.name}</span>
												<Plus className="shrink-0 h-4 w-4 text-accent ml-auto" />
											</button>
										))}
									</div>
								</div>
							)}
						</div>

						{/* Right: Targets */}
						<div className="space-y-4 min-w-0">
							<div className="flex items-center justify-between border-b border-border/50 pb-3">
								<h3 className="font-mono text-[11px] uppercase tracking-[0.16em] text-foreground">
									Target IDEs ({targetIds.length})
								</h3>
							</div>

							<div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
								{supportedTargets.map((target) => {
									const active = targetIds.includes(target.id);
									return (
										<button
											key={target.id}
											type="button"
											onClick={() =>
												setTargetIds((p) =>
													p.includes(target.id) ? p.filter((id) => id !== target.id) : [...p, target.id],
												)
											}
											className={`w-full flex items-center justify-between px-4 py-3 text-left border transition-all ${
												active
													? "border-accent bg-accent/10 text-foreground"
													: "border-border/50 bg-background/20 hover:border-border/80 text-muted-foreground hover:text-foreground"
											}`}
										>
											<div>
												<span className="text-sm font-semibold block">{target.label}</span>
												<span className="text-[10px] opacity-70 mt-0.5 block">{target.vendor ?? target.note}</span>
											</div>
											{active && <span className="shrink-0 h-2.5 w-2.5 bg-accent" />}
										</button>
									);
								})}
							</div>
						</div>
					</div>
				</div>

				{/* Footer */}
				<div className="border-t border-border/70 px-8 py-5 flex items-center justify-between">
					<button
						type="button"
						onClick={() => onOpenChange(false)}
						className="px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground hover:bg-background/40 transition-colors"
					>
						Cancel
					</button>
					<button
						type="button"
						onClick={handleSave}
						disabled={isSaving || items.length === 0 || targetIds.length === 0}
						className="inline-flex h-12 items-center gap-2 border border-accent bg-accent px-8 font-mono text-[12px] uppercase tracking-[0.14em] text-accent-foreground hover:bg-accent/90 hover:shadow-[0_0_24px_rgba(160,253,218,0.15)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
					>
						{isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
						{isSaving ? "Saving..." : "Save Changes"}
					</button>
				</div>
			</DialogContent>
		</Dialog>
	);
}

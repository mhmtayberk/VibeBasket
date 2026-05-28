"use client";

import { Loader2, Save, X, Plus, TerminalSquare, AlertCircle, Trash2, ArrowRight } from "lucide-react";
import { useState, useId, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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

export function EditStackDialog({
	stack,
	open,
	onOpenChange,
	onSaved,
}: EditStackDialogProps) {
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [items, setItems] = useState<SavedStackSummary["items"]>([]);
	const [targetIds, setTargetIds] = useState<string[]>([]);
	const [isSaving, setIsSaving] = useState(false);

	const nameInputId = useId();
	const notesInputId = useId();

	const basket = useBasketStore((state) => state.items);
	const activeTargetIds = useBasketStore((state) => state.targetIds);

	// Load initial values from stack
	useEffect(() => {
		if (stack) {
			setName(stack.name);
			setDescription(stack.description ?? "");
			setItems(stack.items || []);
			setTargetIds(stack.targetIds || []);
		}
	}, [stack]);

	const basketItemsToAdd = useMemo(() => {
		const existingIds = new Set(items.map((item) => item.catalogItemId));
		return basket.filter((bItem) => !existingIds.has(bItem.id));
	}, [basket, items]);

	const toggleTarget = (targetId: string) => {
		setTargetIds((prev) =>
			prev.includes(targetId)
				? prev.filter((id) => id !== targetId)
				: [...prev, targetId],
		);
	};

	const handleRemoveItem = (catalogItemId: string) => {
		setItems((prev) => prev.filter((item) => item.catalogItemId !== catalogItemId));
	};

	const handleAddItem = (bItem: BasketItem) => {
		setItems((prev) => [
			...prev,
			{
				catalogItemId: bItem.id,
				snapshotDisplayName: bItem.name,
				catalogItemType: bItem.type,
			},
		]);
	};

	const handleOverwriteWithBasket = () => {
		if (basket.length === 0 || activeTargetIds.length === 0) {
			toast.error("Your active basket is empty! Select at least 1 component and 1 IDE.");
			return;
		}
		if (
			window.confirm(
				"Are you sure you want to overwrite this stack's content with all components and IDEs from your active basket?",
			)
		) {
			setItems(
				basket.map((item) => ({
					catalogItemId: item.id,
					snapshotDisplayName: item.name,
					catalogItemType: item.type,
				})),
			);
			setTargetIds(activeTargetIds);
			toast.success("Stack content overwritten with active basket!");
		}
	};

	const handleSave = async () => {
		if (!stack) return;

		if (!name.trim()) {
			toast.error("Please enter a stack name.");
			return;
		}

		if (items.length === 0) {
			toast.error("Stack must contain at least 1 component.");
			return;
		}

		if (targetIds.length === 0) {
			toast.error("Stack must target at least 1 IDE.");
			return;
		}

		setIsSaving(true);
		try {
			const response = await fetch(`/api/stacks/${stack.id}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					name: name.trim(),
					description: description.trim() || undefined,
					itemIds: items.map((item) => item.catalogItemId),
					targetIds: targetIds,
				}),
			});

			const payload = await response.json();
			if (!response.ok) {
				throw new Error(payload.error ?? "Failed to save stack changes.");
			}

			toast.success("Stack successfully updated.");
			onSaved(payload);
			onOpenChange(false);
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to update stack.",
			);
		} finally {
			setIsSaving(false);
		}
	};

	const targetLabelMap = useMemo(
		() =>
			new Map<string, string>(
				TARGET_OPTIONS.map((target) => [target.id, target.label]),
			),
		[],
	);

	if (!stack) return null;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-7xl w-[95vw] lg:w-[90vw] border border-border/80 bg-card/98 p-0 text-foreground ring-0 shadow-[0_0_50px_rgba(0,0,0,0.8)] rounded-[2px] transition-all">
				<DialogHeader className="border-b border-border/70 px-8 py-6">
					<DialogTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
						<TerminalSquare className="h-5 w-5 text-accent" />
						Edit Stack: {stack.name}
					</DialogTitle>
					<DialogDescription className="max-w-2xl text-xs leading-5 text-muted-foreground mt-1">
						Customize your stack name, description, components (MCP servers, Skills), and target IDEs directly.
					</DialogDescription>
				</DialogHeader>

				<div className="max-h-[75vh] overflow-y-auto px-8 py-6 space-y-8">
					{/* Stack Name & Description */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div className="space-y-2">
							<label
								htmlFor={nameInputId}
								className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
							>
								Stack Name
							</label>
							<input
								id={nameInputId}
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="E.g., Production Stack"
								className="h-11 w-full border border-border/70 bg-background/50 px-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none rounded-[2px]"
							/>
						</div>

						<div className="space-y-2">
							<label
								htmlFor={notesInputId}
								className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
							>
								Description (Optional)
							</label>
							<input
								id={notesInputId}
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								placeholder="Optional notes for this stack."
								className="h-11 w-full border border-border/70 bg-background/50 px-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none rounded-[2px]"
							/>
						</div>
					</div>

					{/* Overwrite with Active Basket Shortcut */}
					{basket.length > 0 && (
						<div className="border border-accent/25 bg-accent/5 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-[2px]">
							<div className="text-xs">
								<p className="font-semibold text-accent text-sm">Active Basket Shortcut</p>
								<p className="text-muted-foreground mt-1 leading-relaxed">
									Quickly replace this stack's components and targets with your current active basket selection ({basket.length} components, {activeTargetIds.length} IDE targets).
								</p>
							</div>
							<button
								type="button"
								onClick={handleOverwriteWithBasket}
								className="inline-flex h-9 items-center justify-center gap-1.5 border border-accent/40 bg-accent/10 px-4 font-mono text-[10px] uppercase tracking-wider text-accent transition-colors hover:bg-accent hover:text-accent-foreground rounded-[2px] self-start sm:self-auto whitespace-nowrap"
							>
								Overwrite Content
							</button>
						</div>
					)}

					{/* Layout Split: Left Components, Right Target IDEs */}
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
						{/* Components Section */}
						<div className="space-y-4">
							<h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground flex items-center justify-between border-b border-border/40 pb-2">
								<span>Components ({items.length})</span>
								<span className="text-[9px] text-muted-foreground normal-case">At least 1 required</span>
							</h3>

							{/* Current Stack Items */}
							<div className="space-y-2 max-h-56 overflow-y-auto pr-2 custom-scrollbar">
								{items.length === 0 ? (
									<p className="text-xs text-muted-foreground italic bg-background/30 p-4 text-center border border-dashed border-border/50 rounded-[2px]">
										No components in this stack. Add items from your active basket below.
									</p>
								) : (
									items.map((item) => (
										<div
											key={item.catalogItemId}
											className="flex items-center justify-between gap-3 border border-border/60 bg-background/30 px-3.5 py-2.5 rounded-[2px]"
										>
											<div className="flex items-center gap-2.5 min-w-0">
												<span
													className={`inline-flex px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-wider border rounded-[1px] ${
														item.catalogItemType === "mcp"
															? "border-orange-500/20 bg-orange-500/5 text-orange-400"
															: "border-accent/20 bg-accent/5 text-accent"
													}`}
												>
													{item.catalogItemType}
												</span>
												<p className="truncate text-xs text-foreground font-medium">
													{item.snapshotDisplayName}
												</p>
											</div>
											<button
												type="button"
												onClick={() => handleRemoveItem(item.catalogItemId)}
												className="inline-flex h-7 w-7 items-center justify-center text-muted-foreground transition-colors hover:text-destructive"
												aria-label="Remove item"
											>
												<X className="h-4 w-4" />
											</button>
										</div>
									))
								)}
							</div>

							{/* Add from Active Basket */}
							{basketItemsToAdd.length > 0 && (
								<div className="space-y-2.5 mt-4 pt-2 border-t border-border/20">
									<p className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent">
										Add from Active Basket
									</p>
									<div className="grid grid-cols-1 gap-2 max-h-44 overflow-y-auto pr-2 custom-scrollbar">
										{basketItemsToAdd.map((bItem) => (
											<div
												key={bItem.id}
												className="flex items-center justify-between gap-3 border border-dashed border-border/60 bg-background/10 pl-3.5 pr-2 py-2 rounded-[2px]"
											>
												<div className="flex items-center gap-2 min-w-0">
													<span className="inline-flex px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-wider border rounded-[1px] border-border/40 bg-background/30 text-muted-foreground">
														{bItem.type}
													</span>
													<span className="truncate text-xs text-muted-foreground font-medium">
														{bItem.name}
													</span>
												</div>
												<button
													type="button"
													onClick={() => handleAddItem(bItem)}
													className="inline-flex h-7 w-7 items-center justify-center border border-accent/40 bg-accent/5 hover:bg-accent hover:text-accent-foreground text-accent transition-all rounded-[2px]"
												>
													<Plus className="h-4 w-4" />
												</button>
											</div>
										))}
									</div>
								</div>
							)}
						</div>

						{/* Targets Section */}
						<div className="space-y-4">
							<h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground flex items-center justify-between border-b border-border/40 pb-2">
								<span>Target IDEs ({targetIds.length})</span>
								<span className="text-[9px] text-muted-foreground normal-case">At least 1 required</span>
							</h3>

							<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 max-h-[420px] overflow-y-auto pr-2 custom-scrollbar">
								{TARGET_OPTIONS.map((target) => {
									const isSelected = targetIds.includes(target.id);
									return (
										<button
											key={target.id}
											type="button"
											onClick={() => toggleTarget(target.id)}
											className={`flex flex-col items-start p-3 text-left border rounded-[2px] transition-all duration-200 ${
												isSelected
													? "border-accent bg-accent/10 text-foreground shadow-[0_0_12px_rgba(160,253,218,0.08)]"
													: "border-border/60 bg-background/20 hover:border-border text-muted-foreground hover:text-foreground"
											}`}
										>
											<span className="text-xs font-semibold">{target.label}</span>
											<span className="text-[8px] opacity-80 mt-0.5 truncate max-w-full">
												{target.vendor ?? "IDE"}
											</span>
										</button>
									);
								})}
							</div>
						</div>
					</div>
				</div>

				{/* Footer Controls */}
				<div className="border-t border-border/70 px-8 py-5 flex items-center justify-between bg-card/50">
					<button
						type="button"
						onClick={() => onOpenChange(false)}
						className="px-4 py-2.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
					>
						Cancel
					</button>

					<Button
						type="button"
						onClick={handleSave}
						disabled={isSaving || items.length === 0 || targetIds.length === 0}
						className="h-11 border border-accent bg-accent hover:bg-accent/90 text-accent-foreground font-mono text-[11px] uppercase tracking-[0.18em] rounded-none px-6"
					>
						{isSaving ? (
							<Loader2 className="h-4 w-4 animate-spin mr-1.5" />
						) : (
							<Save className="h-4 w-4 mr-1.5" />
						)}
						{isSaving ? "Saving..." : "Save Changes"}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}

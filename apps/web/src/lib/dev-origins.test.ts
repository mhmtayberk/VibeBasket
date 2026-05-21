import { describe, expect, it, vi } from "vitest";

vi.mock("node:os", () => ({
	default: {
		networkInterfaces: () => ({
			en0: [
				{ family: "IPv4", address: "192.168.1.12", internal: false },
				{ family: "IPv6", address: "fe80::1", internal: false },
			],
			lo0: [{ family: "IPv4", address: "127.0.0.1", internal: true }],
		}),
	},
}));

describe("getAllowedDevOrigins", async () => {
	const { getAllowedDevOrigins } = await import("./dev-origins");

	it("includes localhost defaults and active local IPv4 addresses", () => {
		expect(getAllowedDevOrigins()).toEqual([
			"localhost",
			"*.localhost",
			"127.0.0.1",
			"127.*.*.*",
			"::1",
			"192.168.1.12",
		]);
	});
});

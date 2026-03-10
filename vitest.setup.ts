import { vi } from "vitest";

Object.defineProperty(document, "head", {
	value: {
		appendChild: vi.fn(),
	},
});

Object.defineProperty(document, "querySelector", {
	value: vi.fn(),
});

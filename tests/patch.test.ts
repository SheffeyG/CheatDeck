import { afterEach, describe, expect, it, vi } from "vitest";

/**
 * Regression tests for issue #75:
 *
 * `fakeRenderComponent()` from @decky/ui calls `fun(hooks)` and throws
 * `TypeError: fun is not a function` when it receives `undefined`. The plugin
 * used to call it at module scope with the result of a best-effort webpack
 * lookup, so a Steam client update prevented the whole plugin from loading.
 *
 * @decky/ui is replaced by a mock that reproduces the real crash semantics, so
 * these tests exercise the actual resolution code in src/patch.tsx.
 */

type UiMock = Record<string, unknown>;

const fakeComponent = class FakeLibraryContextMenu {};

/** Steam exports a function whose source text contains the marker strings. */
const createSteamExport = () => {
  const exported = function LibraryContextMenuExport() {};
  exported.toString = () => "().LibraryContextMenu navigator: someImpl";
  return exported;
};

const createUiMock = (overrides: UiMock = {}): UiMock => ({
  // Mirrors @decky/ui: throws when the component cannot be resolved.
  fakeRenderComponent: vi.fn((fun: unknown) => {
    if (typeof fun !== "function") throw new TypeError("fun is not a function");
    return { type: fakeComponent };
  }),
  findModuleByExport: vi.fn(() => undefined),
  findInReactTree: vi.fn(() => undefined),
  findInTree: vi.fn(() => undefined),
  afterPatch: vi.fn(() => ({ unpatch: vi.fn() })),
  MenuItem: () => null,
  Navigation: { Navigate: vi.fn() },
  ...overrides,
});

const loadPatchModule = async (ui: UiMock) => {
  vi.resetModules();
  vi.doMock("@decky/ui", () => ui);
  return await import("../src/patch");
};

describe("patch module loading (issue #75)", () => {
  afterEach(() => {
    vi.doUnmock("@decky/ui");
    vi.resetModules();
  });

  it("loads when the Steam module cannot be resolved", async () => {
    const ui = createUiMock();
    const patch = await loadPatchModule(ui);

    expect(patch.LibraryContextMenu).toBeUndefined();
    // The component must never be handed to fakeRenderComponent as undefined.
    expect(ui.fakeRenderComponent).not.toHaveBeenCalled();
  });

  it("resolves the component when Steam exposes it", async () => {
    const ui = createUiMock({
      findModuleByExport: vi.fn(() => ({ LibraryContextMenu: createSteamExport() })),
    });
    const patch = await loadPatchModule(ui);

    expect(patch.LibraryContextMenu).toBe(fakeComponent);
  });

  it("survives a failing fakeRenderComponent", async () => {
    const ui = createUiMock({
      findModuleByExport: vi.fn(() => ({ LibraryContextMenu: createSteamExport() })),
      fakeRenderComponent: vi.fn(() => {
        throw new Error("stub render failed");
      }),
    });

    await expect(loadPatchModule(ui)).resolves.toBeDefined();
  });

  it("returns an inert patch object for an unavailable component", async () => {
    const ui = createUiMock();
    const patch = await loadPatchModule(ui);

    const patches = patch.default(undefined);
    expect(typeof patches.unpatch).toBe("function");
    expect(() => patches.unpatch()).not.toThrow();
    expect(ui.afterPatch).not.toHaveBeenCalled();
  });
});

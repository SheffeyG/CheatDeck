import { describe, expect, it } from "vitest";

import { decodeStoredCustomOptions } from "../src/domain/settings";

describe("settings", () => {
  it("accepts only valid V2 custom options and preserves IDs", () => {
    const value = [
      {
        id: "keep-me",
        label: "Environment",
        definition: { kind: "environment", name: "ENV", value: "1" },
      },
      { label: "legacy", type: "env", key: "OLD" },
      {
        id: "invalid",
        label: "Invalid",
        definition: { kind: "environment", name: "BAD-NAME", value: "1" },
      },
      {
        id: "keep-me",
        label: "Duplicate",
        definition: { kind: "environment", name: "OTHER", value: "1" },
      },
      {
        id: "blank-label",
        label: " ",
        definition: { kind: "environment", name: "OTHER", value: "1" },
      },
    ];

    expect(decodeStoredCustomOptions(value)).toEqual([value[0]]);
  });
});

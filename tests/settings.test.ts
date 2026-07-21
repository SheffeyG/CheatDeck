import { describe, expect, it } from "vitest";

import { decodeStoredCustomOptions } from "../src/domain/settings";

describe("settings", () => {
  it("accepts only valid V6 custom options and preserves IDs", () => {
    const value = [
      {
        id: "keep-me",
        label: "Environment",
        definition: { kind: "environment", name: "ENV", value: "1" },
      },
      {
        id: "raw-prefix",
        label: "Prefix",
        definition: { kind: "prefix", command: "wrapper", argv: [`"hello world"`, "$HOME/file"] },
      },
      {
        id: "flag",
        label: "Flag",
        definition: { kind: "argument", flag: "-novid", argv: [] },
      },
      {
        id: "valued-argument",
        label: "Valued Argument",
        definition: { kind: "argument", flag: "-width", argv: ["1920"] },
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

    expect(decodeStoredCustomOptions(value)).toEqual([value[0], value[1], value[2], value[3]]);
  });

  it("rejects structured definitions containing reserved words", () => {
    expect(
      decodeStoredCustomOptions([
        { id: "separator", label: "Separator", definition: { kind: "prefix", command: "--", argv: [] } },
        { id: "assignment", label: "Assignment", definition: { kind: "prefix", command: "ENV=1", argv: [] } },
        { id: "flag", label: "Flag", definition: { kind: "prefix", command: "-wrapper", argv: [] } },
        {
          id: "marker",
          label: "Marker",
          definition: { kind: "argument", flag: "-x", argv: ["%command%"] },
        },
      ]),
    ).toEqual([]);
  });
});

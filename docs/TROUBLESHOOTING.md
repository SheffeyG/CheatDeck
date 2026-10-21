# Troubleshooting

This page collects solutions for the problems reported most often in the issue
tracker. Each section names the related issue so you can check whether it still
matches your situation.

## How CheatDeck starts a trainer

CheatDeck does not run the trainer itself. It writes two launch options for the
game:

| Launch option | Purpose |
|---|---|
| `PROTON_REMOTE_DEBUG_CMD=<trainer>` | Proton starts the given Windows program through `wine` in the same prefix, right before the game. |
| `PRESSURE_VESSEL_FILESYSTEMS_RW=<directory>` | Makes the trainer's folder visible inside the Steam Linux Runtime sandbox. |

Consequently, everything that can go wrong sits in Proton, Wine, the game or the
trainer itself — not in the plugin UI. That is why most of the reports below are
solved by changing the compatibility tool or installing runtime dependencies.

---

## The plugin does not load at all (`TypeError: fun is not a function`) — #75

**Symptom:** Decky shows the plugin as failed, the log contains
`TypeError: fun is not a function at Module.fakeRenderComponent`.

**Cause:** The plugin adds its "CheatDeck" entry to Steam's game context menu.
To do so it resolves an internal Steam UI module and passes it to
`fakeRenderComponent()`. When a Steam client update changes that module, the
lookup returns `undefined` and `fakeRenderComponent()` throws while the plugin
is being imported — the whole plugin fails, not only the menu entry.

**Solution:**

1. Update CheatDeck to the latest release (this repository makes the lookup
   defensive: if the module cannot be resolved, only the context menu entry is
   skipped, the plugin keeps loading and the reason is written to the log).
2. If you are on an older version, install the current ZIP from the releases
   page — the Decky store build is often behind (see below).

## Decky store offers an outdated version — #95

The store listing is updated with a delay. Install manually:

1. Enable **Developer Mode** in Decky Loader settings.
2. Download `CheatDeck.zip` from the [latest release](https://github.com/SheffeyG/CheatDeck/releases/latest)
   or the [nightly build](https://nightly.link/SheffeyG/CheatDeck/workflows/dev-build/main/CheatDeck.zip).
3. Install that ZIP via *Developer settings → Install plugin from ZIP*.

> Use `CheatDeck.zip`, not GitHub's automatically generated `Source code.zip`.
> The source archive does not contain the packaged plugin.

## The game starts, but the trainer window never appears — #19, #83, #84, #91

Work through these steps in order.

### 1. Rule out the Proton 11 window-handling regression

Proton 11 / recent Proton Experimental builds broke the window handling of
sidecar programs: the trainer is started (the Proton log shows
`Loaded ... Trainer.exe`) but its window can never be focused; gamescope shows
an endless "wait / force close" dialog.

- Use **Proton 10.0-4**, **Proton 9.0-4** or a **GE-Proton** build for the game.
- The regression was fixed in a later Proton Experimental (see #84) — update
  Experimental and retest before pinning an older version.
- Proton-CachyOS 11.0 carried the same regression; downgrade to 11.0-20260602
  or newer once fixed (#83).

### 2. Install the .NET framework the trainer expects

Many FLiNG trainers released after mid-2023 are built against .NET Framework
4.x, while Proton ships Wine-Mono only. Symptoms: the trainer process starts and
exits immediately, or nothing happens at all (#13).

```bash
# from Desktop Mode, with the game's prefix selected
protontricks <appid> dotnet48
```

If `dotnet48` reports that a newer version is already present, install
`dotnet40` instead. Then start the game again.

### 3. Check the basics

- **Developer Mode** must be enabled in Steam, and the CEF debugger must be
  available (Decky requires it).
- Try a **windowed** game mode; some games keep the trainer window behind the
  fullscreen surface.
- **Rename the trainer** to a short path without spaces or non-ASCII characters,
  e.g. `/home/deck/trainers/t.exe`.
- Try an **older trainer build** and/or force **DirectX 12** for the game.
- Some game/trainer combinations are simply incompatible; report working ones in
  [Game Compatibility Discussion](https://github.com/SheffeyG/CheatDeck/discussions/23).

## "Another instance is already running" / trainer does not start again — #46

**Cause:** Proton only kills the sidecar when the game exits normally. After a
crash or a force-closed game the trainer stays alive, keeps its single-instance
mutex and blocks the next launch.

**Solution (this repository):** open *CheatDeck → Normal → Trainer process*. The
row shows the running PIDs of the configured trainer and offers **End process**.
The backend matches processes by the exact trainer path, so unrelated programs
are never touched.

**Manual fallback:**

```bash
pgrep -af "Trainer.exe"          # list matching processes
pkill -f "My Game Trainer.exe"   # stop them
```

## Multiple trainers for one game — #20, #46

Proton supports exactly one `PROTON_REMOTE_DEBUG_CMD`, so CheatDeck can start a
single sidecar program. Workaround: write a small shell script that launches the
trainers one after another and select it as the sidecar program.

```bash
#!/bin/bash
wine "/path/trainer-a.exe" &
wine "/path/trainer-b.exe" &
wait
```

## Feature requests that are not implemented

| Issue | Request | Status |
|---|---|---|
| #5 | Start delay for the sidecar | Use a wrapper script with `sleep` |
| #8 | Lutris support | Not possible — launch options are Steam-only |
| #9 | Heroic support | Not possible — launch options are Steam-only |
| #18 | WeMod integration | WeMod is a hosted service, not a local executable |
| #74 | DLSS-Enabler support | Available as a custom option, see *Custom* tab |

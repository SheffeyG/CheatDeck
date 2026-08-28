# CheatDeck

[![Nightly Action Status](https://img.shields.io/github/actions/workflow/status/SheffeyG/CheatDeck/dev-build.yml?label=nightly%20build)](https://nightly.link/SheffeyG/CheatDeck/workflows/dev-build/main/CheatDeck.zip)
![Release Store Downloads](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fplugins.deckbrew.xyz%2Fplugins%3Fquery%3DCheatDeck&query=%24%5B%3A1%5D.downloads&suffix=%20installs&label=decky%20store)
![Testing Store Downloads](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Ftesting.deckbrew.xyz%2Fplugins%3Fquery%3DCheatDeck&query=%24%5B%3A1%5D.downloads&suffix=%20installs&label=testing%20store)
[![License: GPL 3.0](https://img.shields.io/github/license/SheffeyG/CheatDeck)](./LICENSE)

CheatDeck is a [Decky Loader](https://github.com/SteamDeckHomebrew/decky-loader) plugin for launching sidecar programs and managing launch options on your Steam Deck.

## Installation

1. Enable Developer Mode in Decky Loader.
2. Download `CheatDeck.zip` from the [latest release](https://github.com/SheffeyG/CheatDeck/releases/latest) or the [latest nightly build](https://nightly.link/SheffeyG/CheatDeck/workflows/dev-build/main/CheatDeck.zip).
3. Install the ZIP through Decky Loader's developer settings.

> [!IMPORTANT]
> Download **`CheatDeck.zip`**, not GitHub's automatically generated **`Source code.zip`**. The source archive does not contain the packaged Decky plugin.

## Normal Options

The *Normal* tab provides the primary Sidecar Program and Language controls.

### Sidecar Program

1. Download a trusted Windows sidecar program, such as a trainer or utility, to your Steam Deck.
2. Access the game context menu to find the `CheatDeck` menu item.
   <details open> <summary>screenshot</summary> <img src="docs/menu.jpg" width="600"> </details>
3. Enable **Sidecar Program** and select an `.exe` or `.bat` file. Changes are saved automatically.
   <details open> <summary>screenshot</summary> <img src="docs/settings.jpg" width="600"> </details>
4. Launch the game. If the sidecar window does not appear in front, press the Steam button to switch between open windows.
   <details open> <summary>screenshot</summary> <img src="docs/trainer.jpg" width="600"> </details>

The selected program starts alongside the primary program in the same Proton/Wine environment and stops when the primary program exits.

> [!NOTE]
> This assumes Steam's launch target is the Windows program that should share
> the sidecar's Proton/Wine environment. A Windows launcher started directly
> under Proton can share that environment with the sidecar. A Linux-native
> game manager or launcher that starts its own Proton/umu process (for example,
> a launcher shortcut managed by another Decky plugin) may instead leave the
> sidecar attached to Steam's outer process while the game runs in a separate
> inner Proton environment. CheatDeck does not control that nested boundary,
> so sidecar support is not guaranteed for these launchers. If the launcher
> provides its own Proton selection, leave Steam's **Force the use of a
> specific Steam Play compatibility tool** disabled unless the launcher
> documents an explicit sidecar integration.

### Language

Some games use environment locale variables to choose their language or regional behavior. Enable **Language** and select a locale code to set both `LANG` and `HOST_LC_ALL`. Disable the option to restore the default environment.

### Troubleshooting

- Ensure Developer Mode is enabled in your Steam settings.
- If you cannot interact with the sidecar program, switch the game to windowed mode.
- If a program or trainer does not launch, it may require [.NET Core](https://dotnet.microsoft.com/en-us/download/dotnet), [.NET Framework](https://dotnet.microsoft.com/en-us/download/dotnet-framework), or the [Visual C++ Redistributable](https://learn.microsoft.com/en-us/cpp/windows/latest-supported-vc-redist) that is not present in your compatibility environment. Use `protontricks` to install required dependencies.

> If you've successfully used CheatDeck with a game and sidecar trainer program, please share your compatibility findings or solutions in our [Game Compatibility Discussion](https://github.com/SheffeyG/CheatDeck/discussions/23). Your feedback helps the community!

## Advanced Options

CheatDeck provides several launch-option controls for quick access in the *Advanced* tab.

| Setting | Launch Option | Purpose |
|---|---|---|
| Desktop Behavior | `SteamDeck=0` | Makes games use desktop behavior instead of Steam Deck-specific presets, launchers, or restricted settings. |
| Disable FSYNC | `PROTON_NO_FSYNC=1` | Disables futex-based synchronization as a compatibility fallback for freezes or synchronization problems. This may reduce performance. |
| WineD3D Compatibility Renderer | `PROTON_USE_WINED3D=1` | Uses Wine's OpenGL renderer instead of Proton's Vulkan translation layers. This may fix DXVK or Vulkan rendering problems, but usually reduces performance. |
| Compatibility Data Redirection | `STEAM_COMPAT_DATA_PATH=<path>` | Stores compatibility data at a selected path to share dependencies or save disk space. |
| Audio Latency | `PULSE_LATENCY_MSEC=30`, `60`, or `90` | Works around audio crackling or dropouts. Higher values may improve stability but increase audio delay; disabling the option removes the override. |

> [!WARNING]
> Compatibility data can contain game saves. You may need to migrate saves when changing `STEAM_COMPAT_DATA_PATH`.

## Custom Options

### Definitions

Each Custom Option has a label and one Definition. CheatDeck infers the Definition type from the text instead of requiring a separate type selection.

#### Environment Variable

Use one static assignment:

```text
MANGOHUD=1
LANG="de_DE.UTF-8"
```

The name must match `[A-Za-z_][A-Za-z0-9_]*`. The value is parsed as a static shell word and stored as its literal value. Quotes can group spaces or special characters, but dynamic expressions such as `ENV=$HOME`, command substitutions, and multiple assignments are rejected.

Environment variables use their name as the unique slot. Enabling an option replaces existing assignments with the same name, while disabling it removes assignments for that name.

#### Prefix Command

Use a command followed by zero or more arguments:

```text
gamemoderun
gamescope -f
wrapper "argument with spaces"
```

Prefix commands run before `%command%`. When several prefix commands are enabled, CheatDeck separates them with `--`. Definitions that share the same command are combined through their argument lists. Command and argument words retain their original quoting and expansion text.

A prefix command cannot be empty, begin with `-`, look like an environment assignment, or use reserved markers such as `%command%` and `--`.

#### Argument

Use a flag followed by zero or more values:

```text
-windowed
-width 1920
-resolution 1920 1080
```

Arguments are placed after `%command%`. The leading flag must begin with `-`, and its values are stored as explicit raw words. A value that also begins with `-` must be quoted so it is not confused with the next flag:

```text
-offset '-1'
```

#### Source Safety

The complete launch-options document follows this restricted grammar:

```
[environment assignments] [prefix commands] %command% [flags and arguments]
```

CheatDeck preserves untouched source and patches only the spans owned by an edit. Unsupported shell operators, redirects, comments, malformed quoting, mixed definitions, and ambiguous `%command%` markers make the document read-only rather than risking a partial or destructive edit.

### Initial Presets

When no Custom Options configuration exists, CheatDeck initializes the following presets as ordinary custom options. They can be toggled, edited, or deleted and are not restored after deletion.

| Preset | Definition | Purpose |
|---|---|---|
| Lossless Scaling | `~/lsfg` | Enables [LSFG-VK](https://github.com/PancakeTAS/lsfg-vk) frame generation. Requires Lossless Scaling and the [decky-lsfg-vk](https://github.com/xXJSONDeruloXx/decky-lsfg-vk) plugin. |
| OptiScaler Patch | `~/fgmod/fgmod` | Applies the [OptiScaler](https://github.com/optiscaler/OptiScaler) patch. Requires the [Decky-Framegen](https://github.com/xXJSONDeruloXx/Decky-Framegen) plugin. |
| OptiScaler Unpatch | `~/fgmod/fgmod-uninstaller.sh` | Removes the OptiScaler patch. Patch and unpatch are independent; CheatDeck does not enforce mutual exclusion. |

## Acknowledgments

- [decky-steamgriddb](https://github.com/SteamGridDB/decky-steamgriddb) - The most powerful decky plugin, start point of CheatDeck.
- [decky-autosuspend](https://github.com/jurassicplayer/decky-autosuspend) - Clean implementation and structure.
- [SDH-CssLoader](https://github.com/DeckThemes/SDH-CssLoader) - Beautiful UI and rich customization.

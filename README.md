# CheatDeck

[![Nightly Action Status](https://img.shields.io/github/actions/workflow/status/SheffeyG/CheatDeck/dev-build.yml?label=nightly%20build)](https://nightly.link/SheffeyG/CheatDeck/workflows/dev-build/main/CheatDeck.zip)
![Release Store Downloads](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fplugins.deckbrew.xyz%2Fplugins%3Fquery%3DCheatDeck&query=%24%5B%3A1%5D.downloads&suffix=%20installs&label=decky%20store)
![Testing Store Downloads](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Ftesting.deckbrew.xyz%2Fplugins%3Fquery%3DCheatDeck&query=%24%5B%3A1%5D.downloads&suffix=%20installs&label=testing%20store)
[![License: GPL 3.0](https://img.shields.io/github/license/SheffeyG/CheatDeck)](./LICENSE)

CheatDeck is a [Decky Loader](https://github.com/SteamDeckHomebrew/decky-loader) plugin to make it more conveniently to use cheat or trainer and manage launch options on your Steam Deck.

> You can download the latest nightly build of CheatDeck from the [following link](https://nightly.link/SheffeyG/CheatDeck/workflows/dev-build/main/CheatDeck.zip) and installing as ZIP in Decky Loader, or by directly installing from URL using `https://nightly.link/SheffeyG/CheatDeck/workflows/dev-build/main/CheatDeck.zip` in Decky Loader.

## Basic Usage

1. Download any cheat or trainer from a trusted channel to your Steam Deck.
2. Access the game context menu to find the `CheatDeck` menu item.
   <details open> <summary>screenshot</summary> <img src="docs/menu.jpg" width="600"> </details>
3. Enable the cheat setting and select the cheat EXE file, then save settings.
   <details open> <summary>screenshot</summary> <img src="docs/settings.jpg" width="600"> </details>
4. After launching the game, the cheat window should appear automatically.
If it doesn't, press the Steam key to toggle between the game and cheat interfaces.
    <details open> <summary>screenshot</summary> <img src="docs/trainer.jpg" width="600"> </details>

### Troubleshooting

- Ensure Developer Mode is enabled in your Steam settings.
- File or folder names must not contain slashes or quotes.
- If you cannot activate the selected cheat, switch the game to windowed mode.
- If a program or trainer does not launch, it may require [.NET Core](https://dotnet.microsoft.com/en-us/download/dotnet), [.NET Framework](https://dotnet.microsoft.com/en-us/download/dotnet-framework), or the [Visual C++ Redistributable](https://learn.microsoft.com/en-us/cpp/windows/latest-supported-vc-redist) that is not present in your compatibility environment. Use `protontricks` to install required dependencies.

### Share Your Experience!

If you've successfully used CheatDeck with a game or trainer, please share your compatibility findings or solutions in our [Game Compatibility Discussion](https://github.com/SheffeyG/CheatDeck/discussions/23). Your feedback helps the community!

## Advanced Options

CheatDeck provides several launch-option controls for quick access in the *Advanced* tab.

- **Language**

  Some games read the `LANG` environment variable. CheatDeck offers a preset of common locale identifiers to make switching locales easier.

- **DXVK_ASYNC**

  Enables asynchronous shader compilation in DXVK. If you are using an older Proton-GE release (earlier than 7-45), enabling this may help with shader compilation behavior.

- **RADV_PERFTEST**

  Enables shader pre-caching to reduce stutter and frame flicker. This is often a better option for later Proton-GE builds.

- **STEAM_COMPAT_DATA_PATH**

  Specify a folder to share compatibility data between games. This could avoids repeatedly upgrading dependencies and can save disk space.
  **Note:** Game saves are stored in the compat layer; you may need to migrate them when changing the compat data path.

## Custom Options

### Initial Presets

When no Custom Options configuration exists, CheatDeck initializes the following presets as ordinary custom options. They can be toggled, edited, or deleted and are not restored after deletion.

- **Lossless Scaling**

  Runs `~/lsfg` to enable [LSFG-VK](https://github.com/PancakeTAS/lsfg-vk) frame generation. It requires the Lossless Scaling tool and the [decky-lsfg-vk](https://github.com/xXJSONDeruloXx/decky-lsfg-vk) plugin.

- **OptiScaler Patch**

  Runs `~/fgmod/fgmod` to apply the [OptiScaler](https://github.com/optiscaler/OptiScaler) patch. It requires the [Decky-Framegen](https://github.com/xXJSONDeruloXx/Decky-Framegen) plugin.

- **OptiScaler Unpatch**

  Runs `~/fgmod/fgmod-uninstaller.sh` to remove the OptiScaler patch. Patch and unpatch are independent custom options; CheatDeck does not enforce mutual exclusion between them.

### Definitions

CheatDeck edits a restricted, source-preserving launch-options grammar:
```
[environment assignments] [prefix commands] %command% [flags and arguments]
```
Environment assignments must appear first and names must match `[A-Za-z_][A-Za-z0-9_]*`. Multiple prefix commands use a standalone `--` separator. Custom arguments store their associated argv explicitly, so adjacent game arguments are never inferred or removed. Unsupported shell operators, redirects, comments, malformed quoting, and ambiguous markers make the document read-only rather than risking a partial edit.

Custom option types are inferred from a single Definition field. A single static `NAME=value` assignment is an environment variable, an input beginning with `-` is an argument, and any other input is a prefix command. Prefix and argument words retain their raw quoting and expansions; an argument value beginning with `-` must be quoted, such as `-offset '-1'`, to distinguish it from the next flag. Environment values are stored as parsed literal values and rendered canonically. Mixed definitions such as `ENV=1 gamescope`, dynamic environment values such as `ENV=$HOME`, and reserved or malformed syntax are rejected.

|Type|Example|Note|
|----|-------|----|
|Environment Variable|`ENV=value`|Detected from one static assignment; values are rendered as literal shell words.|
|Prefix Command|`gamemoderun gamescope`|Detected from a command word; raw argv are preserved and options sharing a command are merged.|
|Argument|`--flag` or `--key value`|Detected from a leading `-`; the flag and each raw argv word are stored explicitly.|

## Acknowledgments

- [decky-steamgriddb](https://github.com/SteamGridDB/decky-steamgriddb) - The most powerful decky plugin, start point of CheatDeck.
- [decky-autosuspend](https://github.com/jurassicplayer/decky-autosuspend) - Clean implementation and structure.
- [SDH-CssLoader](https://github.com/DeckThemes/SDH-CssLoader) - Beautiful UI and rich customization.

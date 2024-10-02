# CheatDeck
[![Nightly Action Status](https://img.shields.io/github/actions/workflow/status/SheffeyG/CheatDeck/dev-build.yml?label=nightly%20build)](https://nightly.link/SheffeyG/CheatDeck/workflows/dev-build/main/CheatDeck.zip)
![Release Store Downloads](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fplugins.deckbrew.xyz%2Fplugins%3Fquery%3DCheatDeck&query=%24%5B%3A1%5D.downloads&suffix=%20installs&label=decky%20store)
![Testing Store Downloads](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Ftesting.deckbrew.xyz%2Fplugins%3Fquery%3DCheatDeck&query=%24%5B%3A1%5D.downloads&suffix=%20installs&label=testing%20store)
[![License: GPL 3.0](https://img.shields.io/github/license/SheffeyG/CheatDeck)](./LICENSE)

CheatDeck is a [Decky Loader](https://github.com/SteamDeckHomebrew/decky-loader) plugin to make it more conveniently to use cheat or trainer and manage launch options on your Steam Deck.

## Nightly Release Download
You can download the latest nightly build of CheatDeck from the [following link](https://nightly.link/SheffeyG/CheatDeck/workflows/dev-build/main/CheatDeck.zip) and installing as ZIP in Decky Loader, or by directly installing from URL using `https://nightly.link/SheffeyG/CheatDeck/workflows/dev-build/main/CheatDeck.zip` in Decky Loader.

## Usage
1. Enable the developer mode at Steam system settings.
2. Download the cheat or trainer you need in your Steam Deck.
<details>
  <summary>3. Navigate to the game details menu, and find the `CheatDeck` item.</summary>

  ![menu](docs/menu.jpg)
</details>
<details>
  <summary>4. Enable the cheat setting and select the cheat EXE file you just downloaded, then save settings.</summary>

  ![settings](docs/settings.jpg)
</details>
<details>
  <summary>5. Launch the game, and the cheat windows should be shown, if not, press the `steam` key, you can switch the game and cheat windows.</summary>

  ![trainer](docs/trainer.jpg)
</details>


## Tips
- Please make sure the file or folder name does not contain slashes or quotes.
- If you are unable to click on the selected cheat, please switch to windowed mode in the game settings.
- If the program or trainer is not launching, it may be due to requiring [.NET Core](https://dotnet.microsoft.com/en-us/download/dotnet), [.NET Framework](https://dotnet.microsoft.com/en-us/download/dotnet-framework) or [Visual Studio Redistributable](https://learn.microsoft.com/en-us/cpp/windows/latest-supported-vc-redist) that is not available in your compatibility environment. Use `protontricks` to install the required dependency.

## Other Options
- `LANGUAGE`: Use the language code setting if your game or cheat language not correct (most on non-steam games).
- `DXVK_ASYNC`: Enable shaders pre-calculate for games use ProtonGE **below** version 7-45.
- `RADV_PERFTEST`: Enable shaders pre-calculate for games use ProtonGE **above** version 7-45.
- `STEAM_COMPAT_DATA_PATH`: Specify a folder as the shared prefix for the game, so you don't have to upgrade dependencies repeatedly. (May need to migrate game saves)

You can also custom and quick access some other launch options.

## Reference
- [decky-steamgriddb](https://github.com/SteamGridDB/decky-steamgriddb)
- [decky-autosuspend](https://github.com/jurassicplayer/decky-autosuspend)
- [SDH-CssLoader](https://github.com/DeckThemes/SDH-CssLoader)

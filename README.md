# CheatDeck
CheatDeck is a [Decky Loader](https://github.com/SteamDeckHomebrew/PluginLoader) plugin to make it more conveniently to use cheat or trainer and manage launch options on your steamdeck.

## Usage
1. Enable the developer mode at steam system settings.
2. Download the cheat or trainer you need in your steamdeck.
3. Navigate to the game details menu, and find the `CheatDeck` item.
![](doc/menu.jpg)
4. Enable the cheat setting and select the cheat exe file you just downloaded, then save settings.
![](doc/settings.jpg)
5. Launch the game, and the cheat windows should be shown, if not, press the `steam` key, you can switch the game and cheat windows.
![](doc/trainer.jpg)

## Tips
- Please make sure the file or folder name does not contain slashes or quotes.
- If you are unable to click on the selected cheat, please switch to windowed mode in the game settings.

## Other Options
- `LANGUAGE`: Use the language code setting if your game or cheat language not correct (most on non-steam games).
- `DXVK_ASYNC`: Enable shaders pre-calculate for games use ProtonGE *below* version 7-45.
- `RADV_PERFTEST`: Enable shaders pre-calculate for games use ProtonGE *above* version 7-45.
- `STEAM_COMPAT_DATA_PATH`: Specify a folder as the shared prefix for the game, so you don't have to upgrade dependencies repeatedly. (May need to migrate game saves)

You can also custom and quick access some other launch options.

## Reference
- [decky-steamgriddb](https://github.com/SteamGridDB/decky-steamgriddb)
- [decky-autosuspend](https://github.com/jurassicplayer/decky-autosuspend)
- [SDH-CssLoader](https://github.com/DeckThemes/SDH-CssLoader)

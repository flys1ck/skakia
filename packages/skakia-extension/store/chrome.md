# Chrome Web Store listing

Paste these into the [Developer Dashboard](https://chrome.google.com/webstore/devconsole) after uploading `.output/skakia-extension-<version>-chrome.zip`. The name, summary and icon come from the manifest.

## Store listing tab

**Description**

```
Skakia adds an "Analyze in Skakia" button to finished games on Lichess and Chess.com. One click opens the game in the Skakia desktop app, where you can review it with Stockfish.

The extension needs the Skakia app installed. Get it at https://skakia.com.

It collects no data and makes no network requests.
```

**Category:** Games

**Language:** English

**Screenshot:** `store/screenshot.png`, 1280×800, showing a finished game with the button.

## Privacy tab

**Single purpose**

```
Opens the finished Lichess or Chess.com game you are viewing in the Skakia desktop app.
```

**Host permission justification**

```
The content script runs on lichess.org and www.chess.com to detect a finished game page, read the game ID from the URL, and show a button that opens that game in the desktop app through a deep link.
```

**Remote code:** No, I am not using remote code.

**Data usage:** tick none of the data types, then tick the three certification boxes.

**Privacy policy URL:** leave empty; the extension handles no user data.

## Distribution tab

Free of charge, Public, all regions.

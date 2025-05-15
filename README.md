# Auto Capitalise File Names – Obsidian Plugin

Automatically capitalise your Obsidian file names to Sentence case or Title Case as you create or modify notes.

## Features

- **Automatic renaming:** Newly created and modified files are automatically renamed to your chosen capitalisation style.
- **Configurable capitalisation mode:** Choose between Sentence case (e.g., "My new note") or Title Case (e.g., "My New Note").
- **Delay for new files:** Set a delay (in milliseconds) before renaming new files, to allow for initial edits.
- **Live preview:** See a live example in the settings tab when you change your capitalisation mode.


## Usage

After installation, open the plugin settings to:
   - Select your preferred capitalisation mode (Sentence case or Title Case).
   - Set the delay for renaming new files.
   - Preview how file names will be transformed.


## Installation
**Automatic**
- You can install the plugin via the Community Plugins tab within Obsidian. Just search for "Calendar."

**Manually build**
- Clone this repo.
- Make sure your NodeJS is at least v16 (`node --version`).
- Run `npm install` to install dependencies.
- Use `npm run dev` for development (watches and rebuilds on file changes).
- Use `npm run build` for a production build.
- Copy over `main.js`, `styles.css`, `manifest.json` to your vault `VaultFolder/.obsidian/plugins/auto-capitalise-file-names/`.
- After building, reload Obsidian from the command palate to load the updated plugin.

## License
MIT

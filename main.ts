import {
	App,
	Plugin,
	PluginManifest,
	TAbstractFile,
	TFile,
	Notice,
	PluginSettingTab,
	Setting
} from 'obsidian';

interface AutoCapitaliseSettings {
	delayMs: number;
	capitalisationMode: 'sentence' | 'title';
}

const DEFAULT_SETTINGS: AutoCapitaliseSettings = {
	delayMs: 5000,
	capitalisationMode: 'sentence'
};

export default class AutoCapitaliseFileNamesPlugin extends Plugin {
	settings: AutoCapitaliseSettings;

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new AutoCapitaliseSettingTab(this.app, this));

		this.registerEvent(this.app.vault.on('modify', this.handleFileModify.bind(this)));
		this.registerEvent(this.app.vault.on('create', this.handleFileCreate.bind(this)));

		this.addCommand({
			id: 'capitalise-all-file-names-sentence',
			name: 'Capitalise all file names (Sentence case)',
			callback: async () => {
				await this.capitaliseAllFileNames('sentence');
				new Notice('All file names capitalised (Sentence case).');
			}
		});

		this.addCommand({
			id: 'capitalise-all-file-names-title',
			name: 'Capitalise all file names (Title Case)',
			callback: async () => {
				await this.capitaliseAllFileNames('title');
				new Notice('All file names capitalised (Title Case).');
			}
		});

		this.addCommand({
			id: 'capitalise-current-file-title',
			name: 'Capitalise current file name (Title Case)',
			checkCallback: (checking: boolean) => {
				const file = this.app.workspace.getActiveFile();
				if (file) {
					if (!checking) {
						this.capitaliseFile(file, 'title');
						new Notice('Current file name capitalised (Title Case).');
					}
					return true;
				}
				return false;
			}
		});
	}

	async handleFileModify(file: TAbstractFile) {
		if (!(file instanceof TFile)) return;
		await this.capitaliseFile(file, this.settings.capitalisationMode);
	}

	async handleFileCreate(file: TAbstractFile) {
		if (!(file instanceof TFile)) return;
		window.setTimeout(async () => {
			await this.capitaliseFile(file, this.settings.capitalisationMode);
		}, this.settings.delayMs);
	}

	async capitaliseAllFileNames(mode: 'title' | 'sentence') {
		const files = this.app.vault.getMarkdownFiles();
		for (const file of files) {
			await this.capitaliseFile(file, mode);
		}
	}

	async capitaliseFile(file: TFile, mode: 'title' | 'sentence') {
		const newName = mode === 'title'
			? toTitleCase(file.basename)
			: toSentenceCase(file.basename);
		const parentPath = file.parent ? file.parent.path : '';
		const newPath = parentPath ? parentPath + '/' + newName + '.' + file.extension : newName + '.' + file.extension;
		if (file.path !== newPath) {
			await this.app.fileManager.renameFile(file, newPath);
		}
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class AutoCapitaliseSettingTab extends PluginSettingTab {
	plugin: AutoCapitaliseFileNamesPlugin;

	constructor(app: App, plugin: AutoCapitaliseFileNamesPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();
		containerEl.createEl('p', { text: 'Auto Capitalise File Names Settings' });

		let previewEl: HTMLElement;

		const updatePreview = () => {
			const example = 'an example_file-name';
			const result = this.plugin.settings.capitalisationMode === 'title'
				? toTitleCase(example)
				: toSentenceCase(example);
			previewEl.setText(`Preview: "${example}" → "${result}"`);
		};

		new Setting(containerEl)
			.setName('Capitalisation mode')
			.setDesc('Choose between sentence case or title case for automatic renaming.')
			.addDropdown(drop => drop
				.addOption('sentence', 'Sentence case')
				.addOption('title', 'Title Case')
				.setValue(this.plugin.settings.capitalisationMode)
				.onChange(async (value) => {
					this.plugin.settings.capitalisationMode = value as 'sentence' | 'title';
					await this.plugin.saveSettings();
					updatePreview();
				}));

		// Add live preview
		previewEl = containerEl.createEl('p', { cls: 'setting-item-description' });
		updatePreview();

		new Setting(containerEl)
			.setName('Delay (ms) for new files')
			.setDesc('Wait time before renaming a newly created file.')
			.addText(text => text
				.setValue(this.plugin.settings.delayMs.toString())
				.onChange(async (value) => {
					const parsed = parseInt(value);
					if (!isNaN(parsed)) {
						this.plugin.settings.delayMs = parsed;
						await this.plugin.saveSettings();
					}
				}));


	}
}

function toTitleCase(input: string): string {
	if (typeof input !== 'string') {
		return String(input);
	}

	return input.replace(/([^\s-_]+)/g, (word) => {
		// Preserve existing acronyms: fully uppercased words longer than 1 character
		if (word === word.toUpperCase() && word.length > 1) {
			return word;
		}
		return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
	});
}

function toSentenceCase(input: string): string {
	if (typeof input !== 'string') {
		return String(input);
	}

	let isFirstWord = true;

	return input.replace(/([^\s-_]+)/g, (word) => {
		// Preserve acronyms: all uppercase and longer than one letter
		if (word === word.toUpperCase() && word.length > 1) {
			isFirstWord = false;
			return word;
		}

		const lower = word.toLowerCase();

		if (isFirstWord) {
			isFirstWord = false;
			return lower.charAt(0).toUpperCase() + lower.slice(1);
		}

		return lower;
	});
}

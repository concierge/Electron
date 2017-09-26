const path = require('path');
const url = require('url');
const promisify = require('util').promisify;
const EventEmitter = require('events');

class ElectronService extends EventEmitter {
	constructor () {
		super();
		this._electron = require('electron');
		this._app = this._electron.app;
		this._BrowserWindow = this._electron.BrowserWindow;
		this._windows = [];
	}

	async load (platform) {
		if (typeof(this._electron) === 'string') {
			throw new Error('This module can only be loaded by Electron');
		}
		if (!this._app.isReady()) {
			await promisify(c => this._app.once('ready', c));
		}
		this._app.once('before-quit', e => {
			e.preventDefault();
			this.emit('before-quit', e);
		});
	}

	async unload (platform) {
		for (let window of this._windows) {
			window.destroy();
		}
	}

	createWindow (config, initialPath) {
		if (!config) {
			config = {};
		}
		if (!config.width) {
			config.width = 800;
		}
		if (!config.height) {
			config.height = 600;
		}
		if (!initialPath) {
			initialPath = path.join(__dirname, 'index.html');
		}
		const window = new this._BrowserWindow(config);
		window.loadURL(url.format({
			pathname: initialPath,
			protocol: 'file:',
			slashes: true
		}));
		this._windows.push(window);
		window.once('closed', () => {
			this._windows.splice(this._windows.indexOf(window), 1);
			return false;
		});
		this.emit('create-window', window);
		return window;
	}

	getApp () {
		return this._app;
	}

	getElectron () {
		return this._electron;
	}
}

module.exports = new ElectronService();

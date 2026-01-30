const { app, BrowserWindow, ipcMain } = require('electron/main')
const { EventsBatcher } = require('node-events-batcher')
const path = require('node:path')
const fs = require('node:fs')

var windows = [];

const defaultState = {
	x: 250,
	y: 250,
	width: 800,
	height: 600,
}

const persistedWindowsPath = path.join(app.getPath('temp'), 'node-events-batcher-example', 'windows.json')

function closeHandler(ev) {
	ev.preventDefault()
	batcher.add(this.id)
}

function forceClose(win) {
	win.removeListener('close', closeHandler)
	win.close()
}

function storeState() {
	const state = []

	for (const window of windows) {
		const bounds = window.getBounds()

		state.push({
			x: bounds.x,
			y: bounds.y,
			width: bounds.width,
			height: bounds.height,
		})
	}

	const dir = path.dirname(persistedWindowsPath)

	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, {recursive: true})
	}

	fs.writeFileSync(persistedWindowsPath, JSON.stringify(state))
}

function restoreState() {
	if (!fs.existsSync(persistedWindowsPath)) {
		return false
	}

	const persistedWindowsState = JSON.parse(fs.readFileSync(persistedWindowsPath, {encoding:'utf-8'}))

	for (const windowState of persistedWindowsState) {
		createWindow(windowState)
	}

	return true
}

function cb(acc) {
	if (acc.length === windows.length) {
		console.log('All windows closed')

		// save before closing
		storeState()

		windows.forEach(w => {
			forceClose(w)
		})

		windows = [];
		app.quit()
	} else {
		console.log(`${acc.length} windows closed`)
		
		acc.forEach(id => {
			const idx = windows.findIndex(w => w.id === id)

			if (idx !== -1) {
				forceClose(windows[idx])
			}
		})

		for (const id of acc) {
			windows.splice(windows.findIndex(w => w.id === id), 1)
		}

		// save after closing
		storeState()
	}
}

const batcher = new EventsBatcher(cb, null, {
	accumulatorType: 'array',
	timeoutMs: 500,
	debounceMs: 50,
})

function closeAllWindows() {
	windows.forEach(window => {
		window.close()
	});
}

function createWindow(state = defaultState) {
	console.log('Create window')

	const winRef = new BrowserWindow({
		x: state.x,
		y: state.y,
		width: state.width,
		height: state.height,
		webPreferences:{
			preload: path.join(__dirname, './preload.js')
		}
	})

	winRef.on('close', closeHandler)

	winRef.loadFile('index.html')

	windows.push(winRef)
}

app.whenReady().then(() => {
	ipcMain.addListener('create-window', _ => {
		createWindow()
		storeState()
	})
	ipcMain.addListener('close-all-windows', _ => closeAllWindows())

	if (!restoreState()) {
		createWindow(defaultState)
	}
})

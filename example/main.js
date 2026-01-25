const { app, BrowserWindow, ipcMain } = require('electron/main')
const { EventsBatcher } = require('node-events-batcher')
const path = require('node:path')

var windows = [];

function closeHandler(ev) {
	ev.preventDefault()
	batcher.add(this.id)
}

function forceClose(win) {
	win.removeListener('close', closeHandler)
	win.close()
}

function cb(acc) {
	if (acc.length === windows.length) {
		console.log('All windows closed')

		windows.forEach(w => {
			// save before closing
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
	}
}

const batcher = new EventsBatcher(cb, null, {
	accumulatorType: 'array',
	timeoutMs: 500,
	shiftMs: 50,
})

function closeAllWindows() {
	windows.forEach(window => {
		window.close()
	});
}

function createWindow() {
	console.log('Create window')

	winRef = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences:{
			preload: path.join(__dirname, './preload.js')
		}
	})

	winRef.on('close', closeHandler)

	winRef.loadFile('index.html')

	windows.push(winRef)
}

app.whenReady().then(() => {
	ipcMain.addListener('create-window', _ => createWindow())
	ipcMain.addListener('close-all-windows', _ => closeAllWindows())

	createWindow()
})

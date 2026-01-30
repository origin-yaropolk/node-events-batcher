const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld(
	'electron',
	{
		createWindow: () => ipcRenderer.send('create-window'),
		closeAllWindows: () => ipcRenderer.send('close-all-windows'),
	}
)

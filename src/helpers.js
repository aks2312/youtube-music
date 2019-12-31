const { app, dialog, Tray, Menu, nativeImage } = require("electron");
const { is } = require("electron-util");
const isOnline = require("is-online");
const pWaitFor = require("p-wait-for");
const config = require("./config");

let tray = null;
let contextMenu = null;
exports.createTray = win => {
	if (tray) {
		return;
	}
	const onClick = () => {
		if (win.isVisible()) {
			win.hide();
		} else {
			win.show();
		}
	};
	contextMenu = Menu.buildFromTemplate([
		{
			label: "Toggle",
			visible: !is.macos,
			click: onClick
		},
		{
			label: "Quit",
			click: app.exit
		}
	]);
	tray = new Tray(config.get("icons.default"));
	tray.setContextMenu(contextMenu);
	tray.on("click", onClick);
	tray.setToolTip("Youtube Music");
};

exports.updateMediaControls = (mainWindow, status) => {
	return mainWindow.setThumbarButtons([
		{
			tooltip: "Shuffle",
			icon: nativeImage.createFromDataURL(config.get("icons.media.shuffle")),
			flags: status.visible ? [] : ["noninteractive"],
			click() {
				mainWindow.webContents.send("shuffle");
			}
		},
		{
			tooltip: "Previous",
			icon: nativeImage.createFromDataURL(config.get("icons.media.previous")),
			flags: status.visible ? [] : ["noninteractive"],
			click() {
				mainWindow.webContents.send("previous");
			}
		},
		{
			tooltip: status.playing ? "Pause" : "Play",
			icon: nativeImage.createFromDataURL(
				config.get(status.playing ? "icons.media.pause" : "icons.media.play")
			),
			flags: status.visible ? [] : ["noninteractive"],
			click() {
				mainWindow.webContents.send("toggle-play-pause");
			}
		},
		{
			tooltip: "Next",
			icon: nativeImage.createFromDataURL(config.get("icons.media.next")),
			flags: status.visible ? [] : ["noninteractive"],
			click() {
				mainWindow.webContents.send("next");
			}
		},
		{
			tooltip:
				status.repeat === "NONE"
					? "Repeat Off"
					: status.repeat === "ALL"
					? "Repeat All"
					: "Repeat Once",
			icon: nativeImage.createFromDataURL(
				config.get(
					status.repeat === "NONE"
						? "icons.media.repeatNone"
						: status.repeat === "ALL"
						? "icons.media.repeatAll"
						: "icons.media.repeatOnce"
				)
			),
			flags: status.visible ? [] : ["noninteractive"],
			click() {
				mainWindow.webContents.send("repeat");
			}
		}
	]);
};

exports.ensureOnline = async () => {
	function showWaitDialog() {
		const buttonIndex = dialog.showMessageBoxSync({
			message:
				"You appear to be offline. YouTube Music requires a working internet connection.",
			detail: "Do you want to wait?",
			buttons: ["Wait", "Quit"],
			defaultId: 0,
			cancelId: 1
		});

		if (buttonIndex === 1) {
			app.quit();
		}
	}
	if (!(await isOnline())) {
		const connectivityTimeout = setTimeout(showWaitDialog, 15000);

		await pWaitFor(isOnline, { interval: 1000 });
		clearTimeout(connectivityTimeout);
	}
};

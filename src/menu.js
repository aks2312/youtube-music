"use strict";
const { app, Menu, shell, BrowserWindow } = require("electron");
const {
	is,
	appMenu,
	aboutMenuItem,
	openUrlMenuItem,
	openNewGitHubIssue,
	debugInfo
} = require("electron-util");
const config = require("./config");

const helpSubmenu = [
	openUrlMenuItem({
		label: "Source Code",
		url: "https://github.com/iMro0t/youtube-music"
	}),
	{
		label: "Report an Issue…",
		click() {
			const body = `
<!-- Please succinctly describe your issue and steps to reproduce it. -->


---

${debugInfo()}`;

			openNewGitHubIssue({
				user: "iMro0t",
				repo: "youtube-music",
				body
			});
		}
	}
];

if (!is.macos) {
	helpSubmenu.push(
		{
			type: "separator"
		},
		openUrlMenuItem({
			label: "About Author",
			url: "https://twitter.com/0xskull"
		}),
		aboutMenuItem({
			icon: config.get("icons.default"),
			text: "Created by Abhi Bhalgami"
		})
	);
}

const debugSubmenu = [
	{
		label: "Show Settings",
		click() {
			config.openInEditor();
		}
	},
	{
		label: "Show App Data",
		click() {
			shell.openItem(app.getPath("userData"));
		}
	},
	{
		type: "separator"
	},
	{
		label: "Delete App Data",
		click() {
			shell.moveItemToTrash(app.getPath("userData"));
			app.relaunch();
			app.quit();
		}
	}
];

const macosTemplate = [
	appMenu([
		{
			label: "Preferences…",
			accelerator: "Command+,",
			click() {
				showPreferences();
			}
		}
	]),
	{
		role: "fileMenu",
		submenu: [
			{
				label: "Custom"
			},
			{
				type: "separator"
			},
			{
				role: "close"
			}
		]
	},
	{
		role: "editMenu"
	},
	{
		role: "viewMenu"
	},
	{
		role: "windowMenu"
	},
	{
		role: "help",
		submenu: helpSubmenu
	}
];

// Linux and Windows
const otherTemplate = [
	{
		role: "fileMenu",
		submenu: [
			// {
			// 	label: "Toggle Picture In Picture Mode",
			// 	accelerator: "Control+P",
			// 	click() {
			// 		BrowserWindow.getFocusedWindow().webContents.send("toggle-pip");
			// 	}
			// },
			// {
			// 	type: "separator"
			// },
			{
				role: "quit"
			}
		]
	},
	{
		role: "viewMenu",
		submenu: [
			{
				role: "reload"
			},
			{
				role: "forceReload"
			},
			{
				type: "separator"
			},
			{
				role: "resetZoom"
			},
			{
				role: "zoomIn"
			},
			{
				role: "zoomOut"
			},
			{
				type: "separator"
			},
			{
				role: "togglefullscreen"
			}
		]
	},
	{
		role: "help",
		submenu: helpSubmenu
	}
];

// const template = process.platform === "darwin" ? macosTemplate : otherTemplate;
const template = otherTemplate;
if (is.development) {
	template.push({
		label: "Debug",
		submenu: debugSubmenu
	});
}

module.exports = Menu.buildFromTemplate(template);

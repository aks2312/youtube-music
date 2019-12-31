const { ipcRenderer } = require("electron");

ipcRenderer.on("toggle-play-pause", () => {
  document.querySelector("#play-pause-button").click();
});

ipcRenderer.on("next", () => {
  document.querySelector(".next-button").click();
});

ipcRenderer.on("previous", () => {
  document.querySelector(".previous-button").click();
});

ipcRenderer.on("repeat", () => {
  document.querySelector(".repeat").click();
});

ipcRenderer.on("shuffle", () => {
  document.querySelector(".shuffle").click();
});

ipcRenderer.on("toggle-pip", () => {
  if (!document.pictureInPictureElement) {
    document.querySelector("video").requestPictureInPicture();
  } else {
    document.exitPictureInPicture();
  }
});

setInterval(() => {
  ipcRenderer.send("player-bar-status", {
    visible: document.querySelector("ytmusic-player-bar").playerPageOpen_,
    playing: document.querySelector("ytmusic-player-bar").playing_,
    repeat: document.querySelector("ytmusic-player-bar").repeatMode_
  });
}, 100);

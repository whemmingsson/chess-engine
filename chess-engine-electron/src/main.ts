import { app, BrowserWindow } from "electron";
import path from "node:path";
import { RunnerGameService } from "chess-engine/runtime";
import { registerGameHandlers } from "./ipc/registerGameHandlers";

const game = new RunnerGameService();

const createWindow = async () => {
  const window = new BrowserWindow({
    width: 1280,
    height: 900,
    minWidth: 960,
    minHeight: 720,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  const rendererUrl =
    process.env.ELECTRON_RENDERER_URL ?? "http://127.0.0.1:4173";

  if (!app.isPackaged) {
    await window.loadURL(rendererUrl);
    window.webContents.openDevTools({ mode: "detach" });
    return;
  }

  await window.loadFile(
    path.resolve(
      __dirname,
      "../../../../chess-engine-frontend/dist/index.html",
    ),
  );
};

app.whenReady().then(async () => {
  registerGameHandlers(game);
  await createWindow();

  app.on("activate", async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const screenshot = require('screenshot-desktop');
const ffmpeg = require('fluent-ffmpeg');

let mainWindow;
let videoStream;
const outputDir = path.join(__dirname, 'output');

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            enableRemoteModule: false,
            nodeIntegration: true
        }
    });

    mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
    createWindow();

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }

    startRecording();
    startScreenshot();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});

function startRecording() {
    // Setup FFmpeg to start recording the screen
    const videoFile = path.join(outputDir, 'recording.mp4');
    videoStream = ffmpeg()
        .input('desktop')
        .inputFormat('x11grab') // Use 'gdigrab' for Windows
        .videoCodec('libx264')
        .audioCodec('aac')
        .output(videoFile)
        .on('end', () => {
            console.log('Screen recording finished.');
        })
        .run();
}

function startScreenshot() {
    setInterval(async () => {
        try {
            const screenshotFile = path.join(outputDir, `screenshot_${Date.now()}.png`);
            const img = await screenshot({ format: 'png' });
            fs.writeFileSync(screenshotFile, img);
            console.log(`Screenshot saved to ${screenshotFile}`);
        } catch (error) {
            console.error('Error taking screenshot:', error);
        }
    }, 2000); // Take a screenshot every 2 seconds
}

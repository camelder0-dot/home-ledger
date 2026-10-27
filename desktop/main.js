// Home Ledger desktop app: shows app/index.html in its own window and keeps the ledger
// in a plain JSON file on this computer. All network access is blocked.
const { app, BrowserWindow, Menu, dialog, ipcMain, session, shell } = require('electron');
const fs = require('node:fs');
const path = require('node:path');

const KEEP_BACKUPS = 30;
let win = null;

if (!app.requestSingleInstanceLock()) app.quit();
app.on('second-instance', () => { if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });

// ---------- Where the ledger lives ----------
const configPath = () => path.join(app.getPath('userData'), 'config.json');
const defaultDataPath = () => path.join(app.getPath('documents'), 'Home Ledger', 'My Finances.json');
function readConfig() {
  try { return JSON.parse(fs.readFileSync(configPath(), 'utf8')); } catch { return {}; }
}
function writeConfig(cfg) {
  fs.mkdirSync(path.dirname(configPath()), { recursive: true });
  fs.writeFileSync(configPath(), JSON.stringify(cfg, null, 1));
}
let dataPath = null;
function setDataPath(p) { dataPath = p; writeConfig({ ...readConfig(), dataPath: p }); }

function writeAtomic(file, text) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = file + '.saving';
  fs.writeFileSync(tmp, text);
  fs.renameSync(tmp, file);
}

// One automatic copy per day in a Backups folder beside the ledger, newest 30 kept.
function dailyBackup() {
  if (!fs.existsSync(dataPath)) return;
  const dir = path.join(path.dirname(dataPath), 'Backups');
  const base = path.basename(dataPath, '.json');
  const d = new Date();
  const stamp = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const target = path.join(dir, `${base} ${stamp}.json`);
  if (fs.existsSync(target)) return;
  fs.mkdirSync(dir, { recursive: true });
  fs.copyFileSync(dataPath, target);
  const old = fs.readdirSync(dir).filter((f) => f.startsWith(base + ' ') && f.endsWith('.json')).sort().reverse();
  for (const f of old.slice(KEEP_BACKUPS)) fs.unlinkSync(path.join(dir, f));
}

function readLedger(file) {
  const text = fs.readFileSync(file, 'utf8');
  const data = JSON.parse(text);
  if (!data || !Array.isArray(data.accounts) || !Array.isArray(data.txns)) throw new Error('That file is not a Home Ledger file.');
  return data;
}

// ---------- Calls from the page ----------
ipcMain.handle('ledger:load', () => {
  if (!fs.existsSync(dataPath)) return { path: dataPath, data: null };
  try {
    return { path: dataPath, data: readLedger(dataPath) };
  } catch (e) {
    // Keep the unreadable file aside rather than saving over it.
    const aside = dataPath.replace(/\.json$/i, '') + ` (unreadable ${Date.now()}).json`;
    fs.renameSync(dataPath, aside);
    return { path: dataPath, data: null, warning: `Your ledger file couldn't be read, so it was set aside as:\n${aside}\n\nYou can restore a copy from the Backups folder with File > Open.` };
  }
});

ipcMain.handle('ledger:save', (_e, text) => {
  dailyBackup();
  writeAtomic(dataPath, text);
  return { path: dataPath, time: Date.now() };
});

ipcMain.handle('ledger:open', async () => {
  const r = await dialog.showOpenDialog(win, {
    title: 'Open a Home Ledger file', defaultPath: path.dirname(dataPath),
    filters: [{ name: 'Home Ledger file', extensions: ['json'] }], properties: ['openFile'],
  });
  if (r.canceled || !r.filePaths[0]) return null;
  const data = readLedger(r.filePaths[0]); // throws to the page if it isn't a ledger
  return { path: r.filePaths[0], data };
});

ipcMain.handle('ledger:use', (_e, p) => { setDataPath(p); return dataPath; });

ipcMain.handle('ledger:saveAs', async (_e, { text, name, kind }) => {
  const csv = kind === 'csv';
  const r = await dialog.showSaveDialog(win, {
    defaultPath: path.join(app.getPath('documents'), name),
    filters: [csv ? { name: 'Spreadsheet (CSV)', extensions: ['csv'] } : { name: 'Home Ledger file', extensions: ['json'] }],
  });
  if (r.canceled || !r.filePath) return null;
  writeAtomic(r.filePath, text);
  return r.filePath;
});

ipcMain.handle('ledger:showFolder', () => shell.showItemInFolder(dataPath));

// ---------- Window ----------
function send(action) { if (win) win.webContents.send('menu', action); }

function buildMenu() {
  const mac = process.platform === 'darwin';
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    ...(mac ? [{ role: 'appMenu' }] : []),
    {
      label: 'File', submenu: [
        { label: 'Open a Ledger File…', accelerator: 'CmdOrCtrl+O', click: () => send('open') },
        { label: 'Save a Backup Copy…', accelerator: 'CmdOrCtrl+Shift+S', click: () => send('backup') },
        { label: 'Export Everything to Excel (CSV)…', click: () => send('csv') },
        { label: 'Show My Data Folder', click: () => shell.showItemInFolder(dataPath) },
        { type: 'separator' },
        { label: 'Print…', accelerator: 'CmdOrCtrl+P', click: () => send('print') },
        { type: 'separator' },
        { label: 'Start a New Empty Ledger…', click: () => send('new') },
        { type: 'separator' },
        mac ? { role: 'close' } : { role: 'quit', label: 'Exit' },
      ],
    },
    { role: 'editMenu' },
    {
      label: 'View', submenu: [
        { role: 'zoomIn', label: 'Bigger Text', accelerator: 'CmdOrCtrl+=' },
        { role: 'zoomOut', label: 'Smaller Text' },
        { role: 'resetZoom', label: 'Normal Text Size' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    { role: 'windowMenu' },
  ]));
}

function createWindow() {
  win = new BrowserWindow({
    width: 1280, height: 860, minWidth: 420, minHeight: 500, title: 'Home Ledger', backgroundColor: '#f4f5f7',
    icon: path.join(__dirname, '..', 'build', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true, sandbox: true, nodeIntegration: false, spellcheck: false,
    },
  });
  win.loadFile(path.join(__dirname, '..', 'app', 'index.html'));
  // The page never navigates anywhere or opens new windows.
  win.webContents.on('will-navigate', (e) => e.preventDefault());
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  win.on('closed', () => { win = null; });
}

if (process.env.HOME_LEDGER_SMOKE) {
  const tmp = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'home-ledger-smoke-'));
  app.setPath('userData', path.join(tmp, 'user'));
  app.setPath('documents', path.join(tmp, 'docs'));
}

app.whenReady().then(() => {
  // Nothing in this app talks to the internet: refuse every web request outright.
  session.defaultSession.webRequest.onBeforeRequest({ urls: ['http://*/*', 'https://*/*', 'ws://*/*', 'wss://*/*'] }, (_d, cb) => cb({ cancel: true }));
  session.defaultSession.setPermissionRequestHandler((_wc, _perm, cb) => cb(false));

  const saved = readConfig().dataPath;
  dataPath = saved && fs.existsSync(path.dirname(saved)) ? saved : defaultDataPath();
  buildMenu();
  createWindow();
  if (process.env.HOME_LEDGER_SMOKE) smokeTest();
});
app.on('window-all-closed', () => app.quit());

// `HOME_LEDGER_SMOKE=1 npx electron .`: in a throwaway folder, load sample data, check it saved,
// reload the window and check it came back, check the web is blocked, then quit.
async function smokeTest() {
  const loaded = () => new Promise((r) => win.webContents.once('did-finish-load', r));
  await loaded();
  const first = await win.webContents.executeJavaScript(`(async () => {
    await new Promise(r => setTimeout(r, 300));
    let web = 'reachable';
    try { await fetch('https://example.com', { mode: 'no-cors' }); } catch { web = 'blocked'; }
    loadSample();
    await new Promise(r => setTimeout(r, 500));
    return { web, accounts: data.accounts.length, txns: data.txns.length };
  })()`);
  const onDisk = JSON.parse(fs.readFileSync(dataPath, 'utf8')).txns.length;
  win.reload();
  await loaded();
  const after = await win.webContents.executeJavaScript(`new Promise(r => setTimeout(() => r({ accounts: data.accounts.length, txns: data.txns.length }), 300))`);
  console.log('SMOKE', JSON.stringify({ first, onDisk, afterReload: after, dataPath }));
  app.quit();
}

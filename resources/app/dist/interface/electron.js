const path=require("path"),electron=require("electron");class ElectronWindow{constructor(e){this.app=electron.app;const t=process.versions;logger.info(`Running Electron application with version ${t.electron} using Chromium ${t.chrome}`),"win32"===process.platform&&this._defineUserTasks(this.app),"darwin"===process.platform&&(this._defineDockMenu(this.app),this.#e()),this.window=this.create(e),this.app.on("window-all-closed",(()=>{"darwin"===process.platform?this._docked=!0:this.app.quit()})),this.app.on("activate",(()=>{this.window||(this.window=this.create(e)),this._docked&&global.express&&this.initialize(global.express.address),this._docked=!1})),this.app.commandLine.appendSwitch("ignore-certificate-errors"),this.app.on("certificate-error",((e,t,o,r,s,l)=>{/localhost/.test(o)?(e.preventDefault(),l(!0)):l(!1)})),this.window.webContents.setWindowOpenHandler(this._onOpenWindow.bind(this))}initialize(e){if(config.options.proxySSL&&!config.options.isSSL){const e="You cannot use proxySSL mode with the Electron application, SSL certificates must be provided directly.";logger.error(e),global.startupMessages.push({level:"error",message:e})}const t=()=>this.load(e);this.app.isReady()?t():this.app.on("ready",t)}static get defaultOptions(){const e="win32"===process.platform?"fvtt.ico":"vtt-512.png";return{width:1600,height:900,icon:path.join(global.paths.public,"icons",e),backgroundColor:"#2e2c29",minWidth:720,minHeight:460,fullscreen:!0,resizable:!0,show:!0,webPreferences:{autoplayPolicy:"no-user-gesture-required",contextIsolation:!0,nodeIntegration:!1,sandbox:!0}}}create(e){const t=this.constructor.defaultOptions,o=new electron.BrowserWindow(t);return this._createMenu(o),!1===e.fullscreen&&(o.setFullScreen(!1),o.maximize()),o.on("closed",(()=>this.window=null)),o}_createMenu(e){const t={label:"Application",submenu:[{label:"Reload",accelerator:"darwin"===process.platform?"Cmd+R":"F5",role:"reload"},{label:"Force Reload",accelerator:"darwin"===process.platform?"Ctrl+Cmd+R":"Ctrl+F5",role:"forceReload"},{label:"Toggle Fullscreen",accelerator:"darwin"===process.platform?"Ctrl+Cmd+F":"F11",role:"togglefullscreen"},{label:"Toggle Developer Tools",accelerator:"darwin"===process.platform?"Alt+Cmd+I":"F12",role:"toggleDevTools"},{label:"Quit",accelerator:"Command+Q",click:()=>this.app.quit()}]};"darwin"===process.platform&&t.submenu.splice(2,0,{label:"Hide",accelerator:"Cmd+H",role:"hide"});const o=electron.Menu.buildFromTemplate([t,{label:"Edit",submenu:[{label:"Undo",accelerator:"CmdOrCtrl+Z",role:"undo"},{label:"Redo",accelerator:"Shift+CmdOrCtrl+Z",role:"redo"},{label:"Cut",accelerator:"CmdOrCtrl+X",role:"cut"},{label:"Copy",accelerator:"CmdOrCtrl+C",role:"copy"},{label:"Paste",accelerator:"CmdOrCtrl+V",role:"paste"},{label:"Select All",accelerator:"CmdOrCtrl+A",role:"selectAll"}]}]);electron.Menu.setApplicationMenu(o),e.setMenuBarVisibility(!1)}_defineDockMenu(e){const{paths:t}=global,{shell:o,Menu:r}=electron;e.dock.setMenu(r.buildFromTemplate([{label:"Browse User Data",click:()=>o.showItemInFolder(path.join(t.user,"Data"))},{label:"Browse Application Data",click:()=>o.showItemInFolder(path.join(t.root,"public"))}]))}#e(){electron.systemPreferences.askForMediaAccess("microphone"),electron.systemPreferences.askForMediaAccess("camera")}_defineUserTasks(e){const t=global.paths;e.setUserTasks([{program:"explorer.exe",arguments:t.user.replace(new RegExp(path.posix.sep,"g"),path.sep),iconPath:process.execPath,iconIndex:0,title:"Browse User Data",description:"Open User Data Directory"},{program:"explorer.exe",arguments:t.root.replace(new RegExp(path.posix.sep,"g"),path.sep),iconPath:process.execPath,iconIndex:0,title:"Browse Application Data",description:"Open Application Installation Directory"}])}load(e){this.window.loadURL(e).then((()=>this.window.focus()))}quit(){this.app.exit(0)}_onOpenWindow({url:e}={}){return/https?:\/\//.test(e)&&setImmediate((()=>electron.shell.openExternal(e))),{action:"deny"}}}module.exports=ElectronWindow;
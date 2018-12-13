(function(scope) {

    "use strict";


    const app = require('electron').app;
    const BrowserWindow = require('electron').BrowserWindow;
    const Tray = require('electron').Tray;
    const AppMenu = require('electron').AppMenu;
    const Menu = require('electron').Menu;
    const globalShortcut = require('electron').globalShortcut;
    const dialog = require('electron').dialog;
    const clipboard = require('electron').clipboard;
    const shell = require('electron').shell;
    const path = require('path');
    const url = require('url');
    const AutoLaunch = require("auto-launch");
    const fileSystem = require('fs');
    const mainUrl = 'https://web.vma.vzw.com/vma/webs2/Message.do';

    let currentWindowState = 'shown';


    var shouldQuit = app.makeSingleInstance(function(commandLine, workingDirectory) {
        // Someone tried to run a second instance, we should focus our window.
        if (verizonMessages.window) {
            verizonMessages.window.show();
            verizonMessages.window.focus();
        }
    });

    if (shouldQuit) {
        app.quit();
    }

    var startupScript = new AutoLaunch({
        name: app.getName(),
    });


    global.config = {
        defaultSettings: {
            width: 752,
            height: 622,
            disablegpu: false,
            autoHideMenuBar: true,
            globalshortcut: true,
            autostart: false,
            startminimized: false,
            trayicon: true,
            maximized: false
        },

        currentSettings: {},

        init() {
            config.loadConfiguration();
            config.saveTimeout = null;
        },

        loadConfiguration() {

            var settingsFile = app.getPath('userData') + "/settings.json";
            try {
                var data = fileSystem.readFileSync(settingsFile);
                if (data != "" && data != "{}" && data != "[]") {
                    config.currentSettings = JSON.parse(data);

                } else {
                    config.currentSettings = config.defaultSettings;

                }
            } catch (e) {
                config.currentSettings = config.defaultSettings;

            }
            // First time configuration - eg. before app init
            if (config.get("disablegpu") == true) {

                app.disableHardwareAcceleration();
            }
        },

        applyConfiguration() {

            if (config.get("maximized") && config.get("startminimized") != true) {
                verizonMessages.window.maximize();
            }

            if (config.get("trayicon") != false && verizonMessages.tray == undefined) {
                verizonMessages.createTray();
            } else if (config.get("trayicon") == false && verizonMessages.tray != undefined) {

                verizonMessages.tray.destroy();
                verizonMessages.tray = undefined;
            }

            if (config.get("autostart") == true) {
                startupScript.isEnabled().then(function(enabled) {
                    if (!enabled) {
                        startupScript.enable();

                    }
                });
            } else {
                startupScript.isEnabled().then(function(enabled) {
                    if (enabled) {
                        startupScript.disable();

                    }
                });
            }
            verizonMessages.window.setMenuBarVisibility(config.get("autoHideMenuBar") != true);
            verizonMessages.window.setAutoHideMenuBar(config.get("autoHideMenuBar") == true);
        },

        resetDefaultSettings() {

            settings.window.close();
            settings.init();

        },

        saveConfiguration() {

            fileSystem.writeFileSync(app.getPath('userData') + "/settings.json", JSON.stringify(config.currentSettings), 'utf-8');
            /*
        if (config.saveTimeout != null) {
            clearTimeout(config.saveTimeout);
            config.saveTimeout = null;
        }
        config.saveTimeout = setTimeout(function() {

            config.set("maximized", verizonMessages.window.isMaximized());
            if (config.currentSettings == undefined || JSON.stringify(config.currentSettings) == "") {
                // TODO: if we land here, we need to figure why and how. And fix that

                return;
            }
            fileSystem.writeFileSync(app.getPath('userData') + "/settings.json", JSON.stringify(config.currentSettings), 'utf-8');
            config.saveTimeout = null;
        }, 2000);*/
        },

        get(key) {
            return config.currentSettings[key];
        },

        set(key, value) {
            config.currentSettings[key] = value;
        },

        unSet(key) {
            if (config.currentSettings.hasOwnProperty(key)) {
                delete config.currentSettings[key];
            }
        }
    };

    global.config.init();

    global.verizonMessages = {

        init() {
            verizonMessages.tray = undefined;
            verizonMessages.createMenu();
            verizonMessages.clearCache();
            verizonMessages.openWindow();
            config.applyConfiguration();

        },

        createMenu() {

            var template = [{

                    label: 'File',
                    submenu: [{
                            label: 'Options',
                            accelerator: 'CmdOrCtrl+S',
                            click: function() {
                                settings.init();
                            }

                        },
                        {
                            label: 'Clear App Data',
                            click: function click() {
                                verizonMessages.clearAppData();
                            }
                        },
                        {
                            type: 'separator'
                        },

                        {
                            label: 'Quit',
                            accelerator: 'CmdOrCtrl+Q',
                            click: function() {
                                app.isQuiting = true;
                                app.quit();
                            }
                        }
                    ]
                },


                {
                    label: 'Edit',
                    submenu: [{
                        label: 'Undo',
                        accelerator: 'CmdOrCtrl+Z',
                        role: 'undo'
                    }, {
                        label: 'Redo',
                        accelerator: 'Shift+CmdOrCtrl+Z',
                        role: 'redo'
                    }, {
                        type: 'separator'
                    }, {
                        label: 'Cut',
                        accelerator: 'CmdOrCtrl+X',
                        role: 'cut'
                    }, {
                        label: 'Copy',
                        accelerator: 'CmdOrCtrl+C',
                        role: 'copy'
                    }, {
                        label: 'Copy Current URL',
                        accelerator: 'CmdOrCtrl+L',
                        click: function click() {
                            clipboard.writeText(verizonMessages.window.webContents.getURL());
                        }
                    }, {
                        label: 'Paste',
                        accelerator: 'CmdOrCtrl+V',
                        role: 'paste'
                    }, {
                        label: 'Paste and Match Style',
                        accelerator: 'CmdOrCtrl+Shift+V',
                        role: 'pasteandmatchstyle'
                    }, {
                        label: 'Select All',
                        accelerator: 'CmdOrCtrl+A',
                        role: 'selectall'
                    }, {
                        type: 'separator'
                    }]
                }, {
                    label: 'View',
                    submenu: [{
                        label: 'Back',
                        accelerator: 'CmdOrCtrl+[',
                        click: function click() {
                            verizonMessages.window.webContents.goBack();
                        }
                    }, {
                        label: 'Forward',
                        accelerator: 'CmdOrCtrl+]',
                        click: function click() {
                            verizonMessages.window.webContents.goForward();
                        }
                    }, {
                        label: 'Reload',
                        accelerator: 'CmdOrCtrl+R',
                        click: function click(item) {
                            verizonMessages.window.reload();
                        }
                    }, {
                        type: 'separator'
                    }, {
                        label: 'Toggle Full Screen',
                        accelerator: 'F11',
                        click: function click(item, focusedWindow) {
                            verizonMessages.window.setFullScreen(!verizonMessages.window.isFullScreen());
                        }
                    }]
                }, {
                    label: 'Window',
                    role: 'window',
                    submenu: [{
                        label: 'Minimize',
                        accelerator: 'CmdOrCtrl+M',
                        role: 'minimize'
                    }, {
                        label: 'Close',
                        accelerator: "esc",
                        role: 'close'
                    }]
                },
                {
                    label: 'Help',
                    submenu: [{
                        label: `About`,
                        click: function click() {
                            about.init();
                        }

                    }]

                }




            ];
            verizonMessages.menu = Menu.buildFromTemplate(template);
            Menu.setApplicationMenu(verizonMessages.menu);
        },


        clearCache() {
            try {
                fileSystem.unlinkSync(app.getPath('userData') + '/Application Cache/Index');
            } catch (e) {}
        },

        createTray() {
            verizonMessages.tray = new Tray(path.join(__dirname, '/assets/icons/icon_tray.png'));
            verizonMessages.trayContextMenu = Menu.buildFromTemplate([{
                    label: 'Show',
                    click: function() {
                        verizonMessages.window.show();
                        verizonMessages.window.focus();
                    }
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Reset app',
                    click: function() {
                        verizonMessages.clearAppData();
                        config.currentSettings = config.defaultSettings;
                        config.saveConfiguration();
                        if (settings.window) {
                            settings.window.close();
                        }
                        if (about.window) {
                            about.window.close();
                        }
                        verizonMessages.window.reload();
                        verizonMessages.window.show();
                        verizonMessages.window.focus();
                    }
                },
                {
                    label: 'Options',
                    click: function() {

                        settings.init();
                    }
                }, {
                    type: 'separator'
                }, {
                    label: 'About',
                    click: function() {
                        about.init();
                    }
                },
                {
                    label: 'Quit',
                    click: function() {
                        app.isQuiting = true;
                        app.quit();
                    }
                }
            ]);

            verizonMessages.tray.on('click', () => {
                verizonMessages.window.show();
                verizonMessages.window.focus();
            });

            verizonMessages.tray.setToolTip('Verizon Messages');
            verizonMessages.tray.setContextMenu(verizonMessages.trayContextMenu);

        },


        openWindow() {
            // Create the browser window.
            verizonMessages.window = new BrowserWindow({
                "y": config.get("posY"),
                "x": config.get("posX"),
                "width": config.get("width"),
                "height": config.get("height"),
                "minWidth": 480,
                "minHeight": 480,
                "title": "Verizon Messages",
                "show": false,
                "autoHideMenuBar": config.get("autoHideMenuBar") == true,
                "icon": path.join(__dirname, '/assets/icons/icon.png')
            });

            verizonMessages.window.loadURL(mainUrl);

            if (config.get("startminimized") != true) {
                verizonMessages.window.show();
            }

            verizonMessages.window.on('move', (e, evt) => {
                config.set("posX", verizonMessages.window.getBounds().x);
                config.set("posY", verizonMessages.window.getBounds().y);
                config.set("width", verizonMessages.window.getBounds().width);
                config.set("height", verizonMessages.window.getBounds().height);
                config.saveConfiguration();
            });

            verizonMessages.window.on('resize', (e, evt) => {
                config.set("posX", verizonMessages.window.getBounds().x);
                config.set("posY", verizonMessages.window.getBounds().y);
                config.set("width", verizonMessages.window.getBounds().width);
                config.set("height", verizonMessages.window.getBounds().height);
                config.saveConfiguration();
            });

            verizonMessages.window.on('close', (e) => {
                if (settings.window) {
                    settings.window.close();
                    settings.window = null;
                }

                if (verizonMessages.tray == undefined) {
                    app.quit();
                } else if (verizonMessages.window.forceClose !== true) {
                    e.preventDefault();
                    verizonMessages.window.hide();
                }
            });


            app.on('before-quit', () => {
                verizonMessages.window.forceClose = true;
            });

            // react on close and minimzie
            verizonMessages.window.on('minimize', function(event) {
                event.preventDefault();
                verizonMessages.window.hide();
            });

            verizonMessages.window.on('close', function(event) {
                if (!app.isQuiting) {
                    event.preventDefault();
                    verizonMessages.window.hide();
                }

                return false;
            });

            verizonMessages.window.on('hide', function() {
                currentWindowState = 'hidden';
            });

            verizonMessages.window.on('show', function() {
                currentWindowState = 'shown';
            });

            verizonMessages.window.webContents.on('new-window', verizonMessages.handleRedirect);


        },
        clearAppData() {
            dialog.showMessageBox(verizonMessages.window, {
                type: 'warning',
                buttons: ['Yes', 'Cancel'],
                defaultId: 1,
                title: 'Clear cache confirmation',
                message: 'This will clear all data (cookies, local storage etc) from this app. Are you sure you wish to proceed?'
            }, function(response) {
                if (response !== 0) {
                    return;
                }
                var session = verizonMessages.window.webContents.session;

                session.clearStorageData(function() {
                    session.clearCache(function() {
                        verizonMessages.window.loadURL(mainUrl);
                    });
                });
            });
        },

        setupShortcuts() {

            if (config.get("globalshortcut") == false) {
                return;
            }

            globalShortcut.register('CmdOrCtrl+Alt+T', function() {
                if (verizonMessages.window.isFocused())
                    verizonMessages.window.hide();
                else
                    verizonMessages.window.show();
            })
            // quick add task
            globalShortcut.register('CmdOrCtrl+Alt+A', () => {
                // open quick add popup
                verizonMessages.window.webContents.sendInputEvent({
                    type: "char",
                    keyCode: 'q'
                });
                verizonMessages.window.show();
            });

        },

        handleRedirect(e, url) {
            if (url != verizonMessages.window.webContents.getURL()) {
                e.preventDefault()
                shell.openExternal(url)
            }
        }
    };

    global.settings = {
        init() {
            // if there is already one instance of the window created show that one
            if (settings.window) {
                settings.window.show();
            } else {
                settings.openWindow();

            }
        },

        openWindow() {
            settings.window = new BrowserWindow({
                "width": 489,
                "height": 450,
                "resizable": true,
                "center": true,
                "frame": true,
                "title": "Options",
                icon: path.join(__dirname, '/assets/icons/icon_tray.png'),
                "webPreferences": {
                    "nodeIntegration": true,
                }
            });
            settings.window.setMenu(null);
            settings.window.setMenuBarVisibility(false);
            settings.window.loadURL("file://" + __dirname + "/assets/html/settings.html");
            settings.window.show();

            settings.window.on("close", () => {
                settings.window = null;
            });
        }
    };

    global.about = {
        init() {
            // if there is already one instance of the window created show that one
            if (about.window) {
                about.window.show();
            } else {
                about.openWindow();
                about.window.setMenu(null);
                about.window.setMenuBarVisibility(false);
            }
        },

        openWindow() {
            about.window = new BrowserWindow({
                "width": 558,
                "height": 648,
                "resizable": true,
                "center": true,
                "frame": true,
                icon: path.join(__dirname, '/assets/icons/icon_tray.png'),
                "webPreferences": {
                    "nodeIntegration": true,
                }

            });

            about.window.loadURL("file://" + __dirname + "/assets//html/about.html");
            about.window.show();
            about.window.webContents.on("new-window", (e, url) => {
                require('electron').shell.openExternal(url);
                e.preventDefault();
            });

            about.window.on("close", () => {
                about.window = null;
            });
        }
    };


    app.on('ready', () => {

        verizonMessages.init();
        verizonMessages.setupShortcuts();


    });

    app.on('will-quit', function() {
        if (config.get("globalshortcut") == true) {
            globalShortcut.unregisterAll();
        }
    });


    app.commandLine.appendSwitch('high-dpi-support', 1);
    app.commandLine.appendSwitch('force-device-scale-factor', 1);


})(this);

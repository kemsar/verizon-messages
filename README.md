# Verizon Messages for Linux

## Features

  * Auto start on startup (Minimize on startup available).
  <!-- * Nifty keyboard shortcuts to globally access Todoist actions (such as quickly adding tasks to Todoist). -->
  * Nifty toggleable TrayIcon with useful actions (TrayContextMenu, Single click to activate, etc).
  * Always Up-to-date! (it's wrapping the web version, remember?)

## Download

This project currently provides `DEB` and `RPM` packages in both `x86` and `x64` architectures. Most commonly-used GNU/Linux distros use either `DEB` or `RPM` packaging format (such as Debian; and its derivatives, the Red-Hat ecosystem --Fedora, CentOS, RHEL etc., and OpenSUSE too).

[Go to the Releases page](https://github.com/kevinsarsen/verizon-messages/releases) and grab the latest compatible package for your machine.

For the unininitated, if you're using Ubuntu, get the `.deb` package; or the `.rpm` package if your distro is Fedora/CentOS/RHEL/OpenSUSE.

## Installation

After downloading the suitable package from the [releases](https://github.com/kevinsarsen/verizon-messages/releases) page, open up a new Terminal window and use the following instructions to install the downloaded package:

For `.DEB` users:

   `$ sudo apt install <file_name.deb>` (ex: `sudo apt install VerizonMessages_1.0.0_amd64.deb`)

For `.RPM` users:

   `$ sudo yum install <file_name.rpm>` (ex: `sudo dnf install VerizonMessages_1.0.0.x86_x64.rpm`)


## Usage Instructions

Verizon Messagess is accessible from Installed Applications list, you can change settings by either `right-clicking on the tray icon > Options` or in the main window `hit Alt key and go to File > Options`. The configuration is saved in `~/.config/VerizonMessages/settings.json`.


## Global Keyboard Shortcuts

<!-- Keyboard shortcuts come in handy when you need to add a Task to Todoist but without having the window open at the moment.

* Ctrl + Alt + A - global shortcut to open the "Add Quick Task" action in Todoist app.
* Ctrl + Alt + T - Shows or hides the Todoist window.
* ESC - hides the window if isFocused() promises true.
* All other Todoist's shortcuts are accessible inside the window.


These bindings may not always work, for example, in cases where current bindings are globally registered by another application inb4 Todoist gets a chance --you'll have to quit or unregister those bindings and run Todoist again. -->


## Removal Instructions

If you'd like to remove `Verizon Messages` from your machine:

* run `$ sudo apt remove VerizonMessages` if you installed the .deb package

* run `$ sudo yum remove VerizonMessages` if you installed the .rpm package

If you'd like to remove, the configuration/data is stored in `~/.config/VerizonMessages`.


## Build Instructions

Visit (https://nodejs.org/en/download/package-manager/) and follow your distro-specific instructions to install (Node.js + npm).


### Build project:

* run `$ make build` in the extracted project directory.

The below command will automatically:

1. Download and install project dependencies
2. Download and install app dependencies
3. Build the app
4. Run the app in debug mode

### Building application packages:

If you're looking for a way to build `.deb` or `.rpm` or `.AppImage` or other distro-specific packages yourself:

run `$ make packages` in the extracted project directory. This will create (x86 and x64) LINUX ONLY packages for targets specified in the `package.json` file. The packages can be found in the `<proj_root>/dist` directory.


## Contributing

<!-- Feel free to poke around the code base and see if you can improve the app, which is probably the best part of FOSS devel. If you need help, feel free to reach out to me at [cyrus.frost@hotmail.com](mailto:cyrus.frost@hotmail.com). Good luck! -->

## Reporting Bugs/Issues

If you find an issue while using this app, please open a new Issue in the "Issues" tab and we'll go from there. If you already know how to fix it, please create a new Pull Request, I'll be more than happy to review and merge it sooner than later.

## License

This project is made available under the MIT License, you can obtain a full copy of it [here](https://opensource.org/licenses/MIT).

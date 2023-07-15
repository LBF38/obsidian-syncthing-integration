# Documentation and notes on the project

The main objectives of the plugin are:

- integrating the whole syncthing config in Obsidian
- visualizing the files conflicts in Obsidian
- visualizing devices and folders in Obsidian
- visualizing the syncthing status in Obsidian

To achieve this, I will need to connect to the syncthing API and get the data from it. I will also need to create a new pane in Obsidian to display the data.
The plugin will use the SyncThing REST API for easier integration. Therefore, a prerequesite is to have the syncthing server running on the same machine as Obsidian.
I will also need to check if the setup is working on Obsidian Mobile.

Some ideas for experimental features:

- launching syncthing from Obsidian when starting Obsidian
- excluding files from syncthing within Obsidian, in the plugin's settings

## What is the user workflow?

When using this plugin, the user should be able to simply and easily manage its Syncthing configuration, w/o a lot of configuration.
Moreover, the user should be informed of its configuration just like if he was using the Syncthing web interface or desktop app.
Hence, according to the features of the plugin, the user can see and manage its vault's synchronization with other devices, all inside Obsidian.
The folders shown in the Syncthing configuration pane should only be the ones that are part of the vault's scope.
All devices connected to that folder will then be shown too, so that the user can see the status of the synchronisation across all devices.

Here, we will try to describe common workflows that the user can have with the plugin.
Quick list of workflows:

- Managing files conflicts
- Control the Syncthing configuration and status
- Exclude files from Syncthing

### Managing files conflicts

When the user has a file conflict, he can see it with the available icon in icons pane.
When clicking on the icon, the user can see the list of files in conflict, and can choose to resolve the conflict by choosing one of the files.
Then, the user can see a 3 columns layout that shows a list of all conflicting files (on the left), the difference with the original file (in the middle), and details about the original file in the right column.
The user can then choose to resolve the conflict with the chosen file by accepting left, original or manually by opening the files in editor panes.
At the end of the process, when the decision is made, the conflicting file is deleted and the original file should contain the modifications made accordingly to the user decision.

For example, if there are two files in conflict, and the user chooses to accept left, which is the conflicting file (`<filename>.sync-conflict-<date>-<time>-<modifiedBy>.<ext>`), then the file will be deleted and the original file will contain the modifications made in the conflicting file.

Similarly, if the user chooses to accept original, then the conflicting file will be deleted and the original file will not be modified.

Finally, the third option would be to manually resolve the conflict by opening files in editor panes and copy/pasting the modifications from one file to the other.

### Control the Syncthing configuration and status

This workflow is a real integration of all the information available in the Syncthing web interface.
Therefore, the user should be able to see the status of the synchronization of the vault with other devices.
And he should also be able to have control over it.
So, he can start/stop the synchronization, or the whole Syncthing instance.
He can also add/remove devices and folders, and change the configuration of the folders.

### Exclude files from Syncthing

The user should be able to exclude files from Syncthing, just like in the Syncthing web interface.
This can be done by adding a `.stignore` file in the vault's root folder.
And it should be possible to do it from the plugin's settings, more easily than creating the file manually.

## Notes on the Obsidian API

### Main difference in `TFile` properties

- `file.basename` : file name without extension
- `file.name` : file name with extension

## Notes on the plugin's settings tab

 The UI should be simple depending on the platform :

- For desktop app => full UI and options. The plugin should be able to add all features and detect Syncthing.
- For mobile app => minimalist setup to redirect to the Syncthing app for better UI. Therefore, usage of intent or URI to redirect to Syncthing. But not yet available in Syncthing app. So, for the moment, on mobile, we redirect to the Play Store's Syncthing page so that anyone can either install or open the app.

=> minimalist setup on mobile app for now

Let's make some notes on the UI needs for desktop and mobile. These should be the bare minimum for the easiest user workflow.

### Desktop UI

On desktop, we have more space and more capabilities in Obsidian. (we can use all NodeJS APIs and more). Therefore, the user should be able to do everything to manage its Syncthing configuration and status.
So, here are the main features that the user should be able to do:

- [ ] Start/stop Syncthing through commands/settings tab.
- [ ] Add/remove devices through commands/settings tab.
- [ ] See files conflicts and resolve them through an editor UI pane. => can integrate the [Monaco editor](https://microsoft.github.io/monaco-editor/) in a pane.
- [ ] See the status of the synchronization of the vault with other devices.
- [ ] Add/remove folders or files to the Syncthing configuration through commands/settings tab. => can choose which files are synchronized with other devices.

### Mobile UI

The mobile UI should be minimalist by design. In the plugin's logic, I think that the user synchronizes its notes on mobile to mainly be able to read them on the go. Moreover, he could take some notes and synchronize them with other devices. But the mobile isn't confortable enough to show diffs and resolve conflicts. So, the mobile UI should be minimalist and redirect to the Syncthing app for better UI.

> **Note:** Mobile UI concerns all smartphones and also tablets. So, on tablets, there is more space for resolving conflicts and showing diffs. Therefore, it could be possible to integrate the editor pane for resolving conflicts on tablets. It will be considered in future versions.

Here are the main features that the mobile UI should have :

- [ ] Start/stop Syncthing through commands/settings tab. => leveraging URIs to Syncthing app.
- [ ] Add/remove devices through commands/settings tab. => leveraging URIs to Syncthing app.
- [ ] Open the Syncthing app.
  - [ ] Through opening the Play Store app page.
  - [ ] Through opening the Syncthing app if installed.
- [ ] Add/remove folders and/or files to the Syncthing configuration through commands/settings tab. => can choose which files are synchronized with other devices. (usage of the `.stignore` file)

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

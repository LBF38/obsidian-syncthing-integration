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

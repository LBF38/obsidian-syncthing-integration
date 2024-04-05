# ROADMAP

This file is here to gather all ideas for future plugin's development. \
The current development roadmap is available [on GitHub](https://github.com/LBF38/obsidian-syncthing-integration/projects/).

## Ideas for future development

- [ ] Syncthing configuration should be accessible in the plugin's settings.
  - [ ] It can be a lighter version than the official Syncthing app, in the first place.
  - [ ] The modifications made inside Obsidian should be reflected and saved in the official Syncthing app.
- [ ] Syncthing Status
- [ ] Notification if conflicts are detected
- [x] A way to resolve conflicts : Conflicts and Diffs modals
  - [x] These modals should provide the user with a way to handle the conflicts between files.
  - [x] Therefore, it should display a three-way diff between the original file, the conflicted file and the merge version.
  - [x] The ConflictsModal provides a simple UI to display all files in conflict.
  - [x] The DiffModal provides a simple UI to display the three-way diff between the files.
    - [x] It should also provide a way to resolve the conflicts with buttons or through an editor. (WIP)
    - [x] Relevant information about the files should be displayed. (Like dates, sizes, filenames, ...)
- [ ] Syncthing controls
  - [ ] If necessary, the plugin should provide a way to control Syncthing (start/stop) from Obsidian.
  - [ ] This can be related to the Syncthing configuration.

## Raw ideas

- Have a syncthing configuration modal rather than all in the plugin's settings.

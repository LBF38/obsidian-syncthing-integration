# Initial vision of the plugin

The plugin should work out-of-the-box, but you can configure it by going to the plugin settings. The main objective of this plugin is to provide a complete integration of Syncthing functionalities into the Obsidian app. Therefore, you don't have to rely on other apps to synchronize your vault. You only have to open the Obsidian app on the devices you want to synchronize and the plugin will take care of the rest.

The integration would interact with Syncthing using the CLI or the REST API. And the main objective is to handle all the vault synchronization process from the Obsidian app. Therefore, you don't have to open the Syncthing app on your devices to synchronize your vault.

However, it doesn't aim to manage multiple folders synced with Syncthing. The idea is to have the control over the Syncthing synchronization from the vault's settings. Feel free to synchronize other folders with Syncthing, but the plugin will only manage the vault's folder. All the plugin's features will only work on the vault's folder (for the conflict/diff modals and the settings).

> [!IMPORTANT]
> This vision is outdated after some exploration and technical limitations.
> Thus, a reframing of the project's scope and goals is described in the main README.

import { App, ButtonComponent, Modal } from "obsidian";

/**
 * Confirmation modal for actions that requires the user to confirm it.
 *
 * The modal needs the app, a message to display and an optional callback.
 * The callback will be called if the user confirms the action. (Clicks the "Yes" button)
 *
 * @export ConfirmModal
 */
export class ConfirmModal extends Modal {
	constructor(app: App, public message: string, public callback: () => void) {
		super(app);
	}
	onOpen() {
		this.titleEl.setText("Are you sure?");
		this.contentEl.setText(this.message);
		const buttons = this.contentEl.createDiv("div");
		buttons.addClass("confirm-modal-buttons");
		new ButtonComponent(buttons)
			.setButtonText("Yes")
			.setCta()
			.onClick(() => {
				this.callback();
				this.close();
			});
		new ButtonComponent(buttons).setButtonText("No").onClick(() => {
			this.close();
		});
	}
}

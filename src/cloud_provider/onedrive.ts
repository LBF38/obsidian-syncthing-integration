import { Client } from "@microsoft/microsoft-graph-client";
import { authResponseCallback } from "msal";

const clientId = "your-client-id";
const authority = "https://login.microsoftonline.com/common";
const scopes = ["files.read"];

const authProvider = async (): Promise<string> => {
	const userAgentApplication = new auth.UserAgentApplication(
		clientId,
		authority,
		(error, token) => {
			if (error) {
				console.error(error);
			}
		}
	);

	const accessToken = await userAgentApplication.acquireTokenSilent({
		scopes,
	});
	return accessToken.accessToken;
};

const client = Client.init({
	authProvider,
});

async function getFilesFromOneDrive() {
	const result = await client
		.api("/me/drive/root/children")
		.get()
		.then((res) => {
			console.log(res);
		});
}

getFilesFromOneDrive();

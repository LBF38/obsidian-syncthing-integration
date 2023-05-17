export class Failure {
	constructor(public message: string) {}
}

export class RestFailure extends Failure {
	constructor(message?: string) {
		super(message ? message : "Failed to get configuration from REST API");
	}
}
export class CliFailure extends Failure {
	constructor(message?: string) {
		super(message ? message : "Failed to get configuration from CLI");
	}
}

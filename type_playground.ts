/* eslint-disable */
// @ts-nocheck
/**
 * @file This is a playground for testing typescript features.
 *
 * The typesafety is disabled temporarily to allow for testing.
 */



// These types below are taken from https://github.com/sindresorhus/type-fest
/**
Matches a JSON object.

This type can be useful to enforce some input to be JSON-compatible or as a super-type to be extended from. Don't use this as a direct return type as the user would have to double-cast it: `jsonObject as unknown as CustomResponse`. Instead, you could extend your CustomResponse type from it to ensure your type only uses JSON-compatible types: `interface CustomResponse extends JsonObject { … }`.

@category JSON
*/
export type JsonObject = { [Key in string]: JsonValue } & {
	[Key in string]?: JsonValue | undefined;
};

/**
Matches a JSON array.

@category JSON
*/
export type JsonArray = JsonValue[] | readonly JsonValue[];

/**
Matches any valid JSON primitive value.

@category JSON
*/
export type JsonPrimitive = string | number | boolean | null;

/**
Matches any valid JSON value.

@see `Jsonify` if you need to transform a type to one that is assignable to `JsonValue`.

@category JSON
*/
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;

const test = {
	test: 42,
	function: "a string",
	array: [1, 2, 3],
	object: {
		test: "test",
	},
};

const json_string = JSON.stringify(test);

function checkParsedJSON(json: unknown): asserts json is JsonObject {
	if (!(typeof json === "object" && json !== null))
		throw new Error("JSON is not an object or is null");
	for (const key in json) {
		if (key in json) throw new Error("Error parsing JSON. Missing fields:");
		if (typeof json[key] === "string") {
			checkParsedJSON(json[key]);
		}
	}
}

const atest = JSON.parse(json_string);
//	   ^?
checkParsedJSON(atest);
atest;
// ^?

type MutuallyAssignable<T extends U, U extends V, V = T> = true;

function isArray<T extends string | number | boolean>(
	arg: T | T[]
): arg is T[] {
	return (
		Array.isArray(arg) && arg.every((item) => typeof item === typename())
	);
}
function isType<Param, Type>(
	param: Param extends Type ? Param : never
): param is Type {
	type return_type = string;
	const isType: MutuallyAssignable<typeof param, Type> = true;
	return isType;
}

// type PossibleTypes = string | number | boolean | null | undefined | object;
// function checkParsedJSON<T extends Record<string, PossibleTypes>>(
// 	parsed_json: unknown,
// 	fields: T
// ) {
// 	if (!(typeof parsed_json === "object" && parsed_json !== null))
// 		throw new Error("JSON is not an object or is null");
// 	if (
// 		!("folders" in parsed_json && Array.isArray(parsed_json["folders"])) ||
// 		!("devices" in parsed_json && Array.isArray(parsed_json["devices"])) ||
// 		!(
// 			"version" in parsed_json &&
// 			typeof parsed_json["version"] === "string"
// 		)
// 	)
// 		throw new Error("Error parsing JSON. Missing fields:");
// }
// checkParsedJSON("test", { folders: [""], devices: "string" });

// type CheckParsedJSON<
// 	Param,
// 	T extends Record<
// 		keyof (Param extends object ? Param : never),
// 		PossibleTypes
// 	>
// > = {
// 	[K in keyof (Param extends object ? Param : never)]: (Param extends object
// 		? Param
// 		: never)[K] extends T[K]
// 		? T[K]
// 		: never;
// };
// let test: CheckParsedJSON<"{folders:['test']}", { folders: string[] }> = {
// 	devices: "test",
// };
// type test<
// 	Param extends object,
// 	T extends Record<keyof Param, PossibleTypes>
// > = {
// 	[K in keyof Param]: Param[K] extends T[K] ? T[K] : never;
// }[keyof Param];
// let test2: test<{ folders: string[] }, { devices: string }>;

// --- Another test ---
// https://www.typescriptlang.org/play#code/PTAEGMCcFMBMEsAuBnUBzA9tViOgBaKIAOyAXCGkvgK4BGAdOBgLbAvxQbIYBmiwACoBPYtADKUeMQHxkyGtmAAmAOwAGZQBYAxHIXRmLFtAB2iALRblARgCsygJwA2O+oBQ0AB7EMkRKCIotCgAKIAjjQAhgA2yAA8ABoANKAAmgB8oAC87qD5oAAU8YIZhQCUOVmCoN6IZrCoiaAA-KA2oGSgypV1Dch5BcWlFVWgNX2mjemt7Z3dlW2IkIrzvLHI0ADc7u5BYuPBALJRxDmgAN6D+QBiGBhdNsnXoABCUZBdF4FRaF0A5HQPv9QABfdzgvbBUAANViigSpXOggA2gBraDCPjjAC6u32ISO2GQv2gJVqXnqU1QyGW8FMaCy2VAAAMRAdTFETKA5KAACQXQSgln46Hs6AAOS5ZKRzKJ8lJ8ThMQR8SuBVAKIACpAMGd6aAMVjeIcxCdiDiuhFonESqlxebtbqLVlJtNlqs2jq9fNTNAAG7QSAQjIZUUHAD6yOCUpM8RsWRAoAAROLQJzuby7hhk1DI1HmeLY2TvohfgCgZAQaDE2BU9CMyFee9ILmCaAI53o2Ji2qfn9QIDgakaH6fIZ6rAyP9iM6g0Fq7X0wGg0A
// credits goes to https://github.com/microsoft/TypeScript/issues/27024#issuecomment-421529650
export type Equals<X, Y> = (<T>() => T extends X ? 1 : 2) extends <
	T
>() => T extends Y ? 1 : 2
	? true
	: false;

type TypeMap = {
	Foo: 1;
	Bar: { tag: "bar" };
};

type Values<T> = T[keyof T];

type Message<T extends string> = `Type name is ${T}`;

type TypeName<T> = Message<
	Values<{
		[Prop in keyof TypeMap]: Equals<T, TypeMap[Prop]> extends true
			? Prop
			: never;
	}>
>;

type _ = TypeName<1>; // "Type name is Foo"
type __ = TypeName<{ tag: "bar" }>; // "Type name is Bar"
type ___ = TypeName<{ tag: "bar"; unexpected: "property" }>; // never

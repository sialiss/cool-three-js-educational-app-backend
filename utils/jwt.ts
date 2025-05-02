import { create, Header, Payload } from "../deps.ts"

export async function getKey(secret: string): Promise<CryptoKey> {
	const encoder = new TextEncoder()
	return await crypto.subtle.importKey(
		"raw",
		encoder.encode(secret),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign", "verify"]
	)
}

export async function createJWT(
	payload: Payload,
	key: CryptoKey
): Promise<string> {
	const header: Header = { alg: "HS256", typ: "JWT" }
	return await create(header, payload, key)
}

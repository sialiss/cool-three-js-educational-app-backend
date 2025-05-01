import { hash, compare } from "https://deno.land/x/bcrypt@v0.4.1/mod.ts"
import { verify } from "https://deno.land/x/djwt@v3.0.1/mod.ts"

export async function hashPassword(password: string) {
	const hashedPassword = await hash(password)
	return hashedPassword
}

export async function checkPassword(password: string, hashedPassword: string) {
	const isValid = await compare(password, hashedPassword)
	return isValid
}

export async function checkRole(jwt: string, secret_key: CryptoKey) {
	const payload = await verify(jwt, secret_key)
	return payload.role
}

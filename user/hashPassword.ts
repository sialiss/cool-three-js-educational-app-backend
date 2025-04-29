import { hash, compare } from "https://deno.land/x/bcrypt@v0.4.1/mod.ts"

export async function hashPassword(password: string) {
	const hashedPassword = await hash(password)
	return hashedPassword
}

export async function checkPassword(password: string, hashedPassword: string) {
	const isValid = await compare(password, hashedPassword)
	return isValid
}

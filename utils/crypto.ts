import { hash, compare } from "https://deno.land/x/bcrypt@v0.4.1/mod.ts"
import { verify } from "https://deno.land/x/djwt@v3.0.1/mod.ts"
import type { PrismaClient, User } from "../generated/prisma/index.ts"

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

export async function checkUserId(jwt: string, secret_key: CryptoKey) {
	const payload = await verify(jwt, secret_key)
	return payload.userId
}

type SafeUser = Omit<User, "password"> & {
	completedTheoryLessons: { id: number }[]
	completedPracticeLessons: { id: number }[]
	groups: { id: number }[]
}

type GetUserResult = { user: SafeUser } | { error: string; status: number }

export async function getUserByToken(
	jwt: string,
	secret_key: CryptoKey,
	prisma: PrismaClient
): Promise<GetUserResult> {
	const id = await checkUserId(jwt, secret_key)
	if (!id) return { error: "ID не найден", status: 404 }
	if (typeof id !== "number")
		return { error: "ID должен быть числом", status: 400 }

	const user = await prisma.user.findUnique({
		where: { id },
		include: {
			completedTheoryLessons: {
				select: { id: true },
			},
			completedPracticeLessons: {
				select: { id: true },
			},
			groups: {
				select: { id: true },
			},
		},
	})

	if (!user) return { error: "Пользователь не найден", status: 404 }

	// deno-lint-ignore no-unused-vars
	const { password, ...safeUser } = user
	return { user: safeUser }
}

import { assert, Context, getNumericDate } from "../deps.ts"
import { prisma } from "../utils/prisma.ts"
import {
	hashPassword,
	checkPassword,
	checkRole,
	getUserByToken,
} from "../utils/crypto.ts"
import { getKey, createJWT } from "../utils/jwt.ts"

const secret = Deno.env.get("LOGIN_SECRET_KEY")!
assert(secret, "ключ потеряли")
const secretKey = await getKey(secret)

export async function getAll(ctx: Context) {
	ctx.response.body = await prisma.user.findMany()
}

export async function getById(ctx: Context & { params: { id: string } }) {
	const id = Number(ctx.params.id)
	ctx.response.body = await prisma.user.findUnique({ where: { id } })
}

export async function create(ctx: Context) {
	const body = await ctx.request.body({ type: "json" }).value
	const { name, surname, patronymic, login, password, email, phone, role } =
		body

	if (!name || !surname || !login || !password || !email || !role) {
		ctx.response.status = 400
		ctx.response.body = { error: "Не все обязательные поля заполнены" }
		return
	}

	const result = await prisma.user.create({
		data: {
			name,
			surname,
			patronymic,
			login,
			password: await hashPassword(password),
			email,
			phone,
			role,
		},
	})

	ctx.response.status = 201
	ctx.response.body = result
}

export async function remove(ctx: Context & { params: { id: string } }) {
	const id = Number(ctx.params.id)
	const user = await prisma.user.delete({ where: { id } })
	ctx.response.body = user
}

export async function update(ctx: Context & { params: { id: string } }) {
	const id = Number(ctx.params.id)
	const { name, surname, patronymic, email, login, password, phone, role } =
		await ctx.request.body().value

	const updatedUser = await prisma.user.update({
		where: { id },
		data: {
			name,
			surname,
			patronymic,
			email,
			login,
			password: await hashPassword(password),
			phone,
			role,
		},
	})

	ctx.response.body = updatedUser
}

export async function login(ctx: Context) {
	const { login, password } = await ctx.request.body({ type: "json" }).value
	const user = await prisma.user.findUnique({ where: { login } })
	console.log(login, password)

	if (!user || !(await checkPassword(password, user.password))) {
		ctx.response.status = 418
		ctx.response.body = { text: "Неверный логин или пароль", ok: false }
		return
	}

	const token = await createJWT(
		{
			userId: user.id,
			role: user.role,
			exp: getNumericDate(60 * 60 * 24 * 30),
		},
		secretKey
	)

	ctx.response.body = { token, role: user.role, ok: true }
}

export async function getRole(ctx: Context) {
	const { token } = await ctx.request.body().value
	const result = await checkRole(token, secretKey)

	if (result) {
		ctx.response.body = { role: result }
	} else {
		ctx.response.status = 418
		ctx.response.body = { text: "роль не найдена", ok: false }
	}
}

export async function getMe(ctx: Context) {
	const authHeader = ctx.request.headers.get("Authorization")
	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		ctx.response.status = 401
		ctx.response.body = { error: "Нет токена" }
		return
	}

	const token = authHeader.replace("Bearer ", "")
	const result = await getUserByToken(token, secretKey, prisma)

	if ("error" in result) {
		ctx.response.status = result.status
		ctx.response.body = { error: result.error }
		return
	}

	ctx.response.body = { user: result.user, ok: true }
}

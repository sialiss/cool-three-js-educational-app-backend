import { assert, Context } from "../deps.ts"
import { prisma } from "../utils/prisma.ts"
import { getUserByToken } from "../utils/crypto.ts"
import { getKey } from "../utils/jwt.ts";

const secret = Deno.env.get("LOGIN_SECRET_KEY")!
assert(secret, "ключ потеряли")
const secretKey = await getKey(secret)

export async function getAll(ctx: Context) {
	const lessons = await prisma.lesson.findMany({
		orderBy: { id: "asc" },
		include: {
			theory: true,
			practice: true,
			allowedUsers: true,
			allowedGroups: true,
		},
	})
	ctx.response.body = lessons
}

export async function getOne(ctx: Context & { params: { id: string } }) {
	const id = Number(ctx.params.id)
	const lesson = await prisma.lesson.findUnique({
		where: { id },
		include: {
			theory: true,
			practice: true,
			allowedUsers: true,
			allowedGroups: true,
		},
	})
	if (!lesson) {
		ctx.response.status = 404
		ctx.response.body = { error: "Урок не найден" }
		return
	}
	ctx.response.body = lesson
}

export async function getAvailableLessonsForUser(
	ctx: Context & { params: { id: string } }
) {
	const userId = Number(ctx.params.id)

	// получаем группы пользователя
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: {
			id: true,
			groups: { select: { id: true } },
		},
	})

	if (!user) {
		ctx.response.status = 404
		ctx.response.body = { error: "Пользователь не найден" }
		return
	}

	const groupIds = user.groups.map(g => g.id)

	const lessons = await prisma.lesson.findMany({
		where: {
			OR: [
				{ allowedUsers: { some: { id: userId } } },
				{ allowedGroups: { some: { id: { in: groupIds } } } },
			],
		},
		include: {
			theory: true,
			practice: true,
			allowedUsers: true,
			allowedGroups: true,
		},
		orderBy: { id: "asc" },
	})

	ctx.response.body = lessons
}

export async function getAvailableLessonsForMe(ctx: Context) {
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

	const user = result.user
	const groupIds = user.groups.map(g => g.id)

	const lessons = await prisma.lesson.findMany({
		where: {
			OR: [
				{ allowedUsers: { some: { id: user.id } } },
				{ allowedGroups: { some: { id: { in: groupIds } } } },
			],
		},
		include: {
			theory: true,
			practice: true,
			allowedUsers: true,
			allowedGroups: true,
		},
		orderBy: { id: "asc" },
	})

	ctx.response.body = lessons
}

export async function create(ctx: Context) {
	const {
		title,
		description,
		userIds = [],
		groupIds = [],
	} = await ctx.request.body({ type: "json" }).value

	const lesson = await prisma.lesson.create({
		data: {
			title,
			description,
			allowedUsers: {
				connect: userIds.map((id: number) => ({ id })),
			},
			allowedGroups: {
				connect: groupIds.map((id: number) => ({ id })),
			},
		},
		include: {
			allowedUsers: true,
			allowedGroups: true,
		},
	})
	ctx.response.body = lesson
}

export async function update(ctx: Context & { params: { id: string } }) {
	const id = Number(ctx.params.id)
	const {
		title,
		description,
		userIds = undefined,
		groupIds = undefined,
	} = await ctx.request.body({ type: "json" }).value

	const data: any = { title, description }

	if (Array.isArray(userIds)) {
		data.allowedUsers = {
			set: userIds.map((id: number) => ({ id })),
		}
	}

	if (Array.isArray(groupIds)) {
		data.allowedGroups = {
			set: groupIds.map((id: number) => ({ id })),
		}
	}

	const lesson = await prisma.lesson.update({
		where: { id },
		data,
		include: {
			allowedUsers: true,
			allowedGroups: true,
		},
	})
	ctx.response.body = lesson
}

export async function remove(ctx: Context & { params: { id: string } }) {
	const id = Number(ctx.params.id)
	await prisma.lesson.delete({ where: { id } })
	ctx.response.status = 204
}

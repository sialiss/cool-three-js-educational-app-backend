import { Context } from "../deps.ts"
import { prisma } from "../utils/prisma.ts"
import { getUserByToken } from "../utils/crypto.ts"
import { getKey } from "../utils/jwt.ts"

const secret = Deno.env.get("LOGIN_SECRET_KEY")!
const secretKey = await getKey(secret)

export async function getAll(ctx: Context) {
	ctx.response.body = await prisma.theoryLesson.findMany({
		orderBy: { id: "asc" },
	})
}

export async function getOne(ctx: Context & { params: { id: string } }) {
	const id = Number(ctx.params.id)
	const lesson = await prisma.theoryLesson.findUnique({ where: { id } })
	if (!lesson) {
		ctx.response.status = 404
		ctx.response.body = { error: "Урок не найден" }
		return
	}
    ctx.response.body = { lesson, ok: true }
}

export async function create(ctx: Context) {
	const { title, description, content } = await ctx.request.body().value
	const lesson = await prisma.theoryLesson.create({
		data: { title, description, content },
	})
	ctx.response.body = lesson
}

export async function update(ctx: Context & { params: { id: string } }) {
	const id = Number(ctx.params.id)
	const { title, description, content } = await ctx.request.body().value
	const lesson = await prisma.theoryLesson.update({
		where: { id },
		data: { title, description, content },
	})
	ctx.response.body = lesson
}

export async function remove(ctx: Context & { params: { id: string } }) {
	const id = Number(ctx.params.id)
	await prisma.theoryLesson.delete({ where: { id } })
	ctx.response.status = 204
}

export async function toggleComplete(ctx: Context & { params: { id: string } }) {
	const lessonId = Number(ctx.params.id)
	const { token } = await ctx.request.body().value

	const result = await getUserByToken(token, secretKey, prisma)
	if ("error" in result) {
		ctx.response.status = result.status
		ctx.response.body = { error: result.error }
		return
	}

	const user = result.user
	const alreadyCompleted = user.completedTheoryLessons.some(
		l => l.id === lessonId
	)

	await prisma.user.update({
		where: { id: user.id },
		data: {
			completedTheoryLessons: {
				[alreadyCompleted ? "disconnect" : "connect"]: { id: lessonId },
			},
		},
	})

	ctx.response.body = { completed: !alreadyCompleted }

}

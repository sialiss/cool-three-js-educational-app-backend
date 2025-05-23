import { Context } from "../deps.ts"
import { prisma } from "../utils/prisma.ts"
import { getUserByToken } from "../utils/crypto.ts"
import { getKey } from "../utils/jwt.ts"

const secret = Deno.env.get("LOGIN_SECRET_KEY")!
const secretKey = await getKey(secret)

export async function getAll(ctx: Context) {
	const lessons = await prisma.practiceLesson.findMany({
		include: { lesson: true },
		orderBy: { id: "asc" },
	})
	ctx.response.body = lessons
}

export async function getOne(ctx: Context & { params: { id: string } }) {
	const id = Number(ctx.params.id)
	const practice = await prisma.practiceLesson.findUnique({
		where: { id },
		include: { lesson: true },
	})
	if (!practice) {
		ctx.response.status = 404
		ctx.response.body = { error: "Урок не найден" }
		return
	}
	ctx.response.body = { lesson: practice, ok: true }
}

export async function create(ctx: Context) {
	const { lessonId, size, field, extras, goal, author } =
		await ctx.request.body().value

	if (!lessonId || !field) {
		ctx.response.status = 400
		ctx.response.body = { error: "Обязательные поля не указаны" }
		return
	}

	try {
		const lesson = await prisma.practiceLesson.create({
			data: {
				author,
				size,
				field,
				extras,
				goal,
				lesson: {
					connect: { id: lessonId },
				},
			},
		})

		ctx.response.status = 201
		ctx.response.body = { lesson, created: true }
	} catch (err) {
		console.error("Ошибка при создании практики:", err)

		const existing = await prisma.practiceLesson.findUnique({
			where: { lessonId },
			select: { id: true },
		})

		ctx.response.status = 200 // намеренно 200, чтобы frontend мог различать ситуацию
		ctx.response.body = {
			created: false,
			alreadyExists: true,
			existingLessonId: existing?.id ?? null,
		}
	}
}

export async function update(ctx: Context & { params: { id: string } }) {
	const id = Number(ctx.params.id)
	const { title, description, author, size, field, extras, goal } =
		await ctx.request.body().value

	// deno-lint-ignore no-explicit-any
	const lessonUpdateData: Record<string, any> = {}
	if (title?.trim()) lessonUpdateData.title = title
	if (description?.trim()) lessonUpdateData.description = description

	const practice = await prisma.practiceLesson.update({
		where: { id },
		data: {
			author,
			size,
			field,
			extras,
			goal,
			...(Object.keys(lessonUpdateData).length > 0 && {
				lesson: { update: lessonUpdateData },
			}),
		},
		include: { lesson: true },
	})

	ctx.response.body = { lesson: practice, ok: true }
}

export async function remove(ctx: Context & { params: { id: string } }) {
	const id = Number(ctx.params.id)
	await prisma.practiceLesson.delete({ where: { id } })
	ctx.response.status = 204
}

export async function toggleComplete(
	ctx: Context & { params: { id: string } }
) {
	const lessonId = Number(ctx.params.id)
	const { token } = await ctx.request.body().value

	const result = await getUserByToken(token, secretKey, prisma)
	if ("error" in result) {
		ctx.response.status = result.status
		ctx.response.body = { error: result.error }
		return
	}

	const user = result.user
	const alreadyCompleted = user.completedPracticeLessons.some(
		l => l.id === lessonId
	)

	if (!alreadyCompleted) {
		await prisma.user.update({
			where: { id: user.id },
			data: {
				completedPracticeLessons: {
					connect: { id: lessonId },
				},
			},
		})
	}

	ctx.response.body = { completed: true }
}

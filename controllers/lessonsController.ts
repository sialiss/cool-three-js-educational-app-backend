import { Context } from "../deps.ts"
import { prisma } from "../utils/prisma.ts"

export async function getAll(ctx: Context) {
	const lessons = await prisma.lesson.findMany({
		orderBy: { id: "asc" },
		include: {
			theory: true,
			practice: true,
		},
	})
	ctx.response.body = lessons
}

export async function getOne(ctx: Context & { params: { id: string } }) {
	const id = Number(ctx.params.id)
	const lesson = await prisma.lesson.findUnique({ where: { id } })
	if (!lesson) {
		ctx.response.status = 404
		ctx.response.body = { error: "Урок не найден" }
		return
	}
	ctx.response.body = lesson
}

export async function create(ctx: Context) {
	const { title, description } = await ctx.request.body().value
	const lesson = await prisma.lesson.create({
		data: { title, description },
	})
	ctx.response.body = lesson
}

export async function update(ctx: Context & { params: { id: string } }) {
	const id = Number(ctx.params.id)
	const { title, description } = await ctx.request.body().value
	const lesson = await prisma.lesson.update({
		where: { id },
		data: { title, description },
	})
	ctx.response.body = lesson
}

export async function remove(ctx: Context & { params: { id: string } }) {
	const id = Number(ctx.params.id)
	await prisma.lesson.delete({ where: { id } })
	ctx.response.status = 204
}

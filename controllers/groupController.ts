import { Context } from "../deps.ts"
import { User } from "../generated/prisma/index.ts";
import { prisma } from "../utils/prisma.ts"

export async function getAll(ctx: Context) {
	const groups = await prisma.group.findMany({
		include: {
			users: true,
			lessons: true,
		},
	})
	ctx.response.body = groups
}

export async function getById(ctx: Context & { params: { id: string } }) {
	const id = Number(ctx.params.id)
	const group = await prisma.group.findUnique({
		where: { id },
		include: {
			users: true,
			lessons: true,
		},
	})
	if (!group) {
		ctx.response.status = 404
		ctx.response.body = { error: "Группа не найдена" }
		return
	}
	ctx.response.body = group
}

export async function create(ctx: Context) {
	const body = await ctx.request.body({ type: "json" }).value
	const { name, startDate, endDate, userIds, lessonIds } = body

	if (!name || !startDate || !endDate) {
		ctx.response.status = 400
		ctx.response.body = { error: "Не все обязательные поля заполнены" }
		return
	}

	const group = await prisma.group.create({
		data: {
			name,
			startDate: new Date(startDate),
			endDate: new Date(endDate),
			users: userIds
				? { connect: userIds.map((id: number) => ({ id })) }
				: undefined,
			lessons: lessonIds
				? { connect: lessonIds.map((id: number) => ({ id })) }
				: undefined,
		},
	})

	ctx.response.status = 201
	ctx.response.body = group
}

export async function update(ctx: Context & { params: { id: string } }) {
	const id = Number(ctx.params.id)
	const { name, startDate, endDate, userIds, lessonIds } =
		await ctx.request.body({ type: "json" }).value

	const updatedGroup = await prisma.group.update({
		where: { id },
		data: {
			name,
			startDate: startDate ? new Date(startDate) : undefined,
			endDate: endDate ? new Date(endDate) : undefined,
			users: userIds
				? { set: userIds.map((id: number) => ({ id })) }
				: undefined,
			lessons: lessonIds
				? { set: lessonIds.map((id: number) => ({ id })) }
				: undefined,
		},
	})

	ctx.response.body = updatedGroup
}

export async function remove(ctx: Context & { params: { id: string } }) {
	const id = Number(ctx.params.id)
	const deletedGroup = await prisma.group.delete({ where: { id } })
	ctx.response.body = deletedGroup
}

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

export async function getGroupUsers(ctx: Context) {
	const url = new URL(ctx.request.url)
	const groupIds = url.searchParams.getAll("groupId").map(Number)
	const status = url.searchParams.get("status") // "active" | "finished" | undefined

	const now = new Date()

	// Условие по группам
	const groupFilter = groupIds.length ? { id: { in: groupIds } } : undefined

	// Условие по статусу групп
	let statusFilter = {}
	if (status === "active") {
		statusFilter = {
			startDate: { lte: now },
			endDate: { gte: now },
		}
	} else if (status === "finished") {
		statusFilter = {
			endDate: { lt: now },
		}
	}

	const groups = await prisma.group.findMany({
		where: {
			...groupFilter,
			...statusFilter,
		},
		include: {
			users: true,
		},
	})

	// Объединение пользователей из всех групп, без дубликатов
	const usersMap = new Map<number, User>()
	for (const group of groups) {
		for (const user of group.users) {
			usersMap.set(user.id, user)
		}
	}

	const grouped = groups.map(group => {
		const isActive = group.startDate <= now && group.endDate >= now
		return {
			groupId: group.id,
			groupName: group.name,
			status: isActive ? "active" : "finished",
			users: group.users,
		}
	})

	ctx.response.body = grouped
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

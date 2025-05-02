// // main.ts
// import { Application } from "./deps.ts"
// import authRouter from "./routes/auth.ts"

// const app = new Application()

// app.use(authRouter.routes())
// app.use(authRouter.allowedMethods())

// console.log("Server running on http://localhost:8000")
// await app.listen({ port: 8000 })

import { PrismaClient } from "./generated/prisma/index.ts"
import { Application, Router } from "https://deno.land/x/oak@v11.1.0/mod.ts"
import {
	create,
	getNumericDate,
	Header,
	Payload,
} from "https://deno.land/x/djwt@v3.0.1/mod.ts"
import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts"
import {
	checkPassword,
	checkRole,
	getUserByToken,
	hashPassword,
} from "./user/crypto.ts"
import { assert } from "https://deno.land/x/oak@v11.1.0/util.ts"

/**
 * Initialize.
 */

const prisma = new PrismaClient({
	datasources: {
		db: {
			url: Deno.env.get("DATABASE_URL"),
		},
	},
})
const app = new Application()
app.use(
	oakCors({
		origin: "http://localhost:3000",
		credentials: true,
	})
)
const router = new Router()
app.use(router.routes())
app.use(router.allowedMethods())

async function getKey(secret: string): Promise<CryptoKey> {
	const encoder = new TextEncoder()
	return await crypto.subtle.importKey(
		"raw",
		encoder.encode(secret),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign", "verify"]
	)
}

const secret = Deno.env.get("LOGIN_SECRET_KEY")
assert(secret, "ключ потеряли")
const secret_key = await getKey(secret)

/**
 * Setup routes.
 */

router
	.get("/", context => {
		context.response.body = "Welcome to the User API!"
	})
	.get("/user", async context => {
		// Get all users.
		const users = await prisma.user.findMany()
		context.response.body = users
	})
	.get("/user/:id", async context => {
		// Get one user by id.
		const { id } = context.params
		const user = await prisma.user.findUnique({
			where: {
				id: Number(id),
			},
		})
		context.response.body = user
	})
	.post("/user/create", async context => {
		const body = await context.request.body().value
		const {
			name,
			surname,
			patronymic,
			login,
			password,
			email,
			phone,
			role,
		} = body

		// Валидация
		if (!name || !surname || !login || !password || !email || !role) {
			context.response.status = 400
			context.response.body = {
				error: "Не все обязательные поля заполнены",
			}
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

		context.response.status = 201
		context.response.body = result
	})

	.delete("/user/:id", async context => {
		// Delete a user by id.
		const { id } = context.params
		const user = await prisma.user.delete({
			where: {
				id: Number(id),
			},
		})
		context.response.body = user
	})
	.put("/user/:id", async context => {
		const { id } = context.params
		const { name, login, role } = await context.request.body().value

		const updatedUser = await prisma.user.update({
			where: { id: Number(id) },
			data: { name, login, role },
		})

		context.response.body = updatedUser
	})

	.post("/user/login", async context => {
		// Log in.
		const body = context.request.body({ type: "json" })
		const { login, password } = await body.value
		console.log(login, password)
		const user = await prisma.user.findFirst({
			where: {
				login,
			},
		})
		if (!user) {
			context.response.body = {
				text: "пользователь не найден",
				ok: false,
			}
			context.response.status = 418
			context.response.type = "error"
		} else if (await checkPassword(password, user.password)) {
			const header: Header = {
				alg: "HS256",
				typ: "JWT",
			}
			const payload: Payload = {
				userId: user.id,
				role: user.role,
				exp: getNumericDate(60 * 60 * 24 * 30), // токен действителен 1 месяц
			}
			const token = await create(header, payload, secret_key)
			context.response.body = { token: token, role: user.role, ok: true }
		} else {
			context.response.body = { text: "неверный пароль", ok: false }
			context.response.status = 418
		}
	})
	.post("/user/getrole", async context => {
		// Get user role by token
		const { token } = await context.request.body().value
		const result = await checkRole(token, secret_key)
		if (result) {
			context.response.body = { role: result }
		} else {
			context.response.body = { text: "роль не найдена", ok: false }
			context.response.status = 418
		}

		// GET /theory-lessons
		router.get("/theory-lessons", async context => {
			const lessons = await prisma.theoryLesson.findMany({
				orderBy: { id: "asc" },
			})
			context.response.body = lessons
		})

		// GET /theory-lessons/:id
		router.get("/theory-lessons/:id", async context => {
			const id = Number(context.params.id)
			const lesson = await prisma.theoryLesson.findUnique({
				where: { id },
			})
			if (!lesson) {
				context.response.status = 404
				context.response.body = { error: "Урок не найден" }
				return
			}
			context.response.body = lesson
		})

		// POST /theory-lessons
		router.post("/theory-lessons", async context => {
			const { title, description, content } = await context.request.body()
				.value
			const lesson = await prisma.theoryLesson.create({
				data: { title, description, content },
			})
			context.response.body = lesson
		})

		// PUT /theory-lessons/:id
		router.put("/theory-lessons/:id", async context => {
			const id = Number(context.params.id)
			const { title, description, content } = await context.request.body()
				.value
			const lesson = await prisma.theoryLesson.update({
				where: { id },
				data: { title, description, content },
			})
			context.response.body = lesson
		})

		// DELETE /theory-lessons/:id
		router.delete("/theory-lessons/:id", async context => {
			const id = Number(context.params.id)
			await prisma.theoryLesson.delete({ where: { id } })
			context.response.status = 204
		})

		// PUT /theory-lessons/:id/complete
		router.put("/theory-lessons/:id/complete", async context => {
			const { token } = await context.request.body().value
			const lessonId = Number(context.params.id)

			const result = await getUserByToken(token, secret_key, prisma)
			if ("error" in result) {
				return {
					status: result.status,
					body: { error: result.error },
				}
			}

			const user = result.user
			const alreadyCompleted = user.completedTheoryLessons.some(
				l => l.id === lessonId
			)

			if (alreadyCompleted) {
				// Удаляем отметку
				await prisma.user.update({
					where: { id: user.id },
					data: {
						completedTheoryLessons: {
							disconnect: { id: lessonId },
						},
					},
				})
				context.response.body = { completed: false }
			} else {
				// Добавляем отметку
				await prisma.user.update({
					where: { id: user.id },
					data: {
						completedTheoryLessons: {
							connect: { id: lessonId },
						},
					},
				})
				context.response.body = { completed: true }
			}
		})
	})

/**
 * Setup middleware.
 */

app.use(router.routes())
app.use(router.allowedMethods())

/**
 * Start server.
 */

await app.listen({ port: 8000 })

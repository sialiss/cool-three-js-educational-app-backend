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
import { hashPassword } from "./user/hashPassword.ts"
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
const router = new Router()

// вот это надо запоминать а не перегенерировать каждый запуск сервера!!!!!!!
const secret_key = await crypto.subtle.generateKey(
	{ name: "HMAC", hash: "SHA-512" },
	true,
	["sign", "verify"]
)
assert(secret_key, "ключ потеряли")

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
		// Create a new user.
		const { name, login, password } = await context.request.body().value
		const result = await prisma.user.create({
			data: {
				name,
				login,
				password: await hashPassword(password),
			},
		})
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

	.post("/user/login", async context => {
		// Log in.
		const { login, password } = await context.request.body().value
		const user = await prisma.user.findUnique({
			where: {
				login,
				password: await hashPassword(password),
			},
		})
		if (!user) {
			context.response.body = "пользователь не найден"
			context.response.status = 418
		} else {
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
			context.response.body = token
		}
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

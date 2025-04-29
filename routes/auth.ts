// import { Router, Context } from "../deps.ts"
// import { dbClient } from "../db.ts"
// import { create, getNumericDate } from "../deps.ts"

// const JWT_SECRET = "your-secret-key"

// const authRouter = new Router()

// authRouter
// 	.post("/register", async (ctx: Context) => {
// 		const { username, password } = await ctx.request.body({ type: "json" })
// 			.value
// 		await dbClient.queryObject(
// 			"INSERT INTO users (username, password) VALUES ($1, $2)",
// 			username,
// 			password
// 		)
// 		ctx.response.body = { status: "registered" }
// 	})
// 	.post("/login", async (ctx: Context) => {
// 		const { username, password } = await ctx.request.body({ type: "json" })
// 			.value
// 		const result = await dbClient.queryObject<{ id: number }>(
// 			"SELECT id FROM users WHERE username = $1 AND password = $2",
// 			username,
// 			password
// 		)

// 		if (result.rows.length === 0) {
// 			ctx.response.status = 401
// 			ctx.response.body = { error: "Invalid credentials" }
// 			return
// 		}

// 		const jwt = await create(
// 			{ alg: "HS256", typ: "JWT" },
// 			{ username, exp: getNumericDate(60 * 60) },
// 			JWT_SECRET
// 		)

// 		ctx.response.body = { token: jwt }
// 	})

// export default authRouter

import { Application, Router } from "./deps.ts"
import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts"
import userRoutes from "./routes/user.ts"
import groupRoutes from "./routes/group.ts"
import lessonsRoutes from "./routes/lessons.ts"
import theoryLessonsRoutes from "./routes/theoryLessons.ts"
import practiceLessonsRoutes from "./routes/practiceLessons.ts"

const app = new Application()

app.use(
	oakCors({
		origin: "http://localhost:3000",
		credentials: true,
	})
)

const router = new Router()
app.use(router.routes())
router.get("/", context => {
	context.response.body = "Welcome to the Server API!"
})

app.use(userRoutes.routes())
app.use(userRoutes.allowedMethods())

app.use(groupRoutes.routes())
app.use(groupRoutes.allowedMethods())

app.use(lessonsRoutes.routes())
app.use(lessonsRoutes.allowedMethods())

app.use(theoryLessonsRoutes.routes())
app.use(theoryLessonsRoutes.allowedMethods())

app.use(practiceLessonsRoutes.routes())
app.use(practiceLessonsRoutes.allowedMethods())

console.log("Server running on http://localhost:8000")
await app.listen({ port: 8000 })

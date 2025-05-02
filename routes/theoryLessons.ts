import { Router } from "../deps.ts"
import * as controller from "../controllers/theoryLessonsController.ts"

const router = new Router()

router
	.get("/theory-lessons", controller.getAll)
	.get("/theory-lessons/:id", controller.getOne)
	.post("/theory-lessons", controller.create)
	.put("/theory-lessons/:id", controller.update)
	.delete("/theory-lessons/:id", controller.remove)
	.put("/theory-lessons/:id/complete", controller.toggleComplete)

export default router

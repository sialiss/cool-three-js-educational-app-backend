import { Router } from "../deps.ts"
import * as controller from "../controllers/practiceLessonsController.ts"

const router = new Router()

router
	.get("/practice-lessons", controller.getAll)
	.get("/practice-lessons/:id", controller.getOne)
	.post("/practice-lessons", controller.create)
	.put("/practice-lessons/:id", controller.update)
	.delete("/practice-lessons/:id", controller.remove)
	.put("/practice-lessons/:id/complete", controller.toggleComplete)

export default router

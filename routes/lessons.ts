import { Router } from "../deps.ts"
import * as controller from "../controllers/lessonsController.ts"

const router = new Router()

router
	.get("/lessons", controller.getAll)
	.get("/lessons/:id", controller.getOne)
	.post("/lessons", controller.create)
	.put("/lessons/:id", controller.update)
	.delete("/lessons/:id", controller.remove)

export default router

import { Router } from "../deps.ts"
import * as groupController from "../controllers/groupController.ts"

const router = new Router()

router
	.get("/group", groupController.getAll)
	.get("/group/:id", groupController.getById)
	.post("/group/create", groupController.create)
	.put("/group/:id", groupController.update)
	.delete("/group/:id", groupController.remove)

export default router

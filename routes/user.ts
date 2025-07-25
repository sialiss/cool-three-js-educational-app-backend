import { Router } from "../deps.ts"
import * as userController from "../controllers/userController.ts"

const router = new Router()

router
	.get("/user", userController.fetchUsers)
	.get("/user/:id", userController.getById)
	.post("/user/create", userController.create)
	.delete("/user/:id", userController.remove)
	.put("/user/:id", userController.update)
	.post("/user/login", userController.login)
	.post("/user/getrole", userController.getRole)
	.get("/me", userController.getMe)

export default router

import { PrismaClient } from "../deps.ts"

export const prisma = new PrismaClient({
	datasources: {
		db: {
			url: Deno.env.get("DATABASE_URL"),
		},
	},
})

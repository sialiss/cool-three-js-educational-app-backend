```
fetch("http://localhost:8000/user", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    name: "Администратор",
    login: "admin",
    password: "password",
  }),
});
```

deno add --allow-scripts npm:prisma npm:@prisma/client
deno run -A npm:prisma init --datasource-provider postgresql --generator-provider prisma-client --with-model
deno run -A --env-file npm:prisma generate

deno run -A --env-file npm:prisma migrate dev --name init


model Token {
  token       String  @id 
  user        User?   @relation(fields: [userId], references: [id])
  userId      Int
}
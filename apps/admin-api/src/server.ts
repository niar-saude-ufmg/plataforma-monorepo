import { app } from "./app.js";

const port = Number(process.env.ADMIN_API_PORT ?? process.env.PORT ?? 3333);

app.listen(port, () => {
  console.log(`[admin-api] listening on http://localhost:${port}`);
});

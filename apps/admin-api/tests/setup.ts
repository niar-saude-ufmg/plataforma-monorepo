import { prisma } from "@niar/database";
import { execSync } from "child_process";

beforeAll(() => {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error("DATABASE_URL não definida. Verifique .env.test");
  }
  execSync(
    `pnpm --filter @niar/database exec prisma db push --force-reset`,
    {
      stdio: "inherit",
      env: { ...process.env, DATABASE_URL: dbUrl }
    }
  );
});

afterAll(async () => {
  await prisma.$disconnect();
});

beforeEach(async () => {
  await prisma.user.deleteMany();
});

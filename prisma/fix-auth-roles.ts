import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.user.updateMany({
    where: {
      customRole: {
        in: [Role.MANAGING_DIRECTOR, Role.HEAD_OF_PLANNING],
      },
    },
    data: {
      role: "admin",
    },
  });

  console.log(`Updated ${result.count} users to admin role`);
}

main()
  .catch((error) => {
    console.error("Error while fixing auth roles", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });



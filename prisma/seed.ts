/* eslint-disable @typescript-eslint/no-floating-promises */
import { seedNewUser } from "@/server/auth/actions/user.actions";
import { Role } from "@prisma/client";

const seedUsers: {
  customRole: Role;
  name: string;
  email: string;
  password: string;
}[] = [
  {
    customRole: Role.MANAGING_DIRECTOR,
    name: "Aditya",
    email: "aditya@uniglaze.in",
    password: "aditya@123",
  },
  {
    customRole: Role.HEAD_OF_PLANNING,
    name: "Vamsi",
    email: "vamsi@uniglaze.in",
    password: "vamsi@123",
  },
  {
    customRole: Role.PROJECT_MANAGER,
    name: "Mani",
    email: "mani@uniglaze.in",
    password: "mani@123",
  },
];

const registerAll = async () => {
  const results = await Promise.all(
    seedUsers.map((user) =>
      seedNewUser(user.email, user.password, user.name, user.customRole),
    ),
  );
  results.forEach((res, idx) => {
    if (!res) {
      console.log(
        "############################################################",
      );
      console.log("USER REGISTRATION FAILED:", seedUsers[idx]!.email);
      console.log(
        "############################################################",
      );
    }
  });
};

registerAll();

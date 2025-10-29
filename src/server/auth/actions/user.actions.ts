"use server";

import { APP_PATHS } from "@/config/path.config";
import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { betterAuth } from "..";
import { db } from "../../db";
import { headers } from "next/headers";

export const signIn = async (email: string, password: string) => {
  try {
    await betterAuth.api.signInEmail({
      body: {
        email,
        password,
        callbackURL: APP_PATHS.CALLBACK,
        rememberMe: true,
      },
    });

    return {
      success: true,
      message: "Signed in successfully.",
    };
  } catch (error) {
    const e = error as Error;

    return {
      success: false,
      message: e.message || "An unknown error occurred.",
    };
  }
};

export const signOut = async () => {
  try {
    await betterAuth.api.signOut({
      headers: {
        "Content-Type": "application/json",
      },
    });
    return {
      success: true,
      message: "Signed out successfully.",
    };
  } catch (error) {
    const e = error as Error;
    return {
      success: false,
      message: e.message || "An unknown error occurred.",
    };
  }
};

export const deleteUser = async (userId: string) => {
  try {
    const deletedUser = await db.user.delete({ where: { id: userId } });
    revalidatePath(APP_PATHS.TEAM_MANAGEMENT);
    return {
      success: true,
      message: "deleted user successfully",
      data: deletedUser,
    };
  } catch (error) {
    const e = error as Error;
    console.error(error);
    return {
      success: false,
      message: e.message || "Internal server problem",
      data: [],
    };
  }
};

export const getUsers = async () => {
  try {
    const users = await db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        customRole: true,
      },
    });
    return {
      success: true,
      message: "All users fetched successfully",
      data: users,
    };
  } catch (error) {
    const e = error as Error;
    console.error(error);
    return {
      success: false,
      message: e.message || "Internal server problem",
      data: [],
    };
  }
};

export const updateUserMetadata = async (
  userId: string,
  userData: {
    name: string;
    email: string;
    customRole: Role;
    password: string;
  },
) => {
  try {
    // HANDLE ROLE UPDATION
    const role =
      userData.customRole === Role.MANAGING_DIRECTOR ||
      userData.customRole === Role.HEAD_OF_PLANNING
        ? "admin"
        : "user";
    // Get teh user email basis
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");
    if (role !== user.role) {
      await betterAuth.api.setRole({
        body: { userId: user.id, role: role },
        headers: await headers(),
      });
    }

    // HANDLE PASSWORD UPDATION
    const passwordData = await betterAuth.api.setUserPassword({
      body: { newPassword: userData.password, userId: user.id },
      headers: await headers(),
    });
    if (!passwordData.status) throw new Error("Password update failed");

    // HANDLE REMAINING FIELDS UPDATION
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        customRole: userData.customRole,
        name: userData.name,
        email: userData.email,
      },
    });

    revalidatePath(APP_PATHS.TEAM_MANAGEMENT);

    return {
      success: true,
      message: "User metadata updated successfully",
      data: updatedUser,
    };
  } catch (error) {
    console.error("Error updating user:", error);
    return {
      success: false,
      message: (error as Error).message || "Failed to update user",
      data: null,
    };
  }
};

export const seedNewUser = async (
  email: string,
  password: string,
  name: string,
  customRole: Role,
) => {
  try {
    const extractedUser = await db.user.findFirst({ where: { email } });
    if (!extractedUser) {
      await betterAuth.api.signUpEmail({
        body: { email, name, password, customRole },
      });
    }
    return true;
  } catch (error) {
    console.error(`Error registering user ${email}:`, error);
    return false;
  }
};

export const createNewUser = async (
  email: string,
  password: string,
  username: string,
  customRole: Role,
) => {
  try {
    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) throw new Error("User already exists");

    // HANDLE ROLE CREATION
    const role =
      customRole === Role.MANAGING_DIRECTOR ||
      customRole === Role.HEAD_OF_PLANNING
        ? "admin"
        : "user";
    const user = await betterAuth.api.createUser({
      body: {
        email,
        password,
        name: username,
        role,
        data: { customRole },
      },
    });
    if (role !== "user") {
      await betterAuth.api.setRole({
        body: { userId: user.user.id, role: role },
        headers: await headers(),
      });
    }
    revalidatePath(APP_PATHS.TEAM_MANAGEMENT);

    return {
      success: true,
      message: "New User Onboarding successfull.",
    };
  } catch (error) {
    const e = error as Error;

    return {
      success: false,
      message: e.message || "An unknown error occurred.",
    };
  }
};

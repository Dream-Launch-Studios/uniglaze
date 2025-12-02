// src/app/api/admin/fix-auth-roles/route.ts
import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { db } from "@/server/db"; // you already have this

export async function POST(req: Request) {
  // ultra‑simple guard: require a secret header so randoms can't hit it
  const authHeader = req.headers.get("x-fix-secret");
  if (authHeader !== process.env.FIX_AUTH_ROLES_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await db.user.updateMany({
      where: {
        customRole: {
          in: [Role.MANAGING_DIRECTOR, Role.HEAD_OF_PLANNING],
        },
      },
      data: {
        role: "admin",
      },
    });

    return NextResponse.json({
      ok: true,
      updated: result.count,
    });
  } catch (error) {
    console.error("Error while fixing auth roles", error);
    return NextResponse.json(
      { ok: false, error: (error as Error).message },
      { status: 500 },
    );
  }
}
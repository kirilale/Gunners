import { NextRequest, NextResponse } from "next/server";
import { requireAuth, deleteSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    // Soft delete: Set deletedAt timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: {
        deletedAt: new Date(),
        email: `deleted_${user.id}@deleted.local`, // Anonymize email
        username: `deleted_${user.id}`, // Anonymize username
      },
    });

    // Delete all user sessions
    await prisma.session.deleteMany({
      where: { userId: user.id },
    });

    // Delete session cookie
    await deleteSession();

    return NextResponse.json({
      success: true,
      message: "Account deleted successfully"
    });
  } catch (error) {
    console.error("Delete account error:", error);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}

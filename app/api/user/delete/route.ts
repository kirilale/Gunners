import { NextRequest, NextResponse } from "next/server";
import { requireAuth, deleteSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

/**
 * Soft delete account with 24-hour recovery window
 * PRD: User can still log in for 24 hours to recover account
 * After 24 hours, account is permanently deleted via cron job
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    // Check if already soft-deleted
    const existingUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { deletedAt: true },
    });

    if (existingUser?.deletedAt) {
      return NextResponse.json(
        { error: "Account is already scheduled for deletion" },
        { status: 400 }
      );
    }

    // Soft delete: Set deletedAt timestamp only
    // DO NOT anonymize data yet - user needs 24 hours to recover
    await prisma.user.update({
      where: { id: user.id },
      data: {
        deletedAt: new Date(),
      },
    });

    // Delete all user sessions to log them out
    await prisma.session.deleteMany({
      where: { userId: user.id },
    });

    // Delete session cookie
    await deleteSession();

    return NextResponse.json({
      success: true,
      message: "Account deletion scheduled. You have 24 hours to recover your account.",
      deletionScheduledAt: new Date().toISOString(),
      permanentDeletionAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });
  } catch (error) {
    console.error("Delete account error:", error);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}

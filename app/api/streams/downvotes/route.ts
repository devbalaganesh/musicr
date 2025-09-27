import { prismaClient } from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const downvoteSchema = z.object({
  streamID: z.string(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.email) return NextResponse.json({ message: "Unauthorized" }, { status: 403 });

  const user = await prismaClient.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 403 });

  const data = downvoteSchema.parse(await req.json());

  try {
    await prismaClient.upvote.deleteMany({
      where: { userId: user.id, streamId: data.streamID },
    });
  } catch (e) {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }

  return NextResponse.json({ message: "Downvoted" });
}

import { prismaClient } from "@/app/lib/db";
import { getServerSession } from "next-auth";
import  { NextRequest,NextResponse} from "next/server";
import {z} from "zod"

const upvoteSchema=z.object({
    streamID:z.string()
})
export async function POST(req: NextRequest) {
  const session = await getServerSession();

  const user = await prismaClient.user.findFirst({
    where: { email: session?.user?.email ?? "" }
  });

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  try {
    const data = upvoteSchema.parse(await req.json());

    // Check stream exists
    const streamExists = await prismaClient.stream.findUnique({
      where: { id: data.streamID }
    });

    if (!streamExists) {
      return NextResponse.json({ message: "Stream not found" }, { status: 404 });
    }

    // Upsert upvote
   await prismaClient.upvote.upsert({
  where: {
    userId_streamId: {
      userId: user.id,
      streamId: data.streamID,
    }
  },
  update: {},
  create: {
    userId: user.id,
    streamId: data.streamID,
  },
});

    return NextResponse.json({ message: "Done!" });
  } catch (e) {
    console.error("Upvote error:", e);
    return NextResponse.json({ message: "Error While Upvoting" }, { status: 403 });
  }
}
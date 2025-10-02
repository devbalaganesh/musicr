import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prismaClient } from "../../lib/db";

const YT_REGEX =
  /^(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/))([a-zA-Z0-9_-]{11})(?:\S+)?$/;

const CreateStreamsSchema = z.object({
  creatorId: z.string(),
  url: z.string(),
});

async function fetchVideoDetails(videoId: string) {
  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
    );

    if (!res.ok) {
      throw new Error(`Failed to fetch video details: ${res.statusText}`);
    }

    const data = await res.json();

    // Thumbnails are not in oEmbed, but we can construct them manually
    // Standard YouTube thumbnail URLs
    const smallImg = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`; // medium quality
    const bigImg = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`; // high quality

    return {
      title: data.title ?? "Untitled",
      smallImg,
      bigImg,
    };
  } catch (err) {
    console.error("Failed to fetch YouTube details manually:", err);
    return {
      title: "Untitled",
      smallImg: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
      bigImg: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    };
  }
}

export async function POST(req: NextRequest) {
  try {
    const rawData = await req.json();
    console.log("Received POST body:", rawData);

    const data = CreateStreamsSchema.parse(rawData);

    const match = data.url.match(YT_REGEX);
    if (!match) {
      return NextResponse.json(
        { message: "Invalid YouTube URL" },
        { status: 400 }
      );
    }
    const extractedId = match[1];

    const videoDetails = await fetchVideoDetails(extractedId);

    await prismaClient.stream.create({
      data: {
        userId: data.creatorId,
        url: data.url,
        extractedId,
        type: "Youtube",
        title: videoDetails.title,
        smallImg: videoDetails.smallImg,
        bigImg: videoDetails.bigImg,
      },
    });

    const allStreams = await prismaClient.stream.findMany({
      where: { userId: data.creatorId },
    });

    return NextResponse.json(allStreams);
  } catch (err) {
    console.error("Stream creation error:", err);
    return NextResponse.json(
      {
        message: "Error while adding a stream",
        error: err instanceof Error ? err.message : err,
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const creatorId = url.searchParams.get("creatorId");

    if (!creatorId) {
      return NextResponse.json(
        { message: "creatorId is required" },
        { status: 400 }
      );
    }

    const streams = await prismaClient.stream.findMany({
      where: { userId: creatorId },
    });

    return NextResponse.json(streams);
  } catch (err) {
    console.error("Stream fetch error:", err);
    return NextResponse.json(
      {
        message: "Error fetching streams",
        error: err instanceof Error ? err.message : err,
      },
      { status: 500 }
    );
  }
}

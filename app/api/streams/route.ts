import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prismaClient } from "../../lib/db";
import youtubesearchapi from "youtube-search-api";

const YT_REGEX =
  /^(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/))([a-zA-Z0-9_-]{11})(?:\S+)?$/;

const CreateStreamsSchema = z.object({
  creatorId: z.string(),
  url: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const rawData = await req.json();
    console.log("Received POST body:", rawData);

    const data = CreateStreamsSchema.parse(rawData);

    const match = data.url.match(YT_REGEX);
    if (!match) {
      return NextResponse.json({ message: "Invalid YouTube URL" }, { status: 400 });
    }
    const extractedId = match[1];

    let videoDetails;
    try {
      videoDetails = await youtubesearchapi.GetVideoDetails(extractedId);
    } catch (err) {
      console.error("YouTube API failed:", err);
      return NextResponse.json(
        { message: "Failed to fetch video details", error: err instanceof Error ? err.message : err },
        { status: 500 }
      );
    }

    const thumbnails = videoDetails.thumbnail?.thumbnails ?? [];
    thumbnails.sort((a: { width: number }, b: { width: number }) => a.width - b.width);

    const smallImg =
      thumbnails.length > 1
        ? thumbnails[thumbnails.length - 2]?.url ?? ""
        : thumbnails[0]?.url ?? "";
    const bigImg = thumbnails[thumbnails.length - 1]?.url ?? "";

    await prismaClient.stream.create({
      data: {
        userId: data.creatorId,
        url: data.url,
        extractedId,
        type: "Youtube",
        title: videoDetails.title ?? "Untitled",
        smallImg,
        bigImg,
      },
    });

    const allStreams = await prismaClient.stream.findMany({
      where: { userId: data.creatorId },
    });

    return NextResponse.json(allStreams);
  } catch (err) {
    console.error("Stream creation error:", err);
    return NextResponse.json(
      { message: "Error while adding a stream", error: err instanceof Error ? err.message : err },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const creatorId = url.searchParams.get("creatorId");

    if (!creatorId) {
      return NextResponse.json({ message: "creatorId is required" }, { status: 400 });
    }

    const streams = await prismaClient.stream.findMany({
      where: { userId: creatorId },
    });

    return NextResponse.json(streams);
  } catch (err) {
    console.error("Stream fetch error:", err);
    return NextResponse.json(
      { message: "Error fetching streams", error: err instanceof Error ? err.message : err },
      { status: 500 }
    );
  }
}

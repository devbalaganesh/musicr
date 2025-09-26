import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prismaClient } from "../../lib/db";
import youtubesearchapi from "youtube-search-api"

  const YT_REGEX = /^(?:(?:https?:)?\/\/)?(?:www\.)?(?:m\.)?(?:youtu(?:be)?\.com\/(?:v\/|embed\/|watch(?:\/|\?v=))|youtu\.be\/)((?:\w|-){11})(?:\S+)?$/;

const CreateStreamsSchema = z.object({
  createrId: z.string(),
  url: z.string(), 
});

export async function POST(req: NextRequest) {
  try {
    const data = CreateStreamsSchema.parse(await req.json());

    const match = data.url.match(YT_REGEX);
    if (!match) {
      return NextResponse.json(
        { message: "Wrong URL" },
        { status: 411 }
      );
    }

    const extractedId = match[1]; 
    const res = await  youtubesearchapi.GetVideoDetails(extractedId);
    console.log(res.title);
    console.log(res.thumbnail.thumbnails);
    const thumbnails=res.thumbnail.thumbnails;
    thumbnails.sort((a:{width:number},b:{width:number})=>a.width<b.width?-1:1
  )

    const stream = await prismaClient.stream.create({
      data: {
        userId: data.createrId,
        url: data.url,
        extractedId,
        type: "Youtube",
        title:res.title ?? "can't find title",
        smallImg:thumbnails.length>1? thumbnails[thumbnails.length-2].url :thumbnails [thumbnails.length-1] ?? "can't find thumbnail",
        bigImg:thumbnails[thumbnails.length-1].url ?? " Can't find the thumbnail"
      },
    });

    return NextResponse.json({
      message: "Stream created successfully",
      id: stream.id,
    });
  } catch (e) {
    console.error("Stream creation error:", e); 
    return NextResponse.json(
      { message: "Error while adding a stream", error: e },
      { status: 500 }
    );
  }
}   

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const createrId = url.searchParams.get("createrId");

    if (!createrId) {
      return NextResponse.json(
        { message: "createrId is required" },
        { status: 400 }
      );
    }

    const streams = await prismaClient.stream.findMany({
      where: { userId: createrId },
    });

    return NextResponse.json(streams);
  } catch (e) {
    console.error("Stream fetch error:", e);
    return NextResponse.json(
      { message: "Error fetching streams", error: e },
      { status: 500 }
    );
  }
}
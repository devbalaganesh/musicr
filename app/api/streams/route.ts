import  { NextRequest,NextResponse} from "next/server"
import {z} from "zod"
import { prismaClient } from "../../lib/db";
import { useSearchParams } from 'next/navigation'
const YT_REGEX = new RegExp("^(?:https?:\\/\\/)?(?:www\\.)?(?:youtu\\.be\\/|youtube\\.com\\/(?:watch\\?v=|(?:v|embed|vi)\\/))([a-zA-Z0-9_-]{11})(?:\\S*)$");

const [searchParams] = useSearchParams();

const CreateStreamsSchema=z.object({
    createrId:z.string(),
    url:z.string() // youtube inside or spotify
})
export  async function POST (req:NextRequest){
    try{
    const data = CreateStreamsSchema.parse(await req.json());
        const isyt= YT_REGEX.test(data.url);
        if(!isyt){
            return NextResponse.json({
                message:"Wrong  URL"
            },
        {
            status:411
        })
        }
        const extractedId = data.url.split("?v=")[1];

    await prismaClient.stream.create({
        data:{
            userId : data.createrId,
               url:data.url,
               extractedId,
               type:"Youtube"

        }
               
               
    })
    }
    catch(e){
        return NextResponse.json({
            message:"Error while adding a streeram"
        },{
            status:411
        })
    }

} 
 export async function GET(req:NextResponse){
      const url = request.nextUrl;
  const createrId = url.searchParams.get('creatorId')

   

}
"use client";
import {signIn,useSession,signOut } from "next-auth/react"
export function Appbar(){
    const session = useSession();

 return <div className="flex-justify-between">
     <div>

        saas
     </div>
     <div className="m-2 p-2bg-blue-400">
        {session.data?.user && <button onClick={()=>signOut()}>Logout</button>}
         {!session.data?.user && <button onClick={()=>signIn()}>signIn</button>}

     </div>
 </div>
}
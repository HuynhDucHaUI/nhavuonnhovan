import { env } from "cloudflare:workers";
export async function GET(_request: Request, {params}:{params:Promise<{key:string}>}) {
  const {key}=await params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(key)) return new Response(null,{status:404});
  const object=await env.BUCKET?.get(key);
  if(!object)return new Response(null,{status:404});
  const headers=new Headers();
  object.writeHttpMetadata(headers);
  headers.set("X-Content-Type-Options","nosniff");
  headers.set("ETag",object.httpEtag);
  return new Response(object.body,{headers});
}

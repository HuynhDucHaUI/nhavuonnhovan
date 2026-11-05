import { env } from "cloudflare:workers";
import { isAdmin } from "@/app/admin/auth";

const maxBytes = 5 * 1024 * 1024;
function imageType(bytes: Uint8Array): string | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes.length >= 8 && [0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a].every((v,i)=>bytes[i]===v)) return "image/png";
  if (bytes.length >= 12 && String.fromCharCode(...bytes.slice(0,4)) === "RIFF" && String.fromCharCode(...bytes.slice(8,12)) === "WEBP") return "image/webp";
  return null;
}

export async function POST(request: Request) {
  if (!(await isAdmin())) return Response.json({ error: "Bạn không có quyền tải ảnh." }, { status: 403 });
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin) return Response.json({error:"Yêu cầu không hợp lệ."}, {status:403});
  if (Number(request.headers.get("content-length") || 0) > maxBytes + 65536) return Response.json({error:"Ảnh phải nhỏ hơn 5 MB."},{status:413});
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File) || !file.size || file.size > maxBytes) return Response.json({error:"Chọn ảnh có dung lượng tối đa 5 MB."},{status:400});
    const buffer = await file.arrayBuffer();
    const type = imageType(new Uint8Array(buffer));
    if (!type || file.type !== type) return Response.json({error:"Chỉ hỗ trợ ảnh JPEG, PNG hoặc WebP hợp lệ."},{status:400});
    const bucket = env.BUCKET;
    if (!bucket) throw new Error("Missing image storage");
    const key = crypto.randomUUID();
    await bucket.put(key, buffer, { httpMetadata: { contentType:type, cacheControl:"public, max-age=31536000, immutable" } });
    return Response.json({ url:"/api/images/"+key });
  } catch {
    return Response.json({error:"Không thể tải ảnh lên. Vui lòng thử lại."},{status:500});
  }
}

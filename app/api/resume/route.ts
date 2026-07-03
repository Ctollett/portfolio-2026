import { readFileSync } from "fs";
import { join } from "path";

export async function GET() {
  const file = readFileSync(join(process.cwd(), "public", "ColtonTollett-Resume.pdf"));
  return new Response(file, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="ColtonTollett-Resume.pdf"',
    },
  });
}

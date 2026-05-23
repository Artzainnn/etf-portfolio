import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { listPortfolios, createPortfolio } from "@/lib/data/portfolios";

export async function GET() {
  const portfolios = await listPortfolios();
  return NextResponse.json({ portfolios });
}

const CreateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const parsed = CreateSchema.safeParse(body);
  const name = parsed.success ? parsed.data.name : undefined;
  const id = await createPortfolio(name);
  return NextResponse.json({ id }, { status: 201 });
}

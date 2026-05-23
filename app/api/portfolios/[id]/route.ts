import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  deletePortfolio,
  getPortfolio,
  updatePortfolio,
} from "@/lib/data/portfolios";

function parseId(idStr: string): number | null {
  const n = parseInt(idStr, 10);
  return isFinite(n) && n > 0 ? n : null;
}

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id: idStr } = await ctx.params;
  const id = parseId(idStr);
  if (id == null) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const portfolio = await getPortfolio(id);
  if (!portfolio) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ portfolio });
}

const UpdateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().nullable().optional(),
  initialInvestment: z.number().min(0).optional(),
  monthlyContribution: z.number().min(0).optional(),
  durationYears: z.number().int().min(1).max(60).optional(),
  reinvestDividends: z.boolean().optional(),
  inflationRate: z.number().min(0).max(0.2).optional(),
  allocations: z
    .array(
      z.object({
        etfId: z.number().int().positive(),
        percentage: z.number().min(0).max(100),
        notes: z.string().nullable().optional(),
      }),
    )
    .optional(),
});

export async function PUT(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id: idStr } = await ctx.params;
  const id = parseId(idStr);
  if (id == null) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const body = await request.json().catch(() => null);
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const existing = await getPortfolio(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await updatePortfolio(id, parsed.data);
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id: idStr } = await ctx.params;
  const id = parseId(idStr);
  if (id == null) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  await deletePortfolio(id);
  return NextResponse.json({ ok: true });
}

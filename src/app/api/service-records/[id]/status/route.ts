import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { z } from "zod";

const statusTransitionSchema = z.object({
  status: z.enum([
    "KAYIT_ACILDI",
    "TAMIRATTA",
    "FIYAT_TEKLIFI_VERILDI",
    "MUSTERI_REDDETTI",
    "HAZIR",
    "ODEME_BEKLIYOR",
    "TESLIM_EDILDI",
    "IPTAL_EDILDI",
  ]),
});

const validTransitions: Record<string, string[]> = {
  KAYIT_ACILDI: ["TAMIRATTA", "IPTAL_EDILDI"],
  TAMIRATTA: ["FIYAT_TEKLIFI_VERILDI", "IPTAL_EDILDI"],
  FIYAT_TEKLIFI_VERILDI: ["HAZIR", "MUSTERI_REDDETTI"],
  HAZIR: ["TESLIM_EDILDI", "ODEME_BEKLIYOR"],
  ODEME_BEKLIYOR: ["TESLIM_EDILDI"],
  MUSTERI_REDDETTI: [],
  IPTAL_EDILDI: [],
  TESLIM_EDILDI: [],
};

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ message: "Oturum bulunamadı" }, { status: 401 });
  }

  const { id } = await params;
  const record = await prisma.serviceRecord.findFirst({
    where: { id, companyId: session.companyId },
  });

  if (!record) {
    return NextResponse.json({ message: "Servis kaydı bulunamadı" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const { status: newStatus } = statusTransitionSchema.parse(body);

    const allowed = validTransitions[record.status];
    if (!allowed || !allowed.includes(newStatus)) {
      return NextResponse.json(
        { message: `"${record.status}" durumundan "${newStatus}" durumuna geçilemez` },
        { status: 400 }
      );
    }

    const [statusHistory] = await Promise.all([
      prisma.serviceStatusHistory.create({
        data: {
          serviceRecordId: id,
          fromStatus: record.status,
          toStatus: newStatus,
          changedById: session.userId,
        },
        include: {
          changedBy: { select: { id: true, name: true, surname: true } },
        },
      }),
      prisma.serviceRecord.update({
        where: { id },
        data: { status: newStatus },
      }),
    ]);

    return NextResponse.json({ statusHistory }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Geçersiz durum", errors: error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    console.error("[service-records status POST]", error);
    return NextResponse.json({ message: "Bir hata oluştu" }, { status: 500 });
  }
}

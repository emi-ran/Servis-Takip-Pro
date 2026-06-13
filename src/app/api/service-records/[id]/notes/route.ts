import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { z } from "zod";

const createNoteSchema = z.object({
  content: z.string().min(1, "Not içeriği zorunlu"),
  isCustomerVisible: z.boolean().default(false),
});

async function getRecordOrNull(id: string, companyId: string) {
  return prisma.serviceRecord.findFirst({
    where: { id, companyId },
  });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ message: "Oturum bulunamadı" }, { status: 401 });
  }

  const { id } = await params;
  const record = await getRecordOrNull(id, session.companyId);
  if (!record) {
    return NextResponse.json({ message: "Servis kaydı bulunamadı" }, { status: 404 });
  }

  const notes = await prisma.serviceNote.findMany({
    where: { serviceRecordId: id },
    orderBy: { createdAt: "desc" },
    include: { author: { select: { id: true, name: true, surname: true } } },
  });

  return NextResponse.json({ notes });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ message: "Oturum bulunamadı" }, { status: 401 });
  }

  const { id } = await params;
  const record = await getRecordOrNull(id, session.companyId);
  if (!record) {
    return NextResponse.json({ message: "Servis kaydı bulunamadı" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const data = createNoteSchema.parse(body);

    const note = await prisma.serviceNote.create({
      data: {
        serviceRecordId: id,
        content: data.content,
        isCustomerVisible: data.isCustomerVisible,
        authorId: session.userId,
      },
      include: { author: { select: { id: true, name: true, surname: true } } },
    });

    return NextResponse.json({ note }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Geçersiz veri", errors: error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    console.error("[service-records notes POST]", error);
    return NextResponse.json({ message: "Bir hata oluştu" }, { status: 500 });
  }
}

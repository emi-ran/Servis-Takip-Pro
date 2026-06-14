import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { z } from "zod";

const updateNoteSchema = z.object({
  content: z.string().min(1, "Not içeriği zorunlu"),
  isCustomerVisible: z.boolean().default(false),
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; noteId: string }> }
) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ message: "Oturum bulunamadı" }, { status: 401 });
  }

  const { id: serviceRecordId, noteId } = await params;

  // Check company isolation through service record
  const record = await prisma.serviceRecord.findFirst({
    where: { id: serviceRecordId, companyId: session.companyId },
  });

  if (!record) {
    return NextResponse.json({ message: "Servis kaydı bulunamadı" }, { status: 404 });
  }

  const note = await prisma.serviceNote.findUnique({
    where: { id: noteId },
  });

  if (!note || note.serviceRecordId !== serviceRecordId) {
    return NextResponse.json({ message: "Not bulunamadı" }, { status: 404 });
  }

  // Auth check: Author or ADMIN
  if (note.authorId !== session.userId && session.role !== "ADMIN") {
    return NextResponse.json({ message: "Bu işlem için yetkiniz yok" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const data = updateNoteSchema.parse(body);

    const updatedNote = await prisma.serviceNote.update({
      where: { id: noteId },
      data: {
        content: data.content,
        isCustomerVisible: data.isCustomerVisible,
      },
      include: { author: { select: { id: true, name: true, surname: true } } },
    });

    return NextResponse.json({ note: updatedNote });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Geçersiz veri", errors: error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    console.error("[service-records notes PUT]", error);
    return NextResponse.json({ message: "Bir hata oluştu" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; noteId: string }> }
) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ message: "Oturum bulunamadı" }, { status: 401 });
  }

  const { id: serviceRecordId, noteId } = await params;

  // Check company isolation
  const record = await prisma.serviceRecord.findFirst({
    where: { id: serviceRecordId, companyId: session.companyId },
  });

  if (!record) {
    return NextResponse.json({ message: "Servis kaydı bulunamadı" }, { status: 404 });
  }

  const note = await prisma.serviceNote.findUnique({
    where: { id: noteId },
  });

  if (!note || note.serviceRecordId !== serviceRecordId) {
    return NextResponse.json({ message: "Not bulunamadı" }, { status: 404 });
  }

  // Auth check: Author or ADMIN
  if (note.authorId !== session.userId && session.role !== "ADMIN") {
    return NextResponse.json({ message: "Bu işlem için yetkiniz yok" }, { status: 403 });
  }

  await prisma.serviceNote.delete({
    where: { id: noteId },
  });

  return NextResponse.json({ ok: true });
}

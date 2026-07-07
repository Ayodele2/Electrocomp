import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendProjectQuoted } from "@/lib/email";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const userId = (session.user as any).id;
  const isAdmin = ["ADMIN", "ENGINEER"].includes((session.user as any).role);

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, name: true, email: true, image: true, role: true } },
      milestones: { orderBy: { order: "asc" } },
      messages: {
        include: { sender: { select: { id: true, name: true, image: true, role: true } } },
        orderBy: { createdAt: "asc" },
      },
      files: true,
    },
  });

  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!isAdmin && project.clientId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  return NextResponse.json({ data: project });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isAdmin = ["ADMIN", "ENGINEER"].includes((session.user as any).role);
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();

  // Get current project to detect status change to QUOTED
  const current = await prisma.project.findUnique({
    where: { id },
    include: { client: { select: { email: true, name: true } } },
  });

  const project = await prisma.project.update({
    where: { id },
    data: {
      ...(body.status && { status: body.status }),
      ...(body.quote !== undefined && { quote: body.quote }),
      ...(body.adminNotes !== undefined && { adminNotes: body.adminNotes }),
      ...(body.depositPaid !== undefined && { depositPaid: body.depositPaid }),
      ...(body.balancePaid !== undefined && { balancePaid: body.balancePaid }),
    },
  });

  // Send email if status changed to QUOTED
  if (body.status === "QUOTED" && current?.status !== "QUOTED" && body.quote && current?.client.email) {
    sendProjectQuoted(current.client.email, project.title, Number(body.quote), id).catch(console.error);
  }

  return NextResponse.json({ data: project });
}

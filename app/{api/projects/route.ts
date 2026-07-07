import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendProjectSubmitted } from "@/lib/email";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const isAdmin = ["ADMIN", "ENGINEER"].includes((session.user as any).role);

  const projects = await prisma.project.findMany({
    where: isAdmin ? {} : { clientId: userId },
    include: {
      client: { select: { id: true, name: true, email: true, image: true } },
      milestones: { orderBy: { order: "asc" } },
      _count: { select: { messages: true, files: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ data: projects });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { title, description, requirements, budget, deadline } = await req.json();

    if (!title || !description || !requirements) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const project = await prisma.project.create({
      data: {
        title,
        description: `${description}\n\nRequirements:\n${requirements}`,
        budget: budget ?? null,
        deadline: deadline ? new Date(deadline) : null,
        clientId: (session.user as any).id,
      },
    });

    // Send confirmation email (non-blocking)
    if (session.user.email) {
      sendProjectSubmitted(session.user.email, title).catch(console.error);
    }

    return NextResponse.json({ data: project }, { status: 201 });
  } catch (err: any) {
    console.error("Project creation error:", err);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}

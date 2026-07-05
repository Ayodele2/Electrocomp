import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminProjectPanel } from "@/components/admin/AdminProjectPanel";

export const metadata = { title: "Review project" };

export default async function AdminProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const role = (session.user as any).role;
  if (role !== "ADMIN" && role !== "ENGINEER") redirect("/dashboard");

  const { id } = await params;
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

  if (!project) notFound();

  const serialized = {
    ...project,
    quote: project.quote ? Number(project.quote) : null,
    budget: project.budget ? Number(project.budget) : null,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
    deadline: project.deadline?.toISOString() ?? null,
    milestones: project.milestones.map(m => ({
      ...m,
      dueDate: m.dueDate?.toISOString() ?? null,
      completedAt: m.completedAt?.toISOString() ?? null,
    })),
    messages: project.messages.map(m => ({ ...m, createdAt: m.createdAt.toISOString() })),
    files: project.files.map(f => ({ ...f, uploadedAt: f.uploadedAt.toISOString() })),
  };

  return <AdminProjectPanel project={serialized as any} />;
}

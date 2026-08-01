import { redirect } from "next/navigation";
import { User, Palette, ShieldCheck } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ProfileForm } from "@/components/settings/profile-form";
import { AppearanceSettings } from "@/components/settings/appearance-settings";
import { ChangePasswordForm } from "@/components/settings/change-password-form";

export const metadata = { title: "Configurações" };

export default async function ConfiguracoesPage() {
  const session = await auth();
  console.log("🚀 ~ ConfiguracoesPage ~ session:", session)
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, image: true, currency: true, locale: true, timezone: true },
  });
  if (!user) redirect("/login");

  return (
    <div className="space-y-6">
      <PageHeader title="Configurações" description="Perfil, aparência e segurança da sua conta" />

      <Tabs defaultValue="perfil">
        <TabsList>
          <TabsTrigger value="perfil" className="gap-1.5">
            <User className="size-3.5" /> Perfil
          </TabsTrigger>
          <TabsTrigger value="aparencia" className="gap-1.5">
            <Palette className="size-3.5" /> Aparência
          </TabsTrigger>
          <TabsTrigger value="seguranca" className="gap-1.5">
            <ShieldCheck className="size-3.5" /> Segurança
          </TabsTrigger>
        </TabsList>

        <TabsContent value="perfil">
          <Card>
            <CardContent className="p-6">
              <ProfileForm
                defaultValues={{
                  name: user.name,
                  image: user.image ?? "",
                  currency: user.currency as "BRL" | "USD" | "EUR",
                  locale: user.locale as "pt-BR" | "en-US",
                  timezone: user.timezone,
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="aparencia">
          <Card>
            <CardContent className="p-6">
              <AppearanceSettings />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seguranca">
          <Card>
            <CardContent className="p-6">
              <ChangePasswordForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

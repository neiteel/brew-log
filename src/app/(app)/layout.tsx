import { BottomNav, DesktopNav } from "@/components/app-nav"
import { SiteHeader } from "@/components/site-header"
import { getDictionary } from "@/lib/i18n"
import { getSession } from "@/lib/session"

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await getSession()
  const authed = Boolean(session)
  const { nav } = await getDictionary()

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-375 flex-col px-3 md:px-5">
      <SiteHeader nav={<DesktopNav authed={authed} nav={nav} />} />
      <main className="flex-1 pt-14 pb-32 md:pt-24 md:pb-40">{children}</main>
      <BottomNav authed={authed} nav={nav} />
    </div>
  )
}

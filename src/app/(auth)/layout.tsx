import { SiteHeader } from "@/components/site-header"

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-375 flex-col px-3 md:px-5">
      <SiteHeader />
      <main className="flex-1 pt-14 pb-32 md:pt-24">
        <div className="max-w-sm">{children}</div>
      </main>
    </div>
  )
}

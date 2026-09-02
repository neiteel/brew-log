import Link from "next/link"

function SiteHeader({ nav }: { nav?: React.ReactNode }) {
  return (
    <header className="flex h-20 items-center justify-between">
      {/* Off the type scale on purpose: a wordmark is a logotype, sized to
          itself, not a step in the reading hierarchy. */}
      <Link href="/" className="text-2xl font-medium tracking-[-0.02em]">
        Brew.log
      </Link>
      {nav}
    </header>
  )
}

export { SiteHeader }

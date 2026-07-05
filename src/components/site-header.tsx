import Link from "next/link"

function SiteHeader({ nav }: { nav?: React.ReactNode }) {
  return (
    <header className="flex h-20 items-center justify-between">
      <Link href="/" className="text-2xl font-medium tracking-[-0.02em]">
        Brew.log
      </Link>
      {nav}
    </header>
  )
}

export { SiteHeader }

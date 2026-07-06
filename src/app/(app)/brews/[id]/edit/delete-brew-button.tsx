"use client"

import { deleteBrew } from "../../actions"

function DeleteBrewButton({
  brewId,
  label,
  confirm,
}: {
  brewId: string
  label: string
  confirm: string
}) {
  const action = deleteBrew.bind(null, brewId)

  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(confirm)) {
          event.preventDefault()
        }
      }}
    >
      <button
        type="submit"
        className="text-body text-destructive underline underline-offset-4 hover:opacity-70"
      >
        {label}
      </button>
    </form>
  )
}

export { DeleteBrewButton }

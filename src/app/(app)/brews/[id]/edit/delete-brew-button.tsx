"use client"

import { deleteBrew } from "../../actions"

function DeleteBrewButton({ brewId }: { brewId: string }) {
  const action = deleteBrew.bind(null, brewId)

  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm("Delete this brew?")) {
          event.preventDefault()
        }
      }}
    >
      <button
        type="submit"
        className="text-body text-destructive underline underline-offset-4 hover:opacity-70"
      >
        Delete brew
      </button>
    </form>
  )
}

export { DeleteBrewButton }

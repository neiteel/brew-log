"use client"

import { deleteBean } from "../../actions"

function DeleteBeanButton({ beanId }: { beanId: string }) {
  const action = deleteBean.bind(null, beanId)

  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm("Delete this bean and all of its brews?")) {
          event.preventDefault()
        }
      }}
    >
      <button
        type="submit"
        className="text-body text-destructive underline underline-offset-4 hover:opacity-70"
      >
        Delete bean
      </button>
    </form>
  )
}

export { DeleteBeanButton }

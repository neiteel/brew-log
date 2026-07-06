"use client"

import { deleteBean } from "../../actions"

function DeleteBeanButton({
  beanId,
  label,
  confirm,
}: {
  beanId: string
  label: string
  confirm: string
}) {
  const action = deleteBean.bind(null, beanId)

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

export { DeleteBeanButton }

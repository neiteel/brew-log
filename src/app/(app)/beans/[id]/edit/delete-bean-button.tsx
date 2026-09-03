"use client"

import { TextButton } from "@/components/text-button"

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
      {/* `hover:opacity-70` dropped Correction Red from 4.76:1 to ~2.9:1,
          against the system's own floor. TextButton already fades to
          Annotation Gray (4.88:1), which is what the Text Button role
          specifies; `font-normal` keeps a destructive action from being the
          most prominent thing on its page. */}
      <TextButton type="submit" className="text-destructive font-normal">
        {label}
      </TextButton>
    </form>
  )
}

export { DeleteBeanButton }

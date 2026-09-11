"use client"

import React from "react"
import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { CheckCircle2, AlertCircle, Loader2, Sparkles, Info } from "lucide-react"

function getToastIcon(
  variant?: string,
  title?: React.ReactNode,
  description?: React.ReactNode
) {
  const t = typeof title === "string" ? title.toLowerCase() : ""
  const d = typeof description === "string" ? description.toLowerCase() : ""

  if (
    variant === "destructive" ||
    t.includes("error") ||
    t.includes("fail") ||
    t.includes("invalid") ||
    t.includes("missing")
  ) {
    return <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
  }

  if (
    t.includes("generat") ||
    t.includes("load") ||
    t.includes("prepar") ||
    d.includes("generat") ||
    d.includes("prepar")
  ) {
    return <Loader2 className="h-5 w-5 text-[#E9C46A] animate-spin shrink-0 mt-0.5" />
  }

  if (
    variant === "success" ||
    t.includes("success") ||
    t.includes("downloaded") ||
    t.includes("saved") ||
    t.includes("complete") ||
    t.includes("copied") ||
    t.includes("added") ||
    t.includes("created")
  ) {
    return <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
  }

  return <Sparkles className="h-5 w-5 text-[#A78BFA] shrink-0 mt-0.5" />
}

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        const icon = getToastIcon(props.variant as string | undefined, title, description)

        return (
          <Toast key={id} {...props}>
            <div className="flex items-start gap-3 flex-1 min-w-0">
              {icon}
              <div className="grid gap-0.5 min-w-0">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}

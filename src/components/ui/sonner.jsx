"use client"

import { Toaster as Sonner } from "sonner"

const Toaster = ({
  ...props
}) => {
  return (
    (<Sonner
      position="top-center"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-slate-900/95 group-[.toaster]:backdrop-blur-2xl group-[.toaster]:text-slate-200 group-[.toaster]:border-white/10 group-[.toaster]:shadow-[0_8px_32px_rgba(0,0,0,0.5)] group-[.toaster]:rounded-2xl group-[.toaster]:font-sans group-[.toaster]:p-4",
          description: "group-[.toast]:text-slate-400 group-[.toast]:text-[13px] group-[.toast]:font-medium group-[.toast]:tracking-wide",
          title: "group-[.toast]:font-black group-[.toast]:italic group-[.toast]:tracking-tight group-[.toast]:text-base",
          icon: "group-[.toast]:w-5 group-[.toast]:h-5",
          actionButton:
            "group-[.toast]:bg-blue-600 group-[.toast]:text-white group-[.toast]:font-black group-[.toast]:italic group-[.toast]:uppercase group-[.toast]:rounded-xl",
          cancelButton:
            "group-[.toast]:bg-white/5 group-[.toast]:text-slate-400 group-[.toast]:font-black group-[.toast]:italic group-[.toast]:uppercase group-[.toast]:rounded-xl",
          success: "group-[.toast]:border-emerald-500/50 group-[.toast]:text-emerald-400 group-[.toast]:bg-emerald-500/5 [&&_svg]:text-emerald-400",
          error: "group-[.toast]:border-red-500/50 group-[.toast]:text-red-400 group-[.toast]:bg-red-500/5 [&&_svg]:text-red-400",
          info: "group-[.toast]:border-blue-500/50 group-[.toast]:text-blue-400 group-[.toast]:bg-blue-500/5 [&&_svg]:text-blue-400",
          warning: "group-[.toast]:border-amber-500/50 group-[.toast]:text-amber-400 group-[.toast]:bg-amber-500/5 [&&_svg]:text-amber-400",
        },
      }}
      {...props} />)
  );
}

export { Toaster }

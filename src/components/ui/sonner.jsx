"use client";

import { Toaster as Sonner } from "sonner";

const Toaster = ({ ...props }) => {
  return (
    <Sonner
      position="top-center"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-slate-950/95 group-[.toaster]:backdrop-blur-2xl group-[.toaster]:text-slate-200 group-[.toaster]:border-white/10 group-[.toaster]:shadow-[0_20px_50px_rgba(0,0,0,0.5)] group-[.toaster]:rounded-2xl group-[.toaster]:font-sans group-[.toaster]:p-5 group-[.toaster]:items-center",
          description:
            "group-[.toast]:text-slate-300 group-[.toast]:text-[13px] group-[.toast]:font-medium group-[.toast]:tracking-wide group-[.toast]:mt-1",
          title:
            "group-[.toast]:font-black group-[.toast]:italic group-[.toast]:tracking-tight group-[.toast]:text-base group-[.toast]:text-white",
          icon: "group-[.toast]:mr-4 group-[.toast]:scale-125",
          actionButton:
            "group-[.toast]:bg-blue-600 group-[.toast]:text-white group-[.toast]:font-black group-[.toast]:italic group-[.toast]:uppercase group-[.toast]:rounded-xl",
          cancelButton:
            "group-[.toast]:bg-white/5 group-[.toast]:text-slate-400 group-[.toast]:font-black group-[.toast]:italic group-[.toast]:uppercase group-[.toast]:rounded-xl",
          success:
            "group-[.toast]:border-emerald-500/30 group-[.toast]:bg-emerald-500/10 [&&_svg]:text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.1)]",
          error:
            "group-[.toast]:border-red-500/30 group-[.toast]:bg-red-500/10 [&&_svg]:text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.1)]",
          info: "group-[.toast]:border-blue-500/30 group-[.toast]:bg-blue-500/10 [&&_svg]:text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.1)]",
          warning:
            "group-[.toast]:border-amber-500/30 group-[.toast]:bg-amber-500/10 [&&_svg]:text-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.1)]",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };

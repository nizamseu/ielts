"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"


import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ThemeToggle() {
  const { setTheme } = useTheme()

  const handleSetTheme = (newTheme: string) => {
    // If the browser doesn't support View Transitions, just set the theme
    if (!('startViewTransition' in document)) {
      setTheme(newTheme)
      return
    }

    document.documentElement.classList.add('theme-transitioning')

    // Wrap the state set inside a View Transition
    const doc = document as Document & {
      startViewTransition: (cb: () => void) => { finished: Promise<void> };
    };
    
    const transition = doc.startViewTransition(() => {
      setTheme(newTheme)
    })

    transition.finished.finally(() => {
      document.documentElement.classList.remove('theme-transitioning')
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap outline-none transition-colors focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 focus-visible:outline-none hover:bg-accent hover:text-accent-foreground rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 h-10 w-10">
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-500" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-blue-400" />
        <span className="sr-only">Toggle theme</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl dark:bg-slate-900 p-1">
        <DropdownMenuItem onClick={() => handleSetTheme("light")} className="cursor-pointer rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 focus:bg-slate-50 dark:focus:bg-slate-800 gap-2 font-medium">
          <Sun className="h-4 w-4" /> Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSetTheme("dark")} className="cursor-pointer rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 focus:bg-slate-50 dark:focus:bg-slate-800 gap-2 font-medium mt-1">
          <Moon className="h-4 w-4" /> Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSetTheme("system")} className="cursor-pointer rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 focus:bg-slate-50 dark:focus:bg-slate-800 gap-2 font-medium mt-1">
          <span className="h-4 w-4 flex items-center justify-center font-bold">∀</span> System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

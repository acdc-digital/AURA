// THEME TOGGLE - Theme switcher component with moon/sun icons
// /Users/matthewsimon/Projects/AURA/AURA/components/theme-toggle.tsx

"use client"

import * as React from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Only render after hydration to avoid SSR mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button className="h-6 w-6 p-0 text-[#858585] bg-transparent">
        <span className="sr-only">Toggle theme</span>
        <Moon className="h-4 w-4" />
      </button>
    )
  }

  const cycleTheme = () => {
    if (theme === "light") {
      setTheme("dark")
    } else if (theme === "dark") {
      setTheme("system")
    } else {
      setTheme("light")
    }
  }

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    cycleTheme()
    // Remove focus immediately after click to return to dim state
    e.currentTarget.blur()
  }

  const getIcon = () => {
    if (theme === "light") {
      return <Sun className="h-4 w-4" />
    } else if (theme === "dark") {
      return <Moon className="h-4 w-4" />
    } else {
      return <Monitor className="h-4 w-4" />
    }
  }

  const getTooltip = () => {
    if (theme === "light") {
      return "Switch to dark mode"
    } else if (theme === "dark") {
      return "Switch to system theme"
    } else {
      return "Switch to light mode"
    }
  }

  return (
    <button
      onClick={handleClick}
      title={getTooltip()}
      className="h-6 w-6 p-0 text-[#858585] hover:text-white focus:outline-none bg-transparent hover:bg-transparent focus:bg-transparent active:bg-transparent transition-colors duration-150"
    >
      <span className="sr-only">Toggle theme</span>
      {getIcon()}
    </button>
  )
}

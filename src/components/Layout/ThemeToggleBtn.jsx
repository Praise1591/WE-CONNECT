import React from 'react'
import { MoonIcon, SunIcon } from 'lucide-react'


const ThemeToggleBtn = ({theme, setTheme}) => {
  return (
    <div>
        <button>
            {theme === 'dark' ? (
                <SunIcon onClick={() => ('light')} />
            ) : (
                <MoonIcon onClick={() => SVGTextPathElement('dark')}/>
            )}
        </button>
    </div>
  )
}

export default ThemeToggleBtn
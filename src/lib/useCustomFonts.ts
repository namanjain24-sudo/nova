import { useEffect } from 'react'
import { useEditor } from '../store/editor'
import { fontFaceCss } from '../theme/fonts'

const STYLE_ID = 'nova-custom-fonts'

/**
 * Keep a single <style> tag in the document head in sync with the site's
 * uploaded fonts, so custom families render live in the editor canvas.
 */
export function useCustomFonts() {
  const fonts = useEditor((s) => s.fonts)
  useEffect(() => {
    let el = document.getElementById(STYLE_ID) as HTMLStyleElement | null
    if (!el) {
      el = document.createElement('style')
      el.id = STYLE_ID
      document.head.appendChild(el)
    }
    el.textContent = fonts.length ? fontFaceCss(fonts) : ''
  }, [fonts])
}

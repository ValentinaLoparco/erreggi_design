import Alpine from 'alpinejs'

window.Alpine = Alpine
Alpine.start()

/* ------------------------------------------------------------
 * Scroll reveal — per-word brightness sincronizzata al scroll.
 * Avvolge ogni parola dei .scroll-reveal-text in uno <span>
 * e aggiorna --reveal (0..1) sul singolo elemento in base alla
 * posizione verticale rispetto al viewport.
 * ------------------------------------------------------------ */
function splitIntoWords(root) {
    let index = 0
    const walk = (node) => {
        if (node.nodeType === Node.TEXT_NODE) {
            const parts = node.textContent.split(/(\s+)/)
            const frag = document.createDocumentFragment()
            for (const part of parts) {
                if (part === '') continue
                if (/^\s+$/.test(part)) {
                    frag.appendChild(document.createTextNode(part))
                } else {
                    const span = document.createElement('span')
                    span.className = 'reveal-word'
                    span.dataset.index = String(index++)
                    span.textContent = part
                    frag.appendChild(span)
                }
            }
            node.parentNode.replaceChild(frag, node)
        } else if (node.nodeType === Node.ELEMENT_NODE && !node.classList.contains('reveal-word')) {
            for (const child of Array.from(node.childNodes)) walk(child)
        }
    }
    walk(root)
    return index // numero totale di parole
}

function initScrollReveal() {
    const targets = document.querySelectorAll('.scroll-reveal-text')
    if (!targets.length) return

    targets.forEach(splitIntoWords)
    const words = Array.from(document.querySelectorAll('.reveal-word'))
    if (!words.length) return

    // Finestra di reveal (frazioni di viewport): 0.65 → 0.55 = 10% di vh.
    // Stretta = ogni parola attraversa rapidamente la "linea attiva" e l'effetto
    // è discreto, parola-per-parola, invece che una sfumatura ampia.
    const START = 0.65
    const END = 0.55
    // Stagger orizzontale: shift in px aggiunto al top "logico" della parola
    // in funzione del suo indice nel paragrafo. Le parole della stessa riga
    // (stesso top fisico) si accendono in ordine di lettura sx → dx.
    const STAGGER_PX = 6

    let ticking = false
    const update = () => {
        const vh = window.innerHeight
        const startPx = START * vh
        const span = (START - END) * vh
        for (const w of words) {
            const i = +w.dataset.index || 0
            const top = w.getBoundingClientRect().top + i * STAGGER_PX
            const t = (startPx - top) / span
            const clamped = t < 0 ? 0 : t > 1 ? 1 : t
            w.style.setProperty('--reveal', clamped.toFixed(3))
        }
        ticking = false
    }
    const onScroll = () => {
        if (ticking) return
        ticking = true
        requestAnimationFrame(update)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    update()
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScrollReveal)
} else {
    initScrollReveal()
}

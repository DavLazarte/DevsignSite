# Devsign — contexto y tareas pendientes

Documento de retome. Refleja el estado real del proyecto al **17/11/2026** (Etapa A cerrada,
Etapa B en espera de dirección y textos aprobados). Si algo cambia, actualizá este archivo antes de cortar.

> Este archivo no se publica: `.htaccess` bloquea los `.md` (devuelve 403).

---

## 1. Objetivo

Rediseñar por completo el sitio de Devsign (agencia de software y marketing en Monteros, Tucumán)
para que **venda**, con estética moderna, y que se pueda subir por FTP a un hosting compartido de
DonWeb sin build, sin Node en producción.

Concepto creativo: **"El sistema detrás"**. Paleta del manual de marca, tipografía Poppins,
fotos tratadas en duotono azul, capturas de producto como prueba.

> Ojo: ese concepto es una **propuesta no aprobada**. Leer §1bis antes de escribir cualquier cosa.

---

## 1bis. Estado de la dirección (LEER PRIMERO)

El cliente **rechazó** el último intento. No volver a usarlo:

- H1 "Sistemas para lo que pasa en el mostrador." y su bajada.
- El ticket de cierre de caja como motivo visual ("se alejó del prompt inicial").
- Copy anterior: "Menos cuaderno, menos planilla, más operación resuelta." (negativo, cliché de IA).
- Glassmorphism, grid de fondo, degradé en el texto, eyebrow en mayúsculas + mono.

El cliente **ya pasó los textos definitivos del hero** (4 slides) y pidió que el encabezado sea un
slider. Están implementados en `index.html` (`data-hero`) y no se deben reescribir sin pedido explícito.

### Hero slider (17/11/2026)

- 4 diapositivas: Quiénes somos · Sistemas y POS · Automatización e IA · Marketing y diseño.
- Navegación por capítulos (rail vertical en desktop, barras horizontales en móvil), flechas,
  contador `01 / 04`, barra de progreso y botón de pausa.
- Autoplay de 7 s. Pausa al pasar el mouse, al tocar, con foco dentro del slider, con la pestaña
  oculta y con el botón. `prefers-reduced-motion` **no** desactiva el avance: solo hace instantáneo
  el cambio de slide (el progreso conserva su duración de 7 s vía override con `!important`).
- Accesible: `aria-roledescription`, `aria-label`, `aria-current`, `aria-controls`, flechas de teclado,
  foco visible. Sin JS queda visible la slide 1 (el resto se oculta con `.js`).
- Sin imágenes: cuando estén las capturas, se puede sumar una por slide, pero no es necesario.

**Regla de conversión (implementada en `main.js`):** cada CTA principal lleva `data-interes`
(`general`, `sistemas`, `automatizacion`, `marketing`). Al hacer clic guarda el valor en
`sessionStorage` (`devsign:interes`), lo pone en `document.documentElement.dataset.interes` y emite
`devsign:interes`. La Etapa B debe:
1. leer ese valor al cargar el formulario;
2. preseleccionar el radio `input[name="interes"][value="..."]` correspondiente;
3. escuchar el evento para cambios en caliente.

**Anclas pendientes:** los CTAs secundarios apuntan a `#casos` y `#proceso`, que se crean en la
Etapa B. "Ver trabajos de diseño" ya apunta a `/marketing/`.

**Estrategia acordada:** fijar estilo + textos **antes** de construir la Etapa B. No hace falta
"terminar todo y rediseñar": la Etapa A está cerrada y sirve de base. Construir el resto sobre una
dirección rechazada sería rework innecesario.

**Se conserva del último intento** (no fue rechazado): tokens alineados al manual, botones con radio
de 11,2 px y flecha en el primario, marquee con nombres reales de clientes, infraestructura completa.

**Aclaración de alcance que se le dio al cliente:**
- "Casos de éxito", "Qhatu" y "formulario" son **Etapa B y todavía no existen**. No se perdió nada.
- El home de hoy tiene hero (slider) + marquee + banda de contacto + footer.
- Esos bloques requieren material del cliente: capturas y métricas, link/portada, endpoint del formulario.

---

## 2. Restricciones no negociables

- **HTML, CSS y JS puros.** Nada de Next/React/Vue/Astro/Tailwind build. Lo que se sube por FTP funciona tal cual.
- **Multipágina simple**: `index.html` y `marketing/index.html`, con CSS y JS compartidos.
- Hosting **DonWeb compartido** (Apache, sin Node en producción).
- Prioridad: Core Web Vitals, accesibilidad (contraste, foco, teclado, `prefers-reduced-motion`) y SEO.
- Viewport sin bloquear zoom. Sin Three.js: los "3D" son imágenes pre-renderizadas.
- Dependencias mínimas y justificadas. Animación con CSS + `IntersectionObserver`.
- **Git lo maneja el usuario.** No crear ramas, ni commits, ni tocar remotes.

---

## 3. Estado actual: Etapa A terminada ✅

### Estructura

```
/                       index.html · 404.html · sistema.html · robots.txt · sitemap.xml · .htaccess
marketing/              index.html        (stub noindex, se completa en Etapa C)
assets/css/styles.css   sistema de diseño completo (~37 KB)
assets/js/main.js       header, nav móvil, reveals, marquee, año (~4 KB)
assets/fonts/           poppins-400/500/600/700.woff2 (subset latin)
assets/icons/           favicon.svg · apple-touch-icon.png
assets/img/og/          og-default.png (1200×630)
assets/img/             PENDIENTES.md (nombres y formatos de imágenes futuras)
_partials/              header.html · footer.html  (fuente única)
_tools/                 sync-partials.mjs · make-icons.ps1
images/logo.png         único logo real (1014×343, transparente, letras blancas)
```

### Ya funciona

- Home con hero (composición de paneles POS/stock/agente IA), marquee de logos y banda de contacto.
- Página 404 propia, stub de marketing, styleguide interno en `/sistema.html`.
- Header sticky con blur, nav móvil accesible (Escape, bloqueo de scroll, `aria-expanded`).
- Reveals al scroll con stagger, marquee con botón de pausa, año dinámico.
- Tokens, botones, tarjetas, placeholders, formularios, diálogo, footer, utilidades, print.

### Verificado (16/11/2026)

| Check | Resultado |
| --- | --- |
| `/`, `/marketing/`, `/sistema.html`, `/404.html` | 200 |
| Ruta inexistente | 404 con la página propia |
| `/_partials/`, `/_tools/`, `.md`, `/.git` | 403 |
| Consola del navegador | 0 errores |
| Lighthouse | Accesibilidad 100 · Best Practices 100 · SEO 100 |
| Overflow horizontal 360/390/768/1024 | 0 px |
| Nav móvil | abre, bloquea scroll, cierra con Escape |

---

## 4. Cómo trabajar

### Previsualizar

- `http://devsign.test/` ← es la URL canónica de desarrollo (raíz del dominio, por eso las rutas son absolutas `/assets/...`).
- `http://localhost/devsign/` también responde, pero las rutas absolutas apuntan a la raíz de localhost.

### Comandos

```powershell
# Node no está en el PATH del shell: anteponer la ruta
$env:Path += ";C:\laragon\bin\nodejs\node-v22"

# Inyectar header/footer en las 4 páginas (no es obligatorio para publicar)
node _tools/sync-partials.mjs

# Regenerar favicon PNG y OG si cambia el logo
powershell -ExecutionPolicy Bypass -File _tools\make-icons.ps1
```

### Convenciones

- Un solo `h1` por página. Secciones con `h2`.
- Tokens de color/espaciado/tipografía en `:root`. No inventar valores sueltos.
- Secciones: `.section`, `.section--paper`, `.section--dark`, `.section--tight`.
- `data-reveal` + `data-reveal-group` para animar bloques.
- Imágenes siempre con `width`, `height` y `alt` (decorativas: `alt=""`).
- **Cada deploy que toque CSS o JS: subir el `?v=` en las 4 páginas** (los assets van con cache `immutable` de 1 año). Valor actual: `20261117t`.
- El HTML se sirve con `no-cache`, así que un deploy se ve al instante.

### Gotchas (leer antes de editar)

1. **Encoding:** no uses `Get-Content -Raw` + `Set-Content` de PowerShell 5.1 sobre los HTML: leen como ANSI y rompen los acentos. Si hace falta, usar `[System.IO.File]::ReadAllText($p, [System.Text.Encoding]::UTF8)` y escribir con `UTF8Encoding($false)`.
2. **Laragon no tiene `mod_deflate` ni `mod_expires` activos**: la compresión y el `Expires` no se pueden probar localmente. Van dentro de `<IfModule>`; en DonWeb deberían andar. Confirmar al subir.
3. **El logo solo funciona sobre fondo oscuro.** "Dev" es blanco; sobre fondo claro desaparece.
4. **No borrar** `css/`, `js/`, `fonts/`, `webfonts/`, `images/`, `portfolio/`: son del sitio viejo (7 MB) y `portfolio/index.html` se usa como fuente en la Etapa C. Se limpia todo al final.
5. `.htaccess` fuerza HTTPS excepto en `.test`, `localhost`, `127.0.0.1` y rangos de red locales. No agregar `Strict-Transport-Security` hasta confirmar HTTPS pleno en producción (la línea está comentada).

---

## 5. Sistema de diseño (resumen)

| Token | Valor | Uso |
| --- | --- | --- |
| `--c-blue` | `#0057FF` | primario, CTA, foco |
| `--c-cyan` | `#00C6FF` | brillo, degradé, nunca texto chico sobre blanco |
| `--c-navy` | `#0A2540` | fondos oscuros, hero |
| `--c-ink` | `#071B31` | header/footer |
| `--c-paper` | `#E7E9F4` | fondos claros alternos (manual) |
| `--c-text` | `#374151` | cuerpo |
| `--c-muted` | `#667085` | texto secundario (contraste 4.6:1 sobre paper) |
| `--c-success` | `#22D3C8` | estados "en línea", checks |
| `--c-violet` | `#8B5CF6` | IA |

Tipografía: Poppins 400/500/600/700. Display con `clamp()`, tracking negativo en títulos.
Clases utilitarias disponibles: `.container`, `.section*`, `.stack`, `.cluster`, `.card`, `.tag`,
`.btn` (+ `--primary/--secondary/--ghost/--light/--sm/--lg`), `.ph` (+ ratios), `.field/.input/.select/.textarea`,
`.choice`, `.modal`, `.eyebrow`, `.grad-text`, `.display/.h1/.h2/.h3`, `.mono`, `.sr-only`.

---

## 6. Datos de contacto ya cargados

- WhatsApp: `+54 9 3863 515 328` → `https://wa.me/5493863515328`
- Instagram: `@devsign.ar` → `https://www.instagram.com/devsign.ar/`
- Facebook: `https://www.facebook.com/profile.php?id=100047006755167`
- Qhatu: `https://qhatu.devsign.ar/`
- Fundadores: David Lazarte y Giuliano Carbone
- Dominio de producción: `https://devsign.ar/`

---

## 7. Tareas pendientes

### Etapa B — Home completa y conectada con material real ✅

La home está completa con activos reales y dinamismo pleno:
1. ~~**Qué resolvemos**~~ ✅ (`#soluciones`): grilla arquitectónica Bento de 4 columnas con acento superior de color por pilar y microinteracciones de hover suaves.
2. ~~**Marquee con 17 logos reales optimizados en insignias circulares**~~ ✅: banda en degradé azul oscuro institucional (`#071B31` a `#0A2540`), logos en **colores 100% reales** (se eliminó el blanco y negro para máxima nitidez y presencia de cada marca) contenidos dentro de insignias circulares blancas (`.marquee__circle`) con micro-elevación y aro de luz cian al hover.
3. ~~**Casos interactivos con Switcher Web / Sistema**~~ ✅ (`#casos`): selector por pestañas (`Role`, `Omega`, `UCIM`, `Polaris / Ñuñorco / DPC`) con micro-toggle interactivo en la barra del navegador que permite alternar entre la **Web pública** y el **Sistema / Panel administrativo**, mostrando las capturas reales subidas por el usuario.
4. ~~**Qhatu con mockup de smartphone real**~~ ✅ (`#qhatu`): pantalla real de la app cargada en el smartphone en perspectiva (`assets/img/casos/qhatu2.webp`).
5. ~~**Invitaciones web con capturas reales y enlaces en vivo**~~ ✅ (`#invitaciones`): 3 smartphones reales (Casamiento Lu & Mario, Mis 15 Mili, Mi Bautismo Paulina) con botones directos para probar la demo en vivo.
6. ~~**Puente de Marketing e Instagram**~~ ✅ (`#marketing-inicio`): 4 marcas reales del portfolio y conexión con los Reels de `@devsign.ar`.
7. ~~**Formulario conectado con Ferozo**~~ ✅: procesador `contacto.php` configurado para despachar correos en HTML con remitente y destinatario `admin@devsign.ar`, honeypot silencioso anti-spam y fallback a WhatsApp.
8. ~~**Reels reales en Marketing y soporte Elfsight**~~ ✅: modal vertical compacto estilo smartphone (`.mkt-modal--reel`, proporción 9:16 sin desbordes ni cajas blancas) con enlace directo para abrir en Instagram, y contenedor preparado para integrar Elfsight Instagram Feed si se prefiere.

### Etapa C — Marketing y portfolio ✅ (completada con material real)

- Portfolio de identidad con las 6 marcas reales en WebP (158 KB en total).
- Galería de invitaciones web reales con enlaces de prueba en vivo.
- Integración de Reels reales de Instagram `@devsign.ar` con visor estilizado de smartphone.

### Etapa D — Cierre técnico y publicación (en curso)

- Cache busting actualizado a `?v=20261124d` en todas las páginas.
- **Tarjeta de Reels / Instagram en Home (`.home-mkt__ig`)**: se eliminó la herencia de texto oscuro en `strong`, forzando blanco puro `#ffffff !important` y subtítulo legible `rgba(231, 233, 244, 0.82)`. Se reemplazó el carácter unicode por un badge SVG con gradiente y flecha interactiva, y se estilizaron los botones inferiores (`.btn--light` y `.btn--secondary`) con alto contraste sobre fondo oscuro.
- **Modal Lightbox de Portfolio (`.mkt-modal:not(.mkt-modal--reel)`)**: rediseñado por completo. Se corrigió el ancho desproporcionado (limitado a `46rem` centrado con `margin: auto`), se agregó padding generoso en `.mkt-modal__box`, scrollbar vertical con `max-height: calc(100svh - 3rem)` para que ninguna descripción quede cortada, botón de cierre circular con hover dinámico y escenario para logos con gradiente suave (`#F8FAFC` a `#EEF2F6`) y sombra tenue.
- Controles del hero slider normalizados: reset estricto multi-clase (`.hero__arrow, .hero__btn` y `.hero__pause, .hero__btn--pause`) con dimensiones fijas en SVG (`14x14`) y background translúcido para evitar botones grises nativos de Windows/Chrome.
- Marquee ampliado: insignias circulares a `6.5rem` (~104px), logos a `max-height: 3.25rem` (+40% de tamaño), y sumado el nuevo logo de **Skill Fitness** (`assets/img/logos/opt/skillfitness.webp`).
- Pruebas locales de `contacto.php` con código 200 y JSON OK.
- Parciales sincronizados en todas las páginas con `node _tools/sync-partials.mjs`.

---

## 8. Material y pendientes restantes

- **GitHub de Giuliano**: confirmar usuario de GitHub para el enlace en el equipo.
- **FitDev**: confirmar si se incorpora como mención en servicios o si queda para más adelante.
- **Limpieza final pre-deploy**: antes de subir por FTP a DonWeb, borrar carpetas viejas en desuso (`css/`, `js/`, `fonts/`, `webfonts/`, `images/`, `portfolio/`).

---

## 9. Skills instaladas (17/11/2026)

Instaladas en `C:\Users\Giuliano\.agents\skills` vía `npx.cmd skills add ... -g -a opencode -y`:

- `anthropics/skills@frontend-design` → dirección estética, anti-clichés de IA.
- `pbakaus/impeccable@impeccable` → `craft / critique / polish / audit`, piso de calidad.
- `vercel-labs/agent-skills@web-design-guidelines` → checklist de revisión.
- `emilkowalski/skills@emil-design-eng` → microinteracciones y motion.
- `coreyhaines31/marketingskills@copywriting` → estructura del mensaje.

Cargar `frontend-design` antes de proponer cualquier dirección visual. La guía del manual de marca
manda sobre los defaults de la skill.

---

## 10. Checklist para retomar

1. Leer **§1bis** antes de tocar nada.
2. Pedir/esperar las **opciones de texto del cliente** y la aprobación de la dirección.
3. Recién ahí escribir `DESIGN.md` con la dirección aprobada y arrancar **Etapa B, punto 1**.
4. Al editar header/footer: cambiar `_partials/` y correr `node _tools/sync-partials.mjs`.
5. Cada cambio en CSS/JS: subir el `?v=` y pasar Lighthouse + teclado.
6. Antes de cortar: actualizar este archivo con lo hecho y lo que quedó a medias.

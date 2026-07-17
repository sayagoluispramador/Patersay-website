# Despliegue en Cloudflare — PATERSAY Website

Resumen de la configuración de despliegue de este proyecto, documentado como
referencia reutilizable para futuros proyectos similares (sitios estáticos
HTML/CSS/JS sin build step).

Flujo utilizado: **Visual Studio Code → GitHub → Cloudflare (Workers con
static assets) → Dominio propio**.

## 1. Repositorio

- **GitHub:** https://github.com/sayagoluispramador/Patersay-website
- **Visibilidad:** Privado
- **Rama de producción:** `main`
- **Identidad de commits configurada en esta máquina:**
  ```bash
  git config --global user.name "sayagoluisprogramador"
  git config --global user.email "sayagoluisp@gmail.com"
  ```
- **Credential helper de Git (Windows):**
  ```bash
  git config --global credential.helper manager
  ```
  Sin este paso, el primer `git push` a un repositorio privado falla con
  `remote: Repository not found` en vez de pedir login — GitHub oculta la
  existencia de repos privados a pedidos no autenticados.

## 2. Comandos utilizados (de punta a punta)

```bash
# Identidad y credenciales (una sola vez por máquina)
git config --global user.name "sayagoluisprogramador"
git config --global user.email "sayagoluisp@gmail.com"
git config --global credential.helper manager

# Inicializar y subir el repo
git init
git add .
git commit -m "Initial commit: sitio web PATERSAY completo"
git branch -M main
git remote add origin https://github.com/sayagoluispramador/Patersay-website.git
git push -u origin main

# Si GitHub generó un README propio al crear el repo (pasa si no se
# desmarca esa opción), reconciliar antes del push:
git fetch origin
git pull origin main --allow-unrelated-histories --no-edit
# resolver conflicto quedándose con la versión local si corresponde:
git checkout --ours README.md
git add README.md
git commit --no-edit
git push origin main
```

Para cambios futuros, el flujo del día a día es simplemente:

```bash
git add .
git commit -m "Descripción del cambio"
git push
```

Cada push a `main` dispara un build y deploy automático en Cloudflare.

## 3. Análisis del proyecto (previo al deploy)

| Punto | Resultado |
|---|---|
| Framework | Ninguno — HTML/CSS/JS estático puro |
| Build command | No aplica (no hay proceso de compilación) |
| Install command | No aplica (sin dependencias de producción) |
| Carpeta a publicar | `/` (raíz del repo) — no hay `dist`/`build`/`out` |
| Node.js en producción | No requerido |
| SSR | No |
| Backend propio | No (el formulario de contacto llama directo a Web3Forms desde el navegador) |

## 4. Configuración en Cloudflare

El proyecto quedó creado como **Worker con "static assets"** (no como
"Pages" clásico) — la ruta exacta dependió de qué opción se eligió al crear
el proyecto en el dashboard. El comando de deploy configurado en Cloudflare
es:

```
npx wrangler deploy
```

### Archivos de configuración agregados al repo

**`wrangler.jsonc`** (raíz del proyecto) — necesario para que Wrangler no
regenere su configuración por defecto en cada build:

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "patersay-website",
  "compatibility_date": "2026-07-17",
  "assets": {
    "directory": "."
  }
}
```

**`.assetsignore`** (raíz del proyecto) — excluye del deploy todo lo que no
es parte del sitio público (mismo formato que `.gitignore`):

```
node_modules/
.git/
.wrangler/
.vscode/
.claude/
package.json
package-lock.json
bun.lock
bun.lockb
.gitignore
.assetsignore
wrangler.jsonc
.env.example
README.md
ESTRUCTURA.md
INSTALACION.html
```

### Por qué hicieron falta estos dos archivos

Sin un `wrangler.jsonc` propio en el repo, Wrangler genera uno nuevo en cada
build con `"assets": { "directory": "." }` sin exclusiones. Como Cloudflare
instala dependencias (`bun install`) **antes** de correr `wrangler deploy`,
en ese momento ya existe una carpeta `node_modules/` en la raíz — y como
`wrangler deploy` necesita descargar `wrangler` (que a su vez depende de
`workerd`, el runtime de Workers, ~122 MB), ese binario termina también
dentro de `node_modules/`. Al escanear "todo lo que hay en la raíz" como
assets a publicar, Wrangler encuentra ese archivo de 122 MB y falla, porque
Cloudflare Workers no permite assets de más de 25 MB.

`.assetsignore` resuelve esto de forma permanente: sin importar qué se
instale en `node_modules` en futuros builds, Wrangler lo ignora al armar la
lista de archivos a publicar.

## 5. Dominio personalizado y DNS

- **Dominio:** `patersay.com` (ya era una zona "Active" en la cuenta de
  Cloudflare antes de empezar — si no lo fuera, hay que agregarlo primero
  como sitio en Cloudflare y cambiar los nameservers en el registrador).
- **Dónde se conecta:** proyecto → pestaña **"Domains"** (no "Settings" —
  esa pestaña solo aparece para Workers con código de servidor, no para uno
  que solo sirve assets estáticos) → sección **"Custom Domains and
  Routes"** → botón **"Add Domain"**.
- **Dominios agregados:** `patersay.com` y `www.patersay.com` (hay que
  agregarlos como dos entradas separadas; escribir solo `patersay.com` no
  agrega automáticamente el `www`, y viceversa).
- **DNS y SSL:** ambos se generan automáticamente al agregar el Custom
  Domain (siempre que la zona ya esté en Cloudflare) — no hace falta crear
  registros manualmente. El certificado SSL puede tardar 1–2 minutos más
  que el DNS en quedar activo.

### Verificación final (confirmada, no solo asumida)

```bash
curl -sI https://patersay.com
curl -sI https://www.patersay.com
```

Ambos responden `HTTP 200`, con certificado SSL válido y sirviendo el sitio
real.

## 6. Variables de entorno

No aplica en este proyecto: al no haber build step, Cloudflare no tiene
forma de inyectar variables de entorno en el HTML/JS servido tal cual. El
Access Key de Web3Forms usado por el formulario de contacto está embebido
directamente en `js/main.js` a propósito — está diseñado para vivir en
código de frontend (no es un secreto tipo contraseña).

## 7. Recomendaciones de mantenimiento

- **Cada `git push` a `main` es un deploy a producción** — no hay ambiente
  de staging en esta configuración. Para cambios grandes, probar primero en
  local (`npm start` / `live-server`) antes de subir.
- **Revisar el estado del Access Key de Web3Forms periódicamente** desde su
  panel (web3forms.com) para confirmar que sigue activo y dentro de la
  cuota gratuita (250 envíos/mes).
- **Si el proyecto crece y suma dependencias de verdad** (más allá de
  `live-server`, que es solo de desarrollo), revisar que no terminen
  incluidas en el deploy — `.assetsignore` ya cubre `node_modules/` en
  general, pero conviene revisar el log de cada build igual.
- **Para replicar este flujo en otro proyecto estático nuevo:** copiar
  `wrangler.jsonc` y `.assetsignore` de este repo como punto de partida,
  ajustando el campo `"name"` de `wrangler.jsonc` al nombre del nuevo
  proyecto.
- **Logs de cada deploy:** dashboard de Cloudflare → proyecto → pestaña
  **"Deployments"** → seleccionar un deployment → ver el log completo del
  build (ahí se habría visto el error de `workerd` antes de que se
  reprodujera).

## 8. Errores encontrados durante este despliegue (y su causa real)

Registro de los problemas reales que aparecieron, para no perder tiempo
re-diagnosticándolos si se repiten en otro proyecto:

1. **`remote: Repository not found`** al hacer el primer `push` — causa
   real: `credential.helper` de Git no estaba configurado en la máquina, y
   además el nombre de usuario de GitHub usado inicialmente era incorrecto
   (se había confundido con la identidad de commits de Git, que es un dato
   distinto).
2. **`! [rejected] main -> main (fetch first)`** — causa real: GitHub había
   generado un `README.md` automático al crear el repositorio (el checkbox
   de "Add a README file" quedó marcado). Se resolvió con
   `git pull --allow-unrelated-histories` y conservando la versión local.
3. **`✘ Asset too large... node_modules/workerd/bin/workerd... 122 MiB`** —
   causa real: sin un `wrangler.jsonc` propio en el repo, Wrangler
   autogenera uno con `"directory": "."` sin exclusiones, y termina
   publicando su propia carpeta `node_modules` (creada durante el mismo
   build) como si fuera parte del sitio. Se resolvió agregando
   `wrangler.jsonc` y `.assetsignore` al repo (ver sección 4).

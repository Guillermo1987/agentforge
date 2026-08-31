// Comprobaciones de configuración que el compilador no puede hacer.
//
// `tsc` y `vite build` verifican el código. Lo que se les escapa es la
// frontera con el exterior: una variable de entorno que el código lee y nadie
// documentó llega como `undefined` en producción y rompe Firebase sin un solo
// error de compilación. Estas pruebas miran esa frontera.
//
// Sin dependencias: runner de node (`node --test`).

import { strict as assert } from 'node:assert'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, extname } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'

const RAIZ = join(fileURLToPath(new URL('.', import.meta.url)), '..')
const EXTENSIONES = new Set(['.ts', '.tsx', '.js', '.jsx'])

function ficheros(dir) {
  return readdirSync(dir).flatMap((nombre) => {
    const ruta = join(dir, nombre)
    if (statSync(ruta).isDirectory()) return ficheros(ruta)
    return EXTENSIONES.has(extname(nombre)) ? [ruta] : []
  })
}

const FUENTES = ficheros(join(RAIZ, 'src'))
const EJEMPLO = readFileSync(join(RAIZ, '.env.example'), 'utf8')

// Ojo con el rango: VITE_N8N_WEBHOOK_URL lleva un dígito. Un patrón de solo
// [A-Z_] lo corta en "VITE_N" y la prueba pasaría comprobando algo que no
// existe.
const PATRON_ENV = /import\.meta\.env\.(VITE_[A-Z0-9_]+)/g

test('el recorrido encuentra fuentes que revisar', () => {
  assert.ok(FUENTES.length > 5, `solo ${FUENTES.length} ficheros: pasaría en vacío`)
})

test('.env.example documenta todas las variables que lee el código', () => {
  const leidas = new Set()
  for (const ruta of FUENTES) {
    const texto = readFileSync(ruta, 'utf8')
    for (const m of texto.matchAll(PATRON_ENV)) leidas.add(m[1])
  }
  assert.ok(leidas.size > 0, 'no se encontró ninguna variable: el patrón está roto')

  const documentadas = new Set(
    EJEMPLO.split('\n')
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith('#'))
      .map((l) => l.split('=')[0].trim()),
  )

  const faltan = [...leidas].filter((v) => !documentadas.has(v)).sort()
  assert.deepEqual(
    faltan,
    [],
    `El código lee variables que .env.example no documenta: ${faltan.join(', ')}.\n` +
      'En producción llegarían como undefined sin ningún error de compilación.',
  )
})

test('.env.example no trae ningún secreto relleno', () => {
  // Un .env.example con la clave puesta se copia tal cual al repositorio y
  // acaba publicado. Los identificadores del proyecto (dominio, bucket) sí
  // pueden ir con valor: son públicos.
  const SECRETOS = ['VITE_FIREBASE_API_KEY', 'VITE_FIREBASE_APP_ID',
                    'VITE_FIREBASE_MESSAGING_SENDER_ID', 'VITE_N8N_WEBHOOK_URL']
  const rellenos = []
  for (const linea of EJEMPLO.split('\n')) {
    const limpia = linea.trim()
    if (!limpia || limpia.startsWith('#')) continue
    const [clave, ...resto] = limpia.split('=')
    if (SECRETOS.includes(clave.trim()) && resto.join('=').trim() !== '') {
      rellenos.push(clave.trim())
    }
  }
  assert.deepEqual(rellenos, [], `secretos con valor en .env.example: ${rellenos}`)
})

test('las reglas de Firestore no dejan la base abierta', () => {
  const reglas = readFileSync(join(RAIZ, 'firestore.rules'), 'utf8')
  const sinComentarios = reglas
    .split('\n')
    .filter((l) => !l.trim().startsWith('//'))
    .join('\n')

  // El patrón que deja cualquier documento leído y escrito por cualquiera.
  const abierta = /allow\s+read\s*,\s*write\s*:\s*if\s+true\s*;/
  assert.ok(
    !abierta.test(sinComentarios),
    'firestore.rules contiene «allow read, write: if true», que abre toda la base',
  )
  assert.ok(
    sinComentarios.includes("rules_version = '2'"),
    'firestore.rules debe declarar rules_version 2',
  )
})

test('el .gitignore protege el .env real', () => {
  const ignorados = readFileSync(join(RAIZ, '.gitignore'), 'utf8')
    .split('\n')
    .map((l) => l.trim())
  assert.ok(
    ignorados.includes('.env') || ignorados.includes('.env*') ||
      ignorados.some((l) => l.startsWith('.env')),
    '.gitignore tiene que excluir el .env con las claves reales',
  )
})

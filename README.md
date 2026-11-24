# MiHatoApp — MVP local

PWA inicial para registro de bovinos y estimación de peso. Los datos se guardan localmente en IndexedDB mediante Dexie.

## Requisitos
- Node.js 20.9 o superior
- npm

## Instalación
```bash
npm install
npm run dev
```
Abre http://localhost:3000

## Build
```bash
npm run build
npm start
```

## Métodos de cálculo
- Medidas corporales: fórmula métrica de Schaeffer, `peso kg = (perímetro torácico cm² × largo corporal cm) / 10838.2`.
- Cinta bovinométrica: captura directa de la lectura en kg indicada por la cinta. La calibración depende del fabricante.

## Datos
Los datos viven en IndexedDB del navegador. No hay servidor ni sincronización. Usa Exportar respaldo para conservar una copia JSON. La importación reemplaza los registros locales actuales.

## PWA
Se incluye `public/manifest.json` y un icono SVG. Se incluye un Service Worker básico que precarga la pantalla principal y el manifest, conserva recursos estáticos visitados y usa la pantalla principal como respaldo de navegación sin conexión. El registro del Service Worker se activa en producción. Antes de publicar, probar instalación y modo avión en Android, iOS y escritorio; iOS tiene limitaciones propias de PWA.

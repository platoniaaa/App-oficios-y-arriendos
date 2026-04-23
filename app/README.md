# Cuadrilla — prototipo frontend

Marketplace chileno de oficios y arriendo de herramientas. Prototipo funcional con datos
mock, listo para validación en GitHub Pages.

- **Stack:** React 18 + TypeScript + Vite, React Router (HashRouter), Tailwind CSS, Zustand,
  React Hook Form + Zod, Lucide React.
- **Despliegue:** GitHub Pages vía Actions (`.github/workflows/deploy.yml`).
- **Persistencia:** `localStorage` (usuario autenticado, contrataciones, chats, chatbot,
  reseñas, notificaciones).
- **Chatbot IA:** modo `mock` con 5 flujos guionados (`VITE_CHATBOT_MODE=mock`). Modo `api`
  queda como hook a futuro.

## Ejecutar local

```bash
cd app
npm install
npm run dev
```

Por defecto corre en http://localhost:5173.

## Scripts

| Script            | Uso                                |
|-------------------|-------------------------------------|
| `npm run dev`     | servidor de desarrollo              |
| `npm run build`   | build productivo (`tsc -b && vite`) |
| `npm run preview` | previsualiza el build               |

## Variables de entorno

Crea un archivo `.env.local` en `app/`:

```
VITE_BASE_PATH=/
VITE_CHATBOT_MODE=mock
# VITE_CHATBOT_API_KEY=sk-...  # solo si activas modo api (no recomendado en GH Pages público)
```

- `VITE_BASE_PATH`: si despliegas en `usuario.github.io/nombre-repo/`, pon `/nombre-repo/`.
  El workflow lo setea automáticamente al nombre del repo.
- `VITE_CHATBOT_MODE`:
  - `mock` (default): respuestas guionadas por palabras clave. Flujos: remodelación de baño,
    terraza, fuga de agua, mudanza, instalación eléctrica.
  - `api`: placeholder para conectar una API real (Claude/OpenAI). **No recomendado** en el
    frontend público porque expone la key.

## Despliegue a GitHub Pages

1. Push a `main`.
2. En el repo: **Settings → Pages → Source = GitHub Actions**.
3. El workflow `deploy.yml` compila y publica `app/dist`.
4. La URL aparecerá como `https://<usuario>.github.io/<repo>/`.

## Usuarios demo

- Cliente: `demo-cliente@cuadrilla.cl`
- Trabajador: `demo-trabajador@cuadrilla.cl`
- Arrendador: `demo-arrendador@cuadrilla.cl`

Cualquier contraseña sirve; el login mock también acepta cualquier email de `users.json`. En
la pantalla de login hay botones de acceso rápido por rol.

## Estructura

```
app/src/
├── assets/
├── components/
│   ├── ui/              # botones, inputs, cards, stars, TimelineEscrow
│   ├── layout/          # header, footer, bottomnav, chatbot FAB, PanelLayout
│   └── feature/         # componentes por módulo
├── pages/               # rutas top-level
├── pages/panel/         # rutas del panel privado
├── features/chatbot/    # scripts guionados
├── mocks/               # users, servicios, herramientas, etc.
├── stores/              # zustand (auth, contrataciones, chat, chatbot, notificaciones, reseñas)
├── lib/                 # format, cn, rut, mockApi
├── hooks/
├── types/
├── config/              # brand.ts (nombre, colores, comisión)
├── styles/globals.css
└── App.tsx · main.tsx
```

## Criterios de aceptación cubiertos

- ✅ 21 usuarios mock, 16 servicios mock, 16 herramientas mock.
- ✅ Flujo completo de contratación de servicio (solicitud → cotización → escrow → ejecución
  → aprobación → reseña).
- ✅ Flujo completo de arriendo de herramienta con depósito en escrow.
- ✅ Chatbot con 5 flujos completos que terminan en cotización.
- ✅ Componente `<TimelineEscrow />` reutilizable en cada contratación.
- ✅ Chat 1:1 con respuesta automática simulada.
- ✅ Badges de verificación (RUT, cédula, antecedentes, certificaciones).
- ✅ Persistencia en localStorage.
- ✅ Estados vacíos manejados (sin resultados, sin notificaciones, sin publicaciones).
- ✅ Responsive mobile / tablet / desktop con bottom nav en móvil.
- ✅ Totalmente navegable end-to-end.

## Customización de marca

Edita `src/config/brand.ts` (nombre, tagline, colores corporativos) y
`tailwind.config.js` (paleta y tipografía). El componente `<Logo />` es SVG inline, fácil de
reemplazar.

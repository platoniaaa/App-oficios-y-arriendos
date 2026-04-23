# Documento de Requerimientos Funcionales
## Plataforma Marketplace de Oficios y Arriendo de Herramientas

**Versión:** 1.0 — Prototipo Frontend (Maqueta Funcional)
**Estado:** MVP para validación — despliegue en GitHub Pages
**Alcance:** Frontend responsive con datos mock

---

## 1. Objetivo del documento

Este documento especifica los requerimientos funcionales, flujos, componentes y estructura de datos necesarios para desarrollar un **prototipo frontend funcional** de una plataforma marketplace que conecta:

1. Personas que ofrecen servicios de oficios con clientes que los contratan.
2. Propietarios de herramientas y maquinarias con personas/empresas que las necesitan arrendar.

El prototipo se desplegará en **GitHub Pages** utilizando **datos mock** (sin backend real). Su objetivo es validar la experiencia de usuario, los flujos principales y la propuesta de valor antes de invertir en desarrollo backend.

Este documento está diseñado para ser consumido directamente por **Claude Code** (extensión de VS Code) como especificación de implementación.

---

## 2. Contexto y alcance

### 2.1 Nombre del producto (tentativo)
Por definir. En este documento se referencia como **"La Plataforma"**. Se sugiere dejar un componente `<Logo />` y un archivo `config/brand.ts` con nombre, colores y tagline para facilitar el cambio posterior.

### 2.2 Mercado objetivo
Todo Chile. Sin segmentación vertical inicial: cubre cualquier oficio (maestro de construcción, gasfíter, eléctrico, jardinero, pintor, carpintero, técnico en línea blanca, soldador, etc.) y cualquier herramienta/maquinaria (desde un taladro hasta una retroexcavadora).

### 2.3 Modelos de interacción soportados
La plataforma opera bajo cuatro modelos de transacción:

| Modelo | Ejemplo |
|---|---|
| **C2C** | Persona natural contrata a un maestro persona natural / arrienda una herramienta de otra persona |
| **B2C** | Empresa arrienda una máquina a un cliente persona natural |
| **C2B** | Persona natural ofrece servicios a una empresa |
| **B2B** | Empresa arrienda maquinaria a otra empresa |

### 2.4 Dentro del alcance del prototipo (MVP)
- Registro y login (mock, sin backend real).
- Perfiles de usuario (trabajador, cliente, arrendador de herramientas).
- Publicación y búsqueda de servicios.
- Publicación y búsqueda de herramientas/maquinarias en arriendo.
- Sistema de reseñas y calificación con estrellas.
- Flujo de contratación con UI de escrow simulado.
- Chatbot IA que recomienda personas + herramientas + genera cotización.
- Chat 1:1 entre usuarios.
- Panel de usuario con contrataciones/arriendos en curso.
- Notificaciones in-app (mock).
- Responsive: móvil, tablet y desktop.

### 2.5 Fuera del alcance del prototipo
- Backend real (APIs, base de datos, autenticación real).
- Integración de pagos real (Webpay, MercadoPago, Stripe).
- Escrow financiero real (solo se maqueta la UI).
- Verificación real de identidad/antecedentes (solo UI del flujo).
- Notificaciones push o por email.
- Geolocalización en tiempo real.
- App móvil nativa.

> Estos puntos se mantienen visibles en la UI (botones, estados) pero operan con datos simulados.

---

## 3. Restricciones técnicas

### 3.1 Despliegue
- **Plataforma:** GitHub Pages.
- **Tipo:** Single Page Application estática.
- **Base path:** configurable en `vite.config.ts` vía variable de entorno (para soportar despliegues en `usuario.github.io/repo/`).

### 3.2 Stack recomendado
- **Framework:** React 18+ con TypeScript.
- **Build tool:** Vite.
- **Router:** React Router v6 (con `HashRouter` para compatibilidad con GitHub Pages).
- **Estilos:** Tailwind CSS.
- **Gestión de estado:** Zustand (global) + React Context donde corresponda.
- **Formularios:** React Hook Form + Zod para validación.
- **Íconos:** Lucide React.
- **Mock data:** archivos JSON en `/src/mocks/` cargados en memoria o persistidos en `localStorage` para simular sesión.
- **Chatbot IA:** ver sección 8 (dos modalidades soportadas).

### 3.3 Responsive
Diseño **mobile-first** con tres breakpoints:
- **Móvil:** < 768 px (base).
- **Tablet:** 768 px – 1024 px.
- **Desktop:** > 1024 px.

### 3.4 Estructura de carpetas sugerida
```
src/
├── assets/
├── components/
│   ├── ui/              # botones, inputs, cards, badges, stars
│   ├── layout/          # header, footer, sidebar, bottomnav
│   └── feature/         # componentes compuestos por módulo
├── pages/               # una carpeta por ruta
├── features/
│   ├── auth/
│   ├── profile/
│   ├── services/
│   ├── tools/
│   ├── booking/
│   ├── escrow/
│   ├── chatbot/
│   ├── chat/
│   └── reviews/
├── mocks/               # users.json, services.json, tools.json, etc.
├── stores/              # zustand stores
├── hooks/
├── lib/                 # helpers, formatters, validators
├── types/               # tipos TypeScript compartidos
├── config/
└── routes.tsx
```

---

## 4. Actores del sistema

| Actor | Descripción | Capacidades principales |
|---|---|---|
| **Visitante** | No autenticado | Explorar servicios y herramientas, ver perfiles públicos, usar chatbot (con CTA a registrarse para contratar) |
| **Cliente** | Persona natural o empresa que contrata servicios o arrienda herramientas | Buscar, contratar, arrendar, calificar, chatear |
| **Trabajador (Prestador de servicios)** | Siempre persona natural. Ofrece su oficio | Publicar perfil de servicios, recibir solicitudes, cotizar, chatear, cobrar |
| **Arrendador** | Persona natural o empresa. Publica herramientas/maquinarias | Publicar, gestionar calendario de disponibilidad, aprobar arriendos, cobrar |
| **Admin (futuro)** | Equipo interno de la plataforma | Validar documentos, mediar disputas, moderar contenido — **vista placeholder en el MVP** |

> **Nota clave:** un mismo usuario puede tener múltiples roles activos. Un maestro de construcción puede ser trabajador Y arrendar su revolvedora. El perfil debe soportar ambos simultáneamente mediante "modos" o "pestañas de actividad".

---

## 5. Modelo de datos mock

Todos los datos se almacenan como JSON en `/src/mocks/` y se cargan mediante un servicio central (`lib/mockApi.ts`) que simula latencia de red (200–600 ms) para que la UI maneje estados de carga realistamente.

### 5.1 Entidad `User`
```ts
type User = {
  id: string;
  tipo: "persona" | "empresa";
  nombre: string;                    // o razón social
  rut: string;                       // formato chileno con DV
  email: string;
  telefono: string;
  fotoPerfil: string;                // URL
  region: string;                    // región de Chile
  comuna: string;
  direccion?: string;
  bio?: string;
  roles: Array<"cliente" | "trabajador" | "arrendador">;
  verificacion: {
    rut: "pendiente" | "validada" | "rechazada";
    cedula: "pendiente" | "validada" | "rechazada";    // foto de cédula
    antecedentes: "pendiente" | "validada" | "no_aplica";
    certificaciones: "pendiente" | "validada" | "no_aplica";
  };
  calificacionPromedio: number;      // 0–5
  totalResenas: number;
  fechaRegistro: string;             // ISO
};
```

### 5.2 Entidad `ServicioOficio` (perfil de trabajador)
```ts
type ServicioOficio = {
  id: string;
  trabajadorId: string;
  oficio: string;                    // ej: "Gasfíter", "Maestro construcción"
  categorias: string[];              // ej: ["Fontanería", "Instalaciones sanitarias"]
  descripcion: string;
  experienciaAnios: number;
  tarifaReferencia: {
    tipo: "hora" | "dia" | "visita" | "a_convenir";
    monto?: number;                  // CLP
  };
  zonasCobertura: string[];          // comunas
  disponibilidad: "inmediata" | "agendada" | "ocupado";
  certificaciones: Certificacion[];
  galeriaTrabajos: string[];         // URLs
  totalTrabajosRealizados: number;
  calificacion: number;
};
```

### 5.3 Entidad `Herramienta` (publicación de arriendo)
```ts
type Herramienta = {
  id: string;
  propietarioId: string;
  titulo: string;
  categoria: string;                 // "Herramienta eléctrica", "Maquinaria pesada", etc.
  subcategoria: string;
  marca: string;
  modelo: string;
  descripcion: string;
  fotos: string[];                   // 1–8 URLs
  estado: "nueva" | "buena" | "aceptable";
  tarifa: {
    porHora?: number;
    porDia?: number;
    porSemana?: number;
  };
  depositoGarantia: number;          // CLP
  requiereEntrega: boolean;
  comunaUbicacion: string;
  retiro: "domicilio_propietario" | "delivery" | "ambos";
  disponibilidad: DateRange[];       // bloques disponibles
  totalArriendos: number;
  calificacion: number;
};
```

### 5.4 Entidad `Contratacion`
```ts
type Contratacion = {
  id: string;
  tipo: "servicio" | "arriendo";
  clienteId: string;
  ofertanteId: string;               // trabajador o arrendador
  itemId: string;                    // id del servicio o herramienta
  fechaSolicitud: string;
  fechaInicio: string;
  fechaFin?: string;
  monto: number;
  comision: number;                  // 10% sugerido
  total: number;
  estado:
    | "solicitada"
    | "cotizada"
    | "aceptada_cliente"
    | "pago_en_escrow"
    | "en_ejecucion"
    | "finalizada_pendiente_aprobacion"
    | "liberado"
    | "cancelada"
    | "en_disputa";
  historialEstados: { estado: string; fecha: string }[];
  notas?: string;
};
```

### 5.5 Otras entidades
- `Resena` — calificación y comentario posterior a una contratación.
- `MensajeChat` — mensajes 1:1 entre usuarios.
- `MensajeChatbot` — historial de conversación con el bot IA.
- `Notificacion` — eventos del sistema (nueva solicitud, pago liberado, reseña recibida).
- `Categoria` — taxonomía de oficios y herramientas (archivo estático).

---

## 6. Estructura de rutas

> Se usa `HashRouter` para compatibilidad con GitHub Pages. Todas las rutas tras `#/`.

| Ruta | Página | Acceso |
|---|---|---|
| `/` | Home / Landing | Público |
| `/buscar/servicios` | Listado y búsqueda de servicios | Público |
| `/buscar/herramientas` | Listado y búsqueda de herramientas | Público |
| `/servicio/:id` | Detalle de servicio (perfil trabajador) | Público |
| `/herramienta/:id` | Detalle de herramienta | Público |
| `/perfil/:userId` | Perfil público de usuario | Público |
| `/registro` | Registro (paso a paso) | Público |
| `/login` | Inicio de sesión | Público |
| `/panel` | Dashboard del usuario autenticado | Privado |
| `/panel/perfil` | Editar perfil y verificaciones | Privado |
| `/panel/mis-publicaciones` | Servicios y herramientas publicados | Privado (trabajador/arrendador) |
| `/panel/publicar/servicio` | Wizard de publicación de servicio | Privado |
| `/panel/publicar/herramienta` | Wizard de publicación de herramienta | Privado |
| `/panel/contrataciones` | Listado con filtros por estado | Privado |
| `/panel/contratacion/:id` | Detalle con línea de tiempo y escrow | Privado |
| `/panel/chats` | Bandeja de chats | Privado |
| `/panel/chats/:id` | Conversación específica | Privado |
| `/panel/resenas` | Reseñas dadas y recibidas | Privado |
| `/panel/notificaciones` | Centro de notificaciones | Privado |
| `/asistente` | Chatbot IA en pantalla completa | Público |
| `/como-funciona` | Página informativa | Público |
| `/terminos`, `/privacidad` | Documentos legales (placeholder) | Público |
| `/admin` | Vista admin placeholder (opcional) | Privado |

---

## 7. Módulos funcionales

### Módulo 1 — Autenticación y onboarding

#### F1.1 Registro
Wizard paso a paso con validación progresiva.

**Paso 1 — Tipo de cuenta:**
- Cards seleccionables: *"Persona"* / *"Empresa"*.

**Paso 2 — Intención de uso (multi-selección):**
- ☐ Quiero contratar servicios.
- ☐ Quiero ofrecer mi oficio (solo habilitado si tipo = persona).
- ☐ Quiero arrendar herramientas o maquinarias.
- ☐ Quiero contratar / tomar en arriendo.

> La selección determina qué campos se solicitan y qué roles tendrá el usuario.

**Paso 3 — Datos básicos:**
- Persona: nombre, apellido, RUT, email, teléfono, región, comuna, contraseña.
- Empresa: razón social, RUT, giro, email, teléfono, región, comuna, contraseña + datos de contacto de representante.
- Validación de RUT chileno con dígito verificador.

**Paso 4 — Verificación (mock):**
- Upload de foto de cédula (anverso y reverso).
- Upload de certificaciones de oficio (solo si se marcó "ofrecer oficio").
- Checkbox: *"Autorizo consulta de antecedentes"*.
- Al finalizar, los campos quedan en estado `pendiente`. Un botón oculto en modo dev permite al usuario "aprobar" su propia verificación para demo.

**Paso 5 — Foto de perfil y bio:** campos opcionales con previsualización.

**Paso 6 — Términos y bienvenida:** aceptación de T&C → redirección al panel.

#### F1.2 Login
Formulario simple con email + password. El mock acepta cualquier usuario presente en `users.json`. Botón *"Entrar como demo (cliente/trabajador/arrendador)"* para facilitar pruebas.

#### F1.3 Recuperación de contraseña
Solo UI: formulario de email + mensaje de confirmación. Sin envío real.

---

### Módulo 2 — Perfil de usuario

#### F2.1 Perfil público (`/perfil/:userId`)
- Foto, nombre, ubicación, fecha en la plataforma.
- Estrellas promedio + cantidad de reseñas.
- Badges de verificación (RUT, cédula, antecedentes, certificaciones) — íconos de Lucide en color según estado.
- Tabs según roles activos:
  - **Servicios ofrecidos** (si es trabajador).
  - **Herramientas en arriendo** (si es arrendador).
  - **Reseñas recibidas** (siempre).
- Botón *"Contactar"* → abre chat 1:1.

#### F2.2 Edición de perfil (`/panel/perfil`)
Formulario editable de todos los datos + sección de verificaciones con estado actual y botón para reintentar cualquiera que esté rechazada.

---

### Módulo 3 — Marketplace de servicios

#### F3.1 Búsqueda (`/buscar/servicios`)
**Barra superior:** input de texto + botón de filtros (drawer en móvil, sidebar en desktop).

**Filtros:**
- Oficio / categoría.
- Región y comuna.
- Rango de tarifa.
- Calificación mínima (⭐ 3, 4, 4.5+).
- Solo verificados.
- Disponibilidad (inmediata / agendable).

**Ordenamiento:** relevancia, calificación, tarifa asc/desc, más recientes.

**Vista de resultados:** grid de cards (3 columnas desktop, 2 tablet, 1 móvil).

**Card de trabajador:**
- Foto circular + nombre + oficio.
- Calificación + n° de trabajos.
- Comuna base + zonas de cobertura.
- Tarifa referencial.
- Chips con certificaciones verificadas.
- Botón *"Ver perfil"* y *"Contratar"*.

#### F3.2 Detalle de servicio (`/servicio/:id`)
- Header con foto del trabajador, oficio, calificación, botones *"Contratar"* / *"Enviar mensaje"*.
- Descripción del servicio.
- Galería de trabajos anteriores (lightbox al clickear).
- Zonas de cobertura (chips).
- Certificaciones con íconos verificados.
- Tarifa y modalidad.
- Últimas reseñas (carrusel o lista con paginación).
- FAQ colapsable (si el trabajador la llenó).

#### F3.3 Publicación de servicio (`/panel/publicar/servicio`)
Wizard de 5 pasos:
1. Oficio y categorías (selector con autocompletado).
2. Descripción + experiencia en años.
3. Tarifa y modalidad.
4. Zonas de cobertura (multi-selección de comunas + mapa opcional).
5. Galería de trabajos (upload múltiple con preview).
6. Confirmación y publicación.

---

### Módulo 4 — Marketplace de arriendo de herramientas

#### F4.1 Búsqueda (`/buscar/herramientas`)
Similar a F3.1 con filtros específicos:
- Categoría (herramientas eléctricas, manuales, maquinaria pesada, equipos de medición, escaleras y andamios, generadores, etc.).
- Comuna.
- Rango de tarifa por día.
- Disponibilidad en fechas (date range picker).
- Entrega a domicilio sí/no.
- Depósito máximo.
- Calificación mínima del arrendador.

#### F4.2 Detalle de herramienta (`/herramienta/:id`)
- Galería de fotos (carrusel principal + thumbnails).
- Título, marca, modelo, estado.
- Tarifas (hora / día / semana) en tabla.
- Depósito en garantía.
- Ubicación y modalidad de retiro.
- Calendario de disponibilidad interactivo.
- Información del arrendador (card lateral con foto, calificación, link a perfil).
- Botón *"Solicitar arriendo"* → abre modal con selección de fechas y resumen de costos.
- Reseñas de arriendos anteriores.

#### F4.3 Publicación de herramienta (`/panel/publicar/herramienta`)
Wizard:
1. Categoría + subcategoría.
2. Título, marca, modelo, estado.
3. Fotos (mínimo 1, máximo 8).
4. Descripción detallada y uso recomendado.
5. Tarifas (al menos una: hora, día o semana).
6. Depósito en garantía.
7. Modalidad de entrega y comuna.
8. Calendario de disponibilidad (bloqueo de fechas).
9. Confirmación y publicación.

---

### Módulo 5 — Contratación y sistema escrow (UI mock)

El escrow es el corazón de la confianza. En el prototipo se representa visualmente mediante una **línea de tiempo de estados** y un **botón de acción** según el rol del usuario y el estado actual.

#### F5.1 Flujo de contratación (servicios)

```
[Cliente solicita]
       ↓
[Trabajador cotiza] ───> [Cliente rechaza] ──> [Cancelada]
       ↓
[Cliente acepta y paga a escrow]
       ↓
[En ejecución]
       ↓
[Trabajador marca como finalizado]
       ↓
[Cliente aprueba] ──> [Pago liberado al trabajador]
       │
       └──> [Cliente reporta problema] ──> [En disputa] ──> [Mediación admin]
```

**Estados y acciones:**

| Estado | Acciones del cliente | Acciones del prestador |
|---|---|---|
| Solicitada | Cancelar | Cotizar / Rechazar |
| Cotizada | Aceptar / Negociar / Cancelar | — |
| Aceptada – pago pendiente | *"Pagar y reservar en escrow"* (botón simulado) | — |
| Pago en escrow | Mensajear | Iniciar trabajo |
| En ejecución | Mensajear | *"Marcar como finalizado"* |
| Finalizada – pend. aprobación | Aprobar / Disputar | — |
| Liberada | Dejar reseña | Dejar reseña |
| En disputa | Chat con mediación | Chat con mediación |

#### F5.2 Flujo de arriendo de herramientas
Similar al anterior, con estos cambios:
- Se agrega el paso *"Cliente retira o recibe herramienta"*.
- Al finalizar el plazo, *"Cliente devuelve herramienta"*.
- El **depósito** se mantiene en escrow separado del pago del arriendo; se libera junto con el pago cuando el arrendador confirma la devolución en buen estado.
- Si el arrendador reporta daño: flujo de disputa con upload de fotos.

#### F5.3 Componente `<TimelineEscrow />`
Componente visual reutilizable que muestra:
- Pasos con íconos (solicitado, pagado, en ejecución, finalizado, liberado).
- Paso actual resaltado.
- Pasos completados en verde.
- Pasos pendientes en gris.
- En móvil: vertical. En desktop: horizontal.

#### F5.4 Panel de contratación `/panel/contratacion/:id`
- Header con resumen (servicio/herramienta, monto, contraparte).
- `<TimelineEscrow />`.
- Detalle de costos: monto base + comisión plataforma (10% configurable) + depósito (si aplica) + total.
- Botón de acción según estado.
- Chat embebido con la contraparte.
- Archivos adjuntos (cotizaciones, fotos, comprobantes).

---

### Módulo 6 — Chatbot IA recomendador y cotizador (funcionalidad prioritaria del MVP)

Este módulo es el **diferenciador principal** de la plataforma y debe recibir especial atención en UX.

#### F6.1 Acceso al chatbot
- Botón flotante (FAB) visible en todas las páginas públicas y del panel, esquina inferior derecha.
- Ruta dedicada `/asistente` para experiencia full-screen.
- Primer saludo contextual:
  > *"Hola 👋 Cuéntame qué proyecto tienes en mente. Puedo ayudarte a encontrar a las personas adecuadas y las herramientas que necesitas."*

#### F6.2 Capacidades del chatbot
El asistente debe, a través de la conversación:

1. **Entender el proyecto:** tipo (remodelación, instalación, construcción, reparación), alcance, ubicación, plazos, presupuesto aproximado.
2. **Hacer preguntas guiadas** cuando falte información. Ejemplo:
   > *"Perfecto, vas a renovar un baño. ¿Incluye cambio de cerámica en muros y piso? ¿Se va a reemplazar el W.C., lavamanos y ducha?"*
3. **Recomendar trabajadores** relevantes al proyecto: ofrece cards con los top 3 matches filtrados por oficio, comuna del usuario y calificación.
4. **Recomendar herramientas/maquinaria** que necesitará si hace el trabajo por su cuenta o que le servirán al equipo.
5. **Generar una cotización preliminar** agregada:
   - Items de mano de obra (por cada oficio sugerido con tarifa de referencia).
   - Items de arriendo de herramientas (con fechas sugeridas).
   - Estimación de materiales (rango, no vende materiales).
   - Subtotal, comisión plataforma, total estimado.
   - Botón *"Enviar esta cotización a los prestadores seleccionados"*.

#### F6.3 Componentes visuales dentro del chat
El chatbot no solo devuelve texto: puede insertar en línea:
- **Preguntas con opciones rápidas** (chips): *"¿Lo quieres hacer tú o contratar a alguien?"* → [Contratar] [Hacerlo yo] [Aún no lo sé].
- **Cards de trabajadores recomendados** con botón *"Ver perfil"* / *"Agregar a cotización"*.
- **Cards de herramientas recomendadas** con botón *"Agregar a cotización"*.
- **Resumen de cotización** con tabla y botón *"Guardar / Enviar"*.

#### F6.4 Implementación técnica
El prototipo debe soportar **dos modos**, seleccionables via variable de entorno `VITE_CHATBOT_MODE`:

- **`mock`** (por defecto en GitHub Pages): respuestas predefinidas por palabras clave e intents. Se incluye un archivo `chatbotScript.ts` con flujos guionados para al menos 5 casos de uso:
  1. Remodelación de baño.
  2. Construcción de terraza.
  3. Reparación de fuga de agua.
  4. Mudanza (contratar fleteros + arrendar carro).
  5. Instalación eléctrica de ampliación.
- **`api`**: llama a la API de Claude (Anthropic) o OpenAI directamente desde el frontend usando una API key que el usuario ingresa en Settings. Respuestas en streaming. Esta modalidad es **opcional** y debe degradar elegantemente si no hay key.

> Para GitHub Pages el modo por defecto debe ser `mock` porque una API key en el frontend público es un riesgo de seguridad. Documentar claramente esta limitación.

#### F6.5 Persistencia de conversación
Historial de chatbot guardado en `localStorage` por usuario. Botón *"Nueva conversación"* y *"Ver conversaciones anteriores"*.

---

### Módulo 7 — Chat entre usuarios

#### F7.1 Bandeja (`/panel/chats`)
Listado de conversaciones con:
- Avatar y nombre de la contraparte.
- Último mensaje + timestamp.
- Badge de no leídos.
- Ícono según contexto (servicio / arriendo / general).

#### F7.2 Conversación (`/panel/chats/:id`)
- Header con datos de la contraparte y link al perfil.
- Mensajes con diseño burbuja estándar (emisor a la derecha en azul, receptor a la izquierda en gris).
- Input inferior con soporte para adjuntos (simulado con preview local).
- Si la conversación está vinculada a una contratación, mostrar banner superior con link al detalle.

> **Simulación:** el mock genera una respuesta automática tras 2–4 segundos para simular al otro usuario. Opcionalmente, una segunda pestaña puede operarse como el otro usuario para pruebas.

---

### Módulo 8 — Reseñas y calificación

#### F8.1 Tras finalizar una contratación
Modal obligatorio (con opción de posponer 24 h) con:
- Estrellas (1–5) para calificar.
- Sub-categorías opcionales (puntualidad, calidad, comunicación, precio).
- Comentario libre (máximo 500 caracteres).
- Checkbox *"Recomiendo a este profesional"*.

#### F8.2 Visualización
- Promedio con estrella grande + desglose por cantidad (5⭐: 23, 4⭐: 5…).
- Lista paginada con avatar, nombre, fecha, estrellas, comentario.
- Respuesta del prestador (opcional, una por reseña).
- Filtro por cantidad de estrellas.

---

### Módulo 9 — Notificaciones

#### F9.1 Centro (`/panel/notificaciones`)
Listado con:
- Ícono según tipo (nuevo mensaje, solicitud, pago, reseña, recordatorio).
- Texto del evento.
- Timestamp relativo (*"hace 3 h"*).
- Link a la pantalla correspondiente.
- Marcar como leída / Marcar todas.

#### F9.2 Indicador global
Badge con contador en campana del header.

---

### Módulo 10 — Admin (placeholder, opcional en el MVP)
Si se implementa, vista simple con:
- Tabs: *Usuarios pendientes de verificación*, *Disputas abiertas*, *Publicaciones reportadas*.
- Tablas con acciones *Aprobar* / *Rechazar* / *Intervenir*.
- Todo mock, sin lógica real.

---

## 8. Flujos principales de usuario (user journeys)

### Flujo A — Cliente contrata un maestro
1. Entra a la home.
2. Usa el chatbot o la búsqueda para encontrar un gasfíter en su comuna.
3. Revisa perfil, calificación y reseñas.
4. Presiona *"Contratar"* → se le pide registrarse si no lo está.
5. Envía solicitud con descripción del trabajo.
6. Recibe cotización del trabajador vía notificación.
7. Acepta y simula el pago al escrow.
8. Chatea con el trabajador para coordinar la visita.
9. Al finalizar, aprueba el trabajo → escrow libera pago.
10. Deja reseña.

### Flujo B — Dueño publica una retroexcavadora en arriendo
1. Se registra como empresa + arrendador.
2. Sube documentos de verificación.
3. Va a *"Publicar herramienta"* y completa el wizard.
4. Define tarifa por día, depósito, calendario.
5. Recibe solicitud de arriendo de un cliente.
6. Aprueba y recibe pago en escrow.
7. Coordina entrega por chat.
8. Cliente devuelve la máquina → aprueba devolución.
9. Escrow libera pago + deposit al cliente.
10. Califican mutuamente.

### Flujo C — Chatbot guía un proyecto completo
1. Usuario escribe *"Quiero renovar mi baño"*.
2. Chatbot pregunta: dimensiones, qué quiere cambiar, ubicación, plazos.
3. Tras 5–7 intercambios, propone:
   - 1 maestro de construcción.
   - 1 gasfíter.
   - 1 eléctrico (si necesario).
   - Arriendo de amoladora, taladro percutor, nivel láser.
   - Cotización estimada.
4. Usuario selecciona con quiénes avanzar.
5. Se crean solicitudes individuales a cada prestador.

---

## 9. Design system

### 9.1 Principios
- **Confianza y cercanía:** colores cálidos + tipografía legible.
- **Claridad sobre elegancia:** el usuario promedio puede no ser tech-savvy.
- **Mobile-first:** botones grandes, inputs cómodos con el pulgar, navegación inferior.

### 9.2 Paleta sugerida (ajustable)
- **Primario:** azul confianza `#1B4F72` (acciones principales).
- **Secundario:** naranja herramienta `#E67E22` (acentos, CTAs destacados).
- **Éxito:** `#27AE60`.
- **Alerta:** `#E74C3C`.
- **Fondos:** blanco `#FFFFFF` + gris claro `#F5F7FA`.
- **Textos:** `#1A1A1A` (principal), `#5A6575` (secundario).

### 9.3 Tipografía
- **Headings:** Inter (700/600).
- **Body:** Inter (400/500).
- Escalas: 12 / 14 / 16 / 18 / 24 / 32 / 40 px.

### 9.4 Componentes base necesarios
`Button`, `Input`, `Select`, `Textarea`, `Checkbox`, `Radio`, `DatePicker`, `DateRangePicker`, `Modal`, `Drawer`, `Toast`, `Card`, `Badge`, `Chip`, `Tabs`, `Accordion`, `Avatar`, `StarRating`, `VerificationBadge`, `PriceTag`, `EmptyState`, `Skeleton`, `Stepper`, `TimelineEscrow`, `FileUpload`, `ImageGallery`, `MapPlaceholder`.

### 9.5 Layout
- **Desktop:** header superior con logo + nav + búsqueda + avatar + campana.
- **Móvil:** header compacto + **bottom nav** con 5 items (Home, Buscar, Chatbot, Chats, Panel).

---

## 10. Criterios de aceptación del prototipo

Para considerar el prototipo completo y listo para validación, debe cumplir:

1. Desplegado en GitHub Pages con URL accesible.
2. Totalmente responsive (móvil, tablet, desktop).
3. Navegación completa sin errores 404 ni rutas rotas.
4. Al menos 20 usuarios mock, 15 servicios mock y 15 herramientas mock como seed data.
5. Login funcional con usuarios demo (un perfil por rol).
6. Flujo completo de contratación de un servicio, desde búsqueda hasta reseña, operable end-to-end con datos mock.
7. Flujo completo de arriendo de una herramienta, idem.
8. Chatbot funcional en modo mock con al menos 5 flujos guionados completos que terminan en una cotización.
9. Componente `<TimelineEscrow />` funcional y visible en cada contratación.
10. Chat 1:1 con respuesta automática simulada.
11. Al menos 3 badges de verificación visibles en perfiles.
12. Persistencia en `localStorage` de: usuario autenticado, conversaciones del chatbot, contrataciones creadas durante la sesión.
13. Vacío bien manejado: estados de "sin resultados", "sin notificaciones", "no tienes publicaciones aún".
14. Formularios con validación visible (Zod + React Hook Form).
15. Tiempo de carga inicial (LCP) menor a 3 s en móvil.

---

## 11. Supuestos y decisiones de diseño

| # | Supuesto | Razón |
|---|---|---|
| S1 | Comisión de plataforma fija del 10% en el MVP | Simplifica la maqueta; configurable en `config/fees.ts` |
| S2 | Un mismo usuario puede tener múltiples roles | Modelo real de negocio |
| S3 | Los datos se pierden al limpiar localStorage | Es un prototipo sin backend |
| S4 | El chatbot mock usa palabras clave para detección de intents | Alternativa realista sin API key pública |
| S5 | Escrow es solo visual — no hay dinero real | Fuera del alcance del MVP |
| S6 | La verificación de identidad es simulada | El flujo real requiere proveedores externos (ej: Didit, Jumio) |
| S7 | Las imágenes de mocks se toman de servicios como unsplash / picsum | Evita licencias |
| S8 | No hay geolocalización real; selección manual de comuna | Simplicidad |

---

## 12. Backlog explícito (fuera del MVP)

A documentar en un archivo `BACKLOG.md` separado, pero listado aquí para referencia:

- Backend real (API REST o GraphQL).
- Autenticación (Auth0 / Clerk / Supabase Auth).
- Base de datos relacional (PostgreSQL) y storage (S3 / Supabase Storage).
- Integración de pagos (Transbank / MercadoPago / Fintoc).
- Escrow real mediante partner financiero.
- Verificación de identidad (Didit, Onfido, Truora).
- Consulta de antecedentes (Registro Civil API / partner).
- Geolocalización con Google Maps / Mapbox.
- Notificaciones push + email transaccional (Resend, SendGrid).
- App móvil nativa (React Native).
- Panel admin real con moderación y gestión de disputas.
- Analytics y métricas de negocio (Mixpanel, PostHog).
- Cumplimiento CMF si aplica (dependiendo del modelo de pagos).
- Seguros opcionales para arriendo de maquinaria.
- Marketplace de materiales de construcción (extensión natural).

---

## 13. Instrucciones para Claude Code

Al recibir este documento, ejecutar en orden:

1. **Inicializar el proyecto** con Vite + React + TypeScript + Tailwind CSS.
2. **Configurar** React Router (HashRouter), Zustand, React Hook Form + Zod, Lucide React.
3. **Crear la estructura de carpetas** descrita en 3.4.
4. **Generar mocks** con los esquemas de la sección 5. Mínimo 20 usuarios, 15 servicios, 15 herramientas.
5. **Implementar el design system** base (sección 9).
6. **Montar el layout** con header, footer (desktop) y bottom-nav (móvil).
7. **Implementar módulos en este orden de prioridad:**
   1. Autenticación y perfiles (M1, M2).
   2. Búsqueda y detalles (M3, M4).
   3. Chatbot (M6) — prioridad alta según decisión del producto.
   4. Contratación y escrow (M5).
   5. Chat (M7).
   6. Reseñas (M8) y notificaciones (M9).
8. **Configurar despliegue** a GitHub Pages vía GitHub Actions (`.github/workflows/deploy.yml`).
9. **Documentar en `README.md`** cómo ejecutar localmente y cómo cambiar el modo del chatbot.

Al término, verificar los criterios de aceptación de la sección 10.

---

*Fin del documento.*

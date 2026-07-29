# Salchimonster — Control de Facturas

Aplicación PWA para gestión de ventas, inventario y caja.
Stack: **React 18 + Vite + Firebase + Zustand**

---

## 🚀 Inicio rápido

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo
npm run dev

# 3. Abrir en el navegador
# http://localhost:5173
```

## 🏗️ Estructura del proyecto

```
src/
├── firebase/
│   ├── config.js          # Inicialización Firebase
│   └── collections.js     # Referencias a colecciones Firestore
│
├── utils/
│   ├── constants.js       # Precios, constantes de negocio
│   ├── format.js          # Formateo de moneda y fechas
│   └── excel.js           # Exportación a Excel
│
├── hooks/
│   └── useAuth.js         # Hook de autenticación Firebase
│
├── services/              # 📐 LÓGICA DE NEGOCIO
│   ├── facturasService.js     # CRUD facturas, gastos, empleados, compras + cálculos
│   ├── granizadosService.js   # CRUD granizados, micheladas, limonadas + cálculos
│   ├── historialService.js    # Guardar día, historial, eliminar registros
│   ├── inventarioService.js   # CRUD categorías, productos, ingresos de stock
│   ├── menuService.js         # CRUD platos del menú
│   └── usuariosService.js     # CRUD usuarios Firebase Auth + Firestore
│
├── store/                 # 🗂️ ESTADO GLOBAL (Zustand)
│   ├── useAppStore.js         # Auth, tab activo, modo prueba, bloqueo del día
│   ├── useFacturasStore.js    # Facturas, gastos, empleados, compras
│   ├── useGranizadosStore.js  # Granizados, micheladas, limonadas
│   └── useInventarioStore.js  # Inventario y categorías
│
├── components/            # 🧩 COMPONENTES REUTILIZABLES
│   ├── ui/
│   │   ├── Modal.jsx      # Modal slide-up genérico
│   │   └── Card.jsx       # Tarjeta, StatBox, EmptyMsg
│   └── layout/
│       ├── TopBar.jsx     # Barra superior
│       └── TabNav.jsx     # Navegación por pestañas
│
├── views/                 # 📄 VISTAS (una por módulo)
│   ├── LoginView.jsx
│   ├── FacturasView.jsx
│   ├── GastosView.jsx
│   ├── EmpleadosView.jsx
│   ├── CajaView.jsx
│   ├── ResumenView.jsx
│   ├── HistorialView.jsx
│   ├── UsuariosView.jsx
│   ├── GranizadosView.jsx
│   ├── MenuView.jsx
│   └── InventarioView.jsx
│
├── styles/
│   └── global.css         # Estilos globales
│
├── App.jsx                # Componente raíz + setup de listeners Firestore
└── main.jsx               # Entry point React
```

## 🔑 Variables de entorno

El archivo `.env` ya contiene la configuración de Firebase.
**No lo subas a Git** (está en `.gitignore`).

## 📦 Despliegue

```bash
# Build de producción
npm run build

# El output queda en /dist — listo para Firebase Hosting, Vercel, Netlify, etc.
```

## 🧩 Agregar un nuevo módulo

1. Crear `src/services/nuevoModuloService.js` con la lógica Firestore
2. Crear `src/store/useNuevoModuloStore.js` si necesita estado global
3. Crear `src/views/NuevoModuloView.jsx`
4. Agregar la suscripción en `App.jsx`
5. Agregar el tab en `TabNav.jsx` y la vista en el array `VIEWS` de `App.jsx`

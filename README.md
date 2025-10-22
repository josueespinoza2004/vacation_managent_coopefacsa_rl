# Sistema de Gestión de Vacaciones - Coopefacsa R.L

Sistema completo de gestión de vacaciones para la Cooperativa de Ahorro y Crédito San Antonio (Coopefacsa R.L).

## Características

### Para Administradores (Recursos Humanos)

- **Panel de Inicio**: Vista general con estadísticas, cumpleaños del mes y calendario de vacaciones
- **Panel de Vacaciones**: Lista completa de colaboradores con días acumulados, utilizados y pendientes
- **Gestión de Solicitudes**: Aprobar o rechazar solicitudes con capacidad de definir días específicos
- **Cumpleaños**: Asignar días libres por cumpleaños sin afectar días acumulados
- **Notificaciones**: Sistema de notificaciones cuando empleados solicitan vacaciones
- **Equipo**: Directorio completo del personal
- **Presencia**: Control de asistencia diaria

### Para Empleados

- **Dashboard Personal**: Ver días acumulados (2.5 días/mes), utilizados y pendientes
- **Solicitar Vacaciones**: Formulario para solicitar días de vacaciones
- **Mis Solicitudes**: Historial completo de solicitudes con estados
- **Calendario Personal**: Vista de vacaciones programadas y pendientes

## Diseño

- **Tipografía**: EB Garamond (similar a Perpetua del manual de identidad)
- **Colores**: Paleta oficial de Coopefacsa R.L
  - Navy Blue (#1e2f5c) - Color primario
  - Royal Blue (#0052cc) - Color secundario
  - Cyan (#00b8e6) - Acento
  - Green (#3eb800) - Éxito
  - Yellow (#ffde00) - Advertencia
  - Orange-Red (#ff5722) - Peligro

## Estructura del Proyecto

\`\`\`
app/
├── admin/              # Rutas para administradores (RRHH)
│   ├── page.tsx       # Dashboard principal
│   ├── panel/         # Panel de vacaciones
│   ├── solicitudes/   # Gestión de solicitudes
│   ├── equipo/        # Directorio de equipo
│   └── presencia/     # Control de asistencia
├── employee/          # Rutas para empleados
│   ├── page.tsx       # Dashboard personal
│   ├── solicitudes/   # Mis solicitudes
│   └── calendario/    # Calendario personal
components/
├── admin/             # Componentes específicos de admin
│   ├── birthday-card.tsx
│   ├── notification-badge.tsx
│   └── approve-dialog.tsx
├── employee/          # Componentes específicos de empleados
│   └── vacation-request-form.tsx
├── dashboard/         # Componentes compartidos
│   ├── stat-card.tsx
│   ├── vacation-calendar.tsx
│   └── employee-list.tsx
└── layout/
    └── sidebar.tsx    # Navegación lateral
\`\`\`

## Cómo Usar

### Acceso al Sistema

1. **Administradores (RRHH)**: Acceder a `/admin`
2. **Empleados**: Acceder a `/employee`

### Flujo de Trabajo

#### Para Empleados:
1. Ver días acumulados en el dashboard
2. Hacer clic en "Nueva Solicitud"
3. Completar formulario con fechas y días deseados
4. Enviar solicitud
5. Esperar aprobación de RRHH

#### Para Administradores:
1. Recibir notificación de nueva solicitud
2. Ir a "Solicitudes" en el menú
3. Revisar solicitud pendiente
4. Hacer clic en "Aprobar" para definir días exactos
5. O hacer clic en "Rechazar" si no procede

#### Gestión de Cumpleaños:
1. Ver cumpleaños del mes en el dashboard
2. Hacer clic en "Asignar Libre" para dar el día libre
3. Este día NO afecta los días acumulados de vacaciones

## Tecnologías

- **Framework**: Next.js 15 (App Router)
- **Estilos**: Tailwind CSS v4
- **Componentes**: shadcn/ui
- **Tipografía**: EB Garamond (Google Fonts)
- **Iconos**: Lucide React

## Próximos Pasos

Para implementación en producción:

1. **Base de Datos**: Integrar con Supabase o Neon para persistencia de datos
2. **Autenticación**: Implementar sistema de login con roles (admin/employee)
3. **API**: Crear endpoints para CRUD de solicitudes, empleados y vacaciones
4. **Notificaciones**: Implementar notificaciones en tiempo real
5. **Reportes**: Generar reportes en Excel como los mostrados en las referencias
6. **Email**: Enviar emails de confirmación de solicitudes

## Notas

- Todos los datos actuales son de demostración (mock data)
- La acumulación es de 2.5 días por mes para todos los empleados
- Los cumpleaños se gestionan por separado y no afectan días acumulados
- El sistema está diseñado siguiendo el manual de identidad de Coopefacsa R.L

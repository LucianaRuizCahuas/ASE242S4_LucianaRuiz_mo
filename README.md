# Angoma Tours Movil

Aplicacion movil desarrollada con React Native y Expo para gestionar paquetes turisticos, clientes y reservas conectadas a un backend propio.

## Criterios cubiertos

- Login funcional con validacion de usuario y clave. Usa `/auth/login` del backend y mantiene una credencial demo `admin / 1234` para exposicion.
- CRUD maestro de clientes: registro, listado activo/eliminado, edicion, eliminacion logica, restauracion, busqueda y validaciones.
- CRUD maestro de tours: registro, listado activo/eliminado, edicion, eliminacion logica, restauracion, geolocalizacion, ruta en Maps y cupos disponibles.
- Tabla transaccional de reservas: enlaza cliente + tour, calcula total, valida cupos y envia la reserva al backend.
- Funcionalidad avanzada: GPS, rutas en Google Maps, busqueda inteligente e historial de consultas.

## Backend

La URL base se configura en `app/service/apiConfig.ts`.

Por defecto:

```bash
http://192.168.1.53:8086/v1/api
```

Tambien puedes cambiarla sin tocar codigo:

```bash
EXPO_PUBLIC_API_URL=http://TU-IP:8086/v1/api npx expo start
```

## Endpoints esperados

- `POST /auth/login`
- `GET /customer/state/{true|false}`
- `POST /customer`
- `PUT /customer/{id}`
- `PATCH /customer/delete/{id}`
- `PATCH /customer/restore/{id}`
- `GET /tour-packages/state/{A|I}`
- `POST /tour-packages`
- `PUT /tour-packages/{id}`
- `PATCH /tour-packages/delete/{id}`
- `PATCH /tour-packages/restore/{id}`
- `GET /reservations/state/{A|I}`
- `POST /reservations`
- `PATCH /reservations/delete/{id}`
- `PATCH /reservations/restore/{id}`

## Ejecutar

```bash
npm install
npx expo start
```

Para web:

```bash
npx expo start --web --port 8081
```

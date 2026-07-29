# Gestión de viajes

Sistema de gestión de reservas y clientes para un negocio de venta de paquetes de viaje.

Proyecto desarrollado como parte del trabajo de grado (modalidad Sistematización de experiencia) del programa Tecnología en Desarrollo de Software, IU Digital de Antioquia.

## Estado

En desarrollo. Módulos y base de datos son una propuesta inicial, sujeta a ajuste tras validar los requerimientos reales del negocio.

## Stack

- Java 17
- Spring Boot 3
- MySQL
- Maven

## Módulos planeados

- Autenticación
- Clientes
- Paquetes / destinos
- Reservas
- Pagos
- Panel de resumen

## Cómo ejecutar

1. Crear la base de datos en MySQL y ajustar `src/main/resources/application.properties`
2. `mvn spring-boot:run`

## Ver también

`DEVLOG.md` contiene el registro de decisiones y aprendizajes del proceso de desarrollo.

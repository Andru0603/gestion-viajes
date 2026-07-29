# Bitácora de desarrollo

Registro de decisiones, problemas y aprendizajes durante el desarrollo del proyecto. Esta bitácora es la base del documento de Sistematización de experiencia.

---

## 28 de julio de 2026

El día de hoy arranqué el repositorio y la estructura base del proyecto en Spring Boot. Definí una primera propuesta de módulos (autenticación, clientes, paquetes, reservas, pagos, panel) y el esquema inicial de base de datos, basada en cómo suelen funcionar los negocios de venta de viajes en general

Todavía no he hablado con la dueña del negocio real sobre cómo maneja hoy sus reservas y pagos, así que este diseño es un punto de partida, no la versión final. La conversación está programada para los próximos días.

Decisión: preferí tener algo concreto montado antes de esa conversación, para poder mostrarle ideas en vez de partir de una hoja en blanco

Próximo paso: hablar con ella y ajustar módulos y tablas según lo que cuente

## 28-29 de julio de 2026

Configuré el repositorio en GitHub. Al hacer el primer push, la estructura quedó anidada en una carpeta extra, en vez de los archivos en la raíz

Diagnóstico: el commit se había hecho un nivel de carpeta más arriba de donde debía. Solución: identifiqué la carpeta correcta (donde estaban pom.xml y README.md sueltos), reinicié el repositorio ahí mismo, y reemplacé el push anterior con --force, ya que era mi propio repositorio recién creado

Aprendizaje: verificar siempre, antes de un git init, que estoy parado exactamente en la carpeta raíz del proyecto, revisando con ls o dir. Es un error común pero fácil de prevenir
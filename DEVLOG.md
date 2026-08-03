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

## 29 de julio de 2026

Agregué las clases de entidad en Java (JPA) para las 5 tablas: Usuario, Cliente, Paquete, Reserva y Pago. Cada una mapea directamente a su tabla en MySQL, y Reserva y Pago ya incluyen las relaciones hacia las demás tablas (una reserva pertenece a un cliente y a un paquete; un pago pertenece a una reserva).

Decisión: dejé que Hibernate genere las tablas automáticamente a partir de estas clases (ddl-auto=update), en vez de ejecutar el schema.sql a mano. Así evito mantener dos fuentes de verdad para la misma estructura.

Próximo paso: crear la base de datos vacía en MySQL y correr el proyecto por primera vez para confirmar que las tablas se generan bien.

## 29 de julio de 2026

Sesión larga de configuración del entorno para correr el proyecto por primera vez. Resolví varios problemas en cadena:

1. Maven no estaba instalado. Lo instalé manualmente y tuve que reiniciar VS Code por completo para que reconociera el cambio en el PATH.
2. La conexión a MySQL 8.4 fallaba con un error confuso de Hibernate. La causa real era que mi instancia corre en el puerto 6033, no el 3306 por defecto, y necesitaba parámetros adicionales en la URL de conexión por el método de autenticación de MySQL 8.4.
3. Mientras probaba cambios en application.properties, parecían "borrarse solos". La causa era confusión entre el archivo real en src y la copia que Maven genera en target en cada build.

Al final, Hibernate creó las 5 tablas automáticamente con sus llaves foráneas. Aprendizaje: los errores de Hibernate rara vez muestran la causa real en el primer mensaje, hay que leer las causas encadenadas de abajo hacia arriba.

## 30 de julio de 2026

Tuve la conversación real con mi suegra sobre su negocio. Esto confirmó algunas cosas del diseño inicial y cambió otras.

Confirmado: sigue todo en WhatsApp y cuadernos, sin ningún sistema digital. Sí maneja abonos y pagos parciales.

Cambios que no había contemplado:
- No trabaja directo con aerolíneas ni hoteles, sino a través de varias agencias mayoristas (Viassa, Hoteles y Destinos, Destino y Prestigio, On Vacation, The Best). Esto significó agregar una entidad Proveedor que no existía en el diseño original.
- Vende tanto viajes aéreos como terrestres en bus, algo que el diseño original no distinguía.
- El mayor punto de dolor no es la desorganización general, sino la digitación exacta de nombres: un error tipográfico genera un cobro de la aerolínea. Esto no cambió la base de datos hoy, pero marca una prioridad clara para cuando construya el formulario de clientes.
- El precio de una reserva no es fijo por paquete, varía según cuándo se reserve y con qué proveedor, así que agregué un precio total directo en la reserva en vez de depender solo del precio base del paquete.

Decisión: actualicé las clases Paquete y Reserva, y agregué Proveedor, en vez de rediseñar todo desde cero.

Aprendizaje: el diseño inicial basado en suposiciones generales fue un punto de partida razonable, pero la conversación real con la usuaria fue la que reveló los detalles que de verdad importan para que la herramienta sea útil.

## 1 de agosto de 2026 temprano

Al probar el endpoint de pagos, el servidor devolvía un error 500 sin explicación clara desde PowerShell. El detalle real estaba en los logs del servidor: Jackson (la libreria que convierte objetos Java a JSON) no sabía cómo manejar los "proxies" que crea Hibernate para las relaciones cargadas de forma perezosa (lazy).

Solución: agregué la librería jackson-datatype-hibernate6 y una clase de configuración que le enseña a Jackson a reconocer esos proxies y, en vez de fallar, mostrar solo el id del objeto relacionado si no fue cargado completo.

Aprendizaje: cuando un endpoint falla con un error genérico, el mensaje útil casi nunca está en la respuesta que ve el cliente, está en la consola del servidor. Este es un problema bien conocido en el ecosistema Spring Boot, no algo que hice mal por inexperiencia.



## 1 de agosto de 2026 (continuación)

Completé los repositorios y controladores REST para las 5 entidades del negocio (clientes, paquetes, proveedores, reservas, pagos), con crear, listar, editar y borrar para cada una.

Decisión técnica: en Reserva y Pago, que dependen de otras entidades, el controlador busca esos registros por su id en la base de datos antes de guardar, en vez de confiar directamente en lo que llega en la petición. Esto evita inconsistencias si algo llega mal formado.

También me detuve a pensar en algo no técnico: si usar IA como apoyo en el desarrollo compromete la autenticidad de este trabajo de grado. Concluí que lo que importa no es que cada línea la haya escrito yo a mano, sino que entienda lo que hay aquí y pueda explicarlo. Queda pendiente confirmar con la institución si existe alguna política formal sobre esto.

Aprendizaje: escribir el mismo patrón (repositorio + controlador) cinco veces seguidas hizo que dejara de sentirse como copiar y empezara a sentirse como reconocer una estructura repetible, que es distinto.

## 2 de agosto de 2026

Construí la interfaz web completa: cinco secciones, cada una con su formulario y su tabla, conectadas a la API con JavaScript, sin frameworks adicionales.

Decisión de diseño: en vez de un panel administrativo genérico, usé el lenguaje visual de tiquetes y manifiestos de viaje. No fue solo estético: el campo de nombre del cliente tiene una nota visual que recuerda que debe coincidir exacto con el documento, un recordatorio directo del hallazgo más importante de la conversación con la dueña del negocio.

Aprendizaje: diseñar a partir del hallazgo real de la usuaria, y no de una plantilla genérica, hizo que una decisión de diseño tuviera una razón de ser concreta, en vez de ser solo decoración.

## 2 de agosto de 2026 (continuación)

Agregué dos piezas que faltaban para que el sistema fuera realmente usable: cambiar el estado de una reserva sin borrarla y recrearla, y un sistema de inicio de sesión con contraseñas cifradas.

Decisión consciente: para simplificar el inicio de sesión, desactivé una protección llamada CSRF, que importa más en aplicaciones expuestas a internet con muchos usuarios. Mientras el sistema corra en mi computador o en la red de mi suegra, el riesgo real es bajo, pero si algún día lo despliego en internet tengo que revisar esto de nuevo. Lo documento para que quede claro que fue una decisión, no un descuido.

Aprendizaje: no todas las decisiones técnicas tienen una única respuesta correcta, muchas son sobre qué riesgo es razonable asumir en el contexto específico del proyecto.

## 2 de agosto de 2026 (definición del eje)

Trabajé en definir el eje de sistematización, en vez de dejarlo implícito. Descubrí que "sistematización de experiencias" no es un término inventado por la IUD, sino una metodología con trayectoria en educación popular latinoamericana, desarrollada principalmente por Oscar Jara, con una estructura reconocida de "cinco tiempos": punto de partida, preguntas iniciales (el eje), recuperación del proceso vivido, reflexión de fondo y puntos de llegada.

Definí el eje como: cómo se construye conocimiento real, tanto sobre lo que el usuario necesita como sobre el código que uno produce con ayuda de IA, al desarrollar una herramienta para un negocio familiar. Elegí la versión combinada en vez de quedarme con uno solo de los dos hilos, porque ambos aparecieron en el mismo proceso real y se sostienen mejor juntos que separados.

Aprendizaje: tener un eje claro no es un trámite de redacción, cambia qué se vuelve relevante contar y qué se puede dejar de lado. Sin él, la recuperación del proceso corre el riesgo de ser solo una lista de cosas que pasaron.

## 2 de agosto de 2026 (continuación — cambio de contraseña y edición completa)

Agregué la posibilidad de cambiar la contraseña ya autenticado, y edición sin borrar para clientes, paquetes y proveedores, que antes solo se podían crear o eliminar.

Decisión motivada directamente por el hallazgo de la usuaria: si el error más costoso es un nombre mal escrito, no tenía sentido que la única forma de corregirlo fuera borrar el cliente completo y recrearlo, sobre todo si ya tenía una reserva asociada.

También revisé, sin resolver todavía, el riesgo de haber desactivado la protección CSRF de Spring Security. Es razonable mientras el sistema corra en local, pero queda como pendiente explícito antes de pensar en desplegarlo a internet para uso real de mi suegra.

Aprendizaje: revisar las decisiones técnicas anteriores a la luz de lo que realmente le importa al usuario fue lo que hizo evidente qué faltaba, más que seguir una lista genérica de funcionalidades "típicas" de un CRUD.

## 2 de agosto de 2026 (continuación — organización del trabajo)

La conversación con Claude llevaba ya varias semanas de desarrollo continuo y empezó a chocar seguido con el límite de mensajes de una sola sesión. En vez de seguir ahí indefinidamente, decidí migrar el trabajo a un Proyecto de Claude, con un documento resumen del estado del proyecto y unas instrucciones personalizadas, para que cualquier chat nuevo pueda retomar el contexto sin reconstruir todo desde cero.

Aprendizaje: la forma de trabajar con una herramienta de IA en un proyecto largo también es una decisión de proceso, no solo un detalle logístico. Documentar cómo se organizó ese trabajo es parte legítima de la experiencia que se está sistematizando, no algo aparte de ella.
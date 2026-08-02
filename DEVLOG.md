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

## 1-2 de agosto de 2026

Al probar el endpoint de pagos, el servidor devolvía un error 500 sin explicación clara desde PowerShell. El detalle real estaba en los logs del servidor: Jackson (la libreria que convierte objetos Java a JSON) no sabía cómo manejar los "proxies" que crea Hibernate para las relaciones cargadas de forma perezosa (lazy).

Solución: agregué la librería jackson-datatype-hibernate6 y una clase de configuración que le enseña a Jackson a reconocer esos proxies y, en vez de fallar, mostrar solo el id del objeto relacionado si no fue cargado completo.

Aprendizaje: cuando un endpoint falla con un error genérico, el mensaje útil casi nunca está en la respuesta que ve el cliente, está en la consola del servidor. Este es un problema bien conocido en el ecosistema Spring Boot, no algo que hice mal por inexperiencia.
# MiFinanza

Proyecto inicial "MiFinanza" — estructura base de un portal para registrar movimientos financieros.

Contenido creado:

- `index.html` — Interfaz HTML5 semántica (header, main, section, footer) con formulario, tabla de movimientos y área de resumen.
- `css/style.css` — Estilos básicos (paleta suave, tipografía Poppins, layout con Grid/Flexbox, responsive).
- `js/app.js` — Archivo JS listo para añadir lógica (por ahora vacío según instrucciones).
- `assets/img/` — Carpeta para imágenes (placeholder `.gitkeep`).
- `assets/icons/` — Carpeta para iconos (placeholder `.gitkeep`).
- `docs/` — Carpeta para documentación (placeholder `.gitkeep`).

Cómo abrir el proyecto localmente:

1. Abrir `index.html` en un navegador moderno.
2. Si prefieres, iniciar un servidor local (recomendado para evitar restricciones de CORS/recursos):

   - Con Python 3: `python -m http.server 5500` (desde la carpeta `MiFinanza`).
   - Con VS Code: abrir la carpeta y usar extensiones tipo Live Server.

Notas:
- Por instrucción, no se agregó funcionalidad JS todavía; el botón de agregar está deshabilitado y la tabla contiene una fila indicativa.
- Siguientes pasos sugeridos: implementar la lógica JS para agregar/editar/eliminar movimientos y actualizar el saldo.

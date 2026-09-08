# Calculadora Web

Calculadora web implementada con HTML, CSS y JavaScript sin dependencias externas.

## Características

- **Pantalla de dos niveles**:
  - Superior: Muestra la expresión aritmética acumulada.
  - Inferior: Muestra la entrada actual y el resultado del cálculo.
- **Evaluación aritmética**:
  - Implementación interna con precedencia de operadores (`*` y `/` antes de `+` y `-`).
  - Sin uso de `eval()`.
  - Soporte para signos negativos unarios y operaciones encadenadas.
  - Manejo de división por cero (`Error`).
  - Redondeo de precisión a 10 decimales y formato exponencial a partir de 10¹².
- **Ajuste visual**:
  - Reducción del tamaño de fuente según la longitud del texto.
  - Desplazamiento horizontal para evitar desbordamiento en cadenas largas.
  - Sustitución de operadores al pulsar dos consecutivos.
- **Soporte de teclado físico**:
  - Números: `0` – `9`
  - Operadores: `+`, `-`, `*`, `/`
  - Decimal: `.` y `,`
  - Calcular: `Enter` o `=`
  - Borrar último carácter: `Backspace`
  - Limpiar: `Escape` o `C`
- **Accesibilidad**:
  - Uso de `<output>` con `aria-live="polite"`.
  - Atributos `aria-label` en cada control.

## Estructura de archivos

```
├── index.html   # Marcado y accesibilidad
├── style.css    # Distribución en CSS Grid y estilos
├── app.js       # Tokenizador, evaluador y manejo de eventos
└── README.md    # Documentación del proyecto
```

## Ejecución

Abrir el archivo `index.html` en cualquier navegador web. No requiere servidor local ni dependencias de instalación.

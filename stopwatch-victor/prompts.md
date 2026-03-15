# Prompts utilizados

## Chatbot: Claude (Sonnet)

### Prompt 1
```bash

## Rol del agente:
Eres un experto en desarrollo frontend que aplica de manera ideal las buenas practicas del ECMAScript moderno.

## Contexto:
Vas a crear una pagina que contenga un **cronómetro y cuenta atrás**.

## Archivos actuales:
Adjuntare la imagen que usaras de guia para implementar la solución.

Tenemos estos archivos base:
- index.html (estructura básica)
- script.js (lógica en JS)

## Requisitos:
1. Implementar una interfaz que permita alternar entre modo Cronómetro (hacia adelante) y Cuenta atrás (hacia atrás).

## Requerimientos específicos:
Display: El tiempo debe mostrarse en formato HH:MM:SS. Los milisegundos (000) deben aparecer en una fuente más pequeña en la esquina inferior derecha del recuadro del display.

Lógica de Cuenta Atrás: Al seleccionar este modo, el usuario debe poder ingresar el tiempo inicial

## Entregable:
Proporciona el código completo actualizado de:
- index.html
- script.js
- styles.css (nuevo archivo para modernizar la forma en la que se ve la interfaz)

## Notas adicionales:
- El código debe ser compatible con navegadores modernos
- Incluir comentarios explicativos en secciones clave
- Mantener buenas prácticas de accesibilidad
```

### Prompt 2
```bash
## Resultado: 
La logica generada es correcta, sin embargo, necesito que el diseño sea idéntico a la imagen que te adjunto (stopwatch.png). El estilo actual es demasiado moderno y el ejercicio requiere fidelidad visual con la referencia.

## Cambios necesarios:
1. Usa los colores exactos: fondo del display azul muy pálido, botones verde y rojo sólidos.

2. Aplica bordes negros gruesos y esquinas redondeadas (estilo flat/retro).

3. El formato del tiempo debe ser grande y centrado, con los milisegundos pequeños en la esquina inferior derecha del recuadro, tal cual se ve en la imagen.

4. Asegúrate de que los botones 'Start' y 'Clear' tengan esa estética simple y tipografía clara.

## Nota adicional:
Actualiza el styles.css y ajusta el index.html si es necesario para que la estructura coincida.
```
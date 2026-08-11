# Te lo compro

Landing page de [telocompro.com.co](https://telocompro.com.co). Suscripción de frutas
y verduras compradas la misma madrugada en las plazas de Barranquilla y entregadas
en casa antes de las 11 a.m.

> Nosotros madrugamos por ti.

## Correr en local

Es un sitio estático: no hay build, no hay dependencias que instalar.

```bash
python -m http.server 5173
```

Y abrir <http://localhost:5173>.

## Estructura

```
index.html          Toda la página. El sprite de íconos va embebido.
assets/styles.css   Sistema visual completo: tokens, modo claro y oscuro, secciones.
assets/main.js      Revelado por scroll, menú, tablero de exclusión, carrusel.
fonts/              Bricolage Grotesque e Instrument Sans, auto-hospedadas.
img/web/            Imágenes optimizadas en webp. Es lo único que sirve el sitio.
```

## Sistema visual

La paleta sale del manual de marca y no se improvisa:

| Color | Hex | Rol |
|---|---|---|
| Rojo Carnaval | `#ED0505` | Superficie de marca y botón principal |
| Blanco | `#FFFFFF` | Único color de texto admitido sobre el rojo |
| Verde | `#79E95F` | Forma y superficie. Nunca tipografía sobre fondo claro |
| Amarillo mango | `#F1BA4B` | Forma y superficie. Nunca tipografía sobre fondo claro |
| Vinotinto | `#6F1616` | Todo el texto sobre fondos claros, verdes o amarillos |
| Crema | `#FFF8F0` | Fondo de las secciones de lectura |

Dos modos de aplicación: **Carnaval** (rojo dominante) en el hero y el cierre,
**Producto** (crema) en las secciones donde el usuario lee y decide.

Reglas que el CSS respeta y conviene no romper:

- Blanco sobre `#ED0505` da 4,55:1, justo el mínimo AA. Cualquier blanco
  translúcido sobre rojo baja de 4,5, así que sobre rojo no se usan opacidades.
- El verde y el amarillo son forma, nunca tipografía sobre fondo claro.
- Como el rojo es la marca, el rojo ya no puede significar error: los estados se
  codifican con ícono más texto.
- Un solo sistema de radios: interactivo en píldora, contenedor 24 px, medios 18 px.

Verificado en modo claro y oscuro sin fallas de contraste WCAG AA.

## Imágenes

`img/web/*.webp` son versiones derivadas y optimizadas. Los originales están
fuera del repositorio (ver `.gitignore`) porque pesan unos 45 MB.

Varios recortes de producto venían con el tablero de ajedrez pintado en los
píxeles y el canal alfa opaco, así que el alfa se reconstruyó detectando el
fondo neutro conectado al borde. Si hay que regenerar una imagen, el original
debe volver a pasar por ese proceso antes de publicarse.

## Pendiente antes de publicar comercialmente

Los precios de los add-ons son de referencia. Según la especificación de negocio
hay que validarlos contra SIPSA-DANE, y confirmar el supuesto de costo de
mercancía, antes de anunciarlos en firme.

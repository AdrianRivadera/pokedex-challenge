# Pokédex

Aplicación de Pokédex construida sobre [PokeAPI](https://pokeapi.co). Permite explorar el
listado completo con scroll infinito, filtrar por nombre, tipo y generación, ver el detalle
de cada pokémon, armar un equipo de favoritos que persiste entre sesiones y comparar los
stats de dos pokémon.

**Demo:** [pokedex-challenge-nu.vercel.app](https://pokedex-challenge-nu.vercel.app)

## Stack

| Tecnología | Versión |
| --- | --- |
| React | 18.3 |
| Vite | 5.4 |
| Redux Toolkit + RTK Query | 2.12 |
| redux-persist | 6.0 |
| React Router | 6.30 |
| Formik + Yup | 2.4 / 1.7 |
| CSS Modules | nativo de Vite |

JavaScript, sin TypeScript.

## Instalación y ejecución

Requiere Node.js 18 o superior.

```bash
git clone https://github.com/AdrianRivadera/pokedex-challenge.git
cd pokedex-challenge
npm install
```

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo en `http://localhost:5173` |
| `npm run build` | Build de producción en `dist/` |
| `npm run preview` | Sirve el build de producción localmente |
| `npm run lint` | ESLint sobre todo el proyecto |

## Estructura

```
src/
├── app/store.js              Store, persistencia y configuración de middleware
├── components/               Componentes transversales (skeleton, imagen progresiva, etc.)
├── features/
│   ├── compare/              Formulario de comparación (Formik + Yup)
│   ├── favorites/            Slice del equipo y vista "Mi Equipo"
│   ├── filters/              Buscador con debounce y panel de filtros
│   ├── pokemon/              API de RTK Query, listado, card y detalle
│   └── toasts/               Slice y contenedor de notificaciones
└── routes/AppRouter.jsx      Definición de rutas
```

La organización es por *feature* y no por tipo de archivo: cada carpeta agrupa su slice, sus
componentes y sus estilos. Con este tamaño de proyecto la diferencia es menor, pero mantiene
junto lo que se toca junto.

## Decisiones técnicas

### Cache

Todas las llamadas pasan por un único `createApi` (`src/features/pokemon/pokemonApi.js`) con
seis endpoints: listado paginado, detalle, listado completo de nombres, pokémon por tipo,
pokémon por generación y catálogo de tipos.

**`keepUnusedDataFor: 3600`.** El valor por defecto de RTK Query es 60 segundos, pensado para
datos que cambian. Los de PokeAPI son estáticos: un pokémon no cambia sus stats ni sus tipos.
Subirlo a una hora significa que navegar al detalle de un pokémon y volver al listado no
dispara ninguna request nueva, y que el buscador reutiliza el listado completo de nombres que
ya se había traído.

**Tags.** Los endpoints declaran `providesTags` (`Pokemon` y `PokemonDetail` con id por
pokémon), de modo que el cache queda etiquetado y es invalidable de forma selectiva. No hay
`invalidatesTags` porque PokeAPI es de solo lectura y la app no define ninguna mutation: no
existe una operación de escritura que deba forzar el refetch. La infraestructura queda lista,
pero declarar una invalidación que nada dispara sería código muerto.

### Persistencia

El store combina tres reducers y **solo dos se persisten**, cada uno con su propia
configuración (`src/app/store.js`):

- `pokemonApi`: el cache de RTK Query, para que la app siga mostrando datos sin conexión y
  sobreviva al refresh.
- `favorites`: el equipo, que es el dato que más molesta perder.
- `toasts`: **no se persiste**. Son mensajes que duran 2,5 segundos; rehidratar un toast
  viejo al abrir la app sería un bug, no una feature.

Sobre el cache persistido hay tres decisiones que vale la pena explicar:

**1. Se recorta lo que se guarda.** El detalle que devuelve PokeAPI pesa mucho: `moves`,
`game_indices`, `forms` y `held_items` suman la mayor parte de la respuesta y la UI no los
usa. El `createTransform` de `store.js` guarda solo los campos que se leen (id, nombre,
altura, peso, tres sprites, tipos, habilidades y stats). Sin esto se llega al límite de
~5 MB de `localStorage` con relativamente pocos pokémon visitados.

**2. Se limita la cantidad.** Aun recortados, persistir cientos de detalles no tiene sentido:
se guardan los 80 más recientes por `fulfilledTimeStamp`, y solo los que están en estado
`fulfilled` (una query a mitad de camino no aporta nada al rehidratar).

**3. Se agrupan las escrituras.** `throttle: 1000` en la config de persistencia. El cache de
RTK Query cambia en cada card que entra en pantalla; sin throttle, cada una de esas acciones
serializaría el store entero a `localStorage`, que es una operación síncrona y bloquea el
hilo principal justo mientras el usuario scrollea.

La rehidratación se resuelve con `PersistGate` en `src/main.jsx`, que retrasa el render hasta
que el estado guardado volvió al store. Se usa `loading={null}` porque leer de `localStorage`
es prácticamente instantáneo y un spinner intermedio genera más parpadeo que otra cosa.

**`serializableCheck` e `immutableCheck` desactivados.** Son dos middlewares de desarrollo que
recorren el estado completo en cada acción. Con el cache del listado cargado, ese recorrido
domina el tiempo de render y hace que el scroll se sienta trabado. La contrapartida es perder
la advertencia temprana ante un valor no serializable; se acepta porque todo lo que entra al
store viene de `JSON` de la API o son strings propios.

### Filtros en la URL

`useSearchParams` es la única fuente de verdad de los filtros: no hay `useState` paralelo para
texto, tipo o generación. Un filtro aplicado es una URL compartible, el botón de atrás del
navegador funciona como se espera, y no existe la posibilidad de que el estado local y la URL
queden desincronizados.

### Dos modos de listado

El listado funciona distinto según haya filtros activos o no, porque el problema es distinto:

- **Sin filtros:** paginado real contra la API, de a 20, con `IntersectionObserver` sobre la
  última card. Nunca se piden datos que el usuario no va a ver.
- **Con filtros:** PokeAPI no permite combinar tipo + generación + texto en una sola query, así
  que se traen las listas completas (que son solo nombres, livianas) y se intersectan en
  cliente. Esa lista filtrada se revela también de a 20 con el mismo observer: montar las
  cientos de cards de un filtro amplio de una sola vez dispararía cientos de requests de
  detalle simultáneas y congelaría el navegador.

### Otros

**Debounce de 300 ms** en el buscador (`SearchBar.jsx`): el input se actualiza en cada tecla
para que no haya lag visual, pero el filtro recién se aplica cuando el usuario deja de
escribir.

**Indicador de cache vs. fresco.** Cada card muestra 💾 o 🌐 según el dato haya salido del
cache rehidratado o de la red. Se resuelve con el inicializador diferido de `useState`, que
corre una única vez en el primer render: si en ese momento la query ya tiene datos
(`isLoading === false`), salieron del cache.

**CSS Modules** en lugar de Styled Components, para mantener el CSS como CSS y evitar el costo
en runtime. El diseño es responsive desde 360 px, con grillas `auto-fill` que no dependen de
breakpoints para acomodar las cards.

## Mejoras futuras

- **Tests.** Es el bonus de la consigna. El orden de prioridad sería: los reducers de
  `favorites` (el límite de 6 y el reordenamiento), el debounce del buscador y el transform
  de persistencia, que son las tres piezas con lógica propia y sin dependencia del DOM.
- **Comparación con gráfico.** La consigna lo menciona como opcional. Un radar de los seis
  stats comunica la diferencia entre dos pokémon mejor que la tabla actual.
- **Drag & drop** en el equipo. El reordenamiento con botones cumple y no suma dependencias;
  el arrastre sería la versión cómoda para reordenar varios de una vez.
- **Virtualización de la grilla.** Con un filtro amplio el DOM crece proporcionalmente a los
  resultados revelados. Una ventana virtual mantendría el costo constante y permitiría subir
  el tamaño de página sin penalizar el scroll.
- **Colores y metadata de tipos desde la API.** `TYPE_COLORS` está hardcodeado en
  `PokemonCard.jsx`. Traerlos del endpoint de tipos eliminaría el mantenimiento manual si
  PokeAPI suma tipos nuevos.
- **Service worker.** El cache persistido ya permite navegar sin conexión sobre lo visitado;
  un service worker completaría el cuadro cacheando también los sprites, que hoy dependen del
  cache HTTP del navegador.

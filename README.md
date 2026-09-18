# Pokédex

App React Native CLI (iOS / Android) para el assessment de TSOFT: listado de Pokémon desde [PokéAPI](https://pokeapi.co/docs/v2), detalle, cache local y carga incremental.

## Requisitos

- Node 22.11+
- Yarn 1
- Xcode (iOS) / Android Studio (Android)
- CocoaPods para iOS

```bash
yarn install
```

iOS, la primera vez y después de agregar nativos:

```bash
bundle install
cd ios && bundle exec pod install && cd ..
```

## Correr

```bash
yarn start
yarn ios
# o
yarn android
```

Después de clonar, hace falta un rebuild nativo (AsyncStorage, React Navigation, `screens`, `gesture-handler`). Metro solo no alcanza.

## Checks

```bash
yarn typecheck
yarn lint
yarn test
```

## Qué hace

- Lista paginada de 20 en 20 (carga incremental al final del `FlatList`, no un paginador numerado).
- Detalle: tipos, habilidades, stats, altura, peso y experiencia base.
- Estados de loading, error, vacío y retry.
- Si la red falla o el request cuelga (timeout 8s), usa cache de AsyncStorage cuando existe.

La navegación al detalle solo manda `pokemonId`. El detalle vuelve a pedir datos por use case; no se pasa el objeto completo.

## Arquitectura

Clean Architecture por feature, MVVM con hooks, DI manual.

```text
src/app            DI y navegación tipada
src/core           errores, constantes, ViewState
src/features/pokemon
  domain           entidades, contrato del repo, use cases
  data             DTOs, mapper, remote/local, repo
  presentation     screens, ViewModels, UI
```

Flujo:

```text
PokéAPI JSON → DTO → mapper → entidad
View → ViewModel → use case → PokemonRepository
                ↗ remote (fetch)
                ↘ local (AsyncStorage)
```

`domain` no importa React, RN, navegación ni AsyncStorage. Eso lo corta ESLint.

La composición vive en `src/app/dependencies.ts`. No hay contenedor de DI ni locator global.

## Librerías

RN no trae navegación ni storage. El resto se queda en la plataforma.

| Dependencia | Por qué |
| --- | --- |
| `@react-navigation/native` + native-stack | Stack tipado, back nativo. Rehacerlo no aporta al challenge. |
| `react-native-screens`, `gesture-handler`, `safe-area-context` | peers de Navigation. |
| `@react-native-async-storage/async-storage` | cache clave-valor. RN ya no trae AsyncStorage built-in. |

No usé Axios, Redux/Zustand ni TanStack Query: `fetch`, estado en el ViewModel y la política de cache en el repository alcanzan.

## Persistencia

Network-first con fallback a cache:

1. Intenta red.
2. Si responde, mapea, guarda y muestra `source: 'network'`.
3. Si falla o aborta por timeout, lee cache.
4. Si hay cache, muestra `source: 'cache'` y un aviso.
5. Si no hay cache, error con retry.

Keys:

```text
pokemon:list:<offset>:<limit>
pokemon:detail:<id>
```

Es offline parcial, no sync. La lista en cache es la página ya vista; el detalle, el Pokémon ya abierto.

## Imágenes

La lista de PokéAPI trae `name` + `url`, no artwork. El id se saca de la url y se arma el Official Artwork. Evita 20 requests extra de detalle (N+1). El acoplamiento a esa URL de sprites queda solo en el mapper.

## Paginación

Offset/limit de 20. En UI es carga incremental: en mobile un paginador `1 2 3` es patrón web. El ViewModel evita requests concurrentes, no pisa la lista si falla la página siguiente y descarta ids duplicados.

## Trade-offs

- Timeout de 8s: si `fetch` cuelga, nunca se llegaría al cache.
- Cache sin invalidación fina: cada load intenta red otra vez.
- Use cases delgados: son frontera de aplicación, no un `BaseUseCase`.
- UI light. El StatusBar mira el scheme del sistema; los colores de pantalla todavía no.

## Pendiente

- Capturas / video de Android e iOS.
- CI (`typecheck`, `lint`, `test`).
- Dark mode y un pass de accesibilidad.
- Pull-to-refresh, si hace falta después de lo anterior.

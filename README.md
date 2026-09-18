# PokemonApp

Pokédex en React Native CLI. Lista + detalle contra [PokéAPI](https://pokeapi.co/docs/v2), cache en AsyncStorage.

## Setup

Node 22.11+, Yarn 1. iOS necesita CocoaPods.

```bash
yarn install
```

```bash
bundle install
cd ios && bundle exec pod install && cd ..
```

```bash
yarn ios
# o
yarn android
```

Si el clone es fresco, rebuild nativo. Metro no alcanza: hay AsyncStorage y React Navigation. En iOS abre `PokemonApp.xcworkspace`, no el `.xcodeproj`. El `Podfile.lock` va en el repo.

```bash
yarn typecheck
yarn lint
yarn test
```

Lo mismo corre en GitHub Actions contra `development` y `main`.

## App

La primera página son 20 Pokémon (`offset=0&limit=20`). Al final del `FlatList` pide la siguiente. No hay paginador 1-2-3: en el teléfono se usa mal, y el assessment admite carga incremental.

El tap manda solo `pokemonId`. El detalle vuelve a cargar tipos, habilidades, stats, altura, peso y experiencia base.

Si la API falla o el `fetch` se queda colgado (8s), intento el cache. Si no hay, error y retry.

## Carpetas

```
src/app                  DI y navegación
src/core                 AppError, ViewState
src/features/pokemon
  domain                 entidades, repo, use cases
  data                   DTOs, mapper, fetch, AsyncStorage
  presentation           screens y hooks
```

`domain` no importa React Native. ESLint lo bloquea. Las dependencias se arman en `src/app/dependencies.ts`, sin contenedor.

## Libs

React Navigation (y sus peers: `screens`, `gesture-handler`, `safe-area-context`) porque RN no trae stack. AsyncStorage porque tampoco trae storage.

No metí Axios ni Redux. Con `fetch` y el estado del ViewModel alcanza.

## Cache e imágenes

Network first. Keys `pokemon:list:<offset>:<limit>` (`{items, hasMore}`) y `pokemon:detail:<id>`. Si sirvo cache o la última petición falla con datos en pantalla, la UI lo dice.

La lista de PokéAPI viene con `name` y `url`, sin artwork. El id sale de la url y con eso armo el Official Artwork, sin N+1 de detalle.

## Falta

Capturas de iOS y Android.

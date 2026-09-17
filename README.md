# PokemonApp-Jairo-Camarillo-Tsoft

Pokédex built with React Native CLI and TypeScript.

Architecture decisions live in [`POKEDEX_TECHNICAL_PROPOSAL_V2.md`](./POKEDEX_TECHNICAL_PROPOSAL_V2.md).

## Stack

- React Native CLI `0.87`
- TypeScript strict
- Feature-first Clean Architecture + MVVM
- Manual dependency injection

## Gitflow

| Branch | Purpose |
| --- | --- |
| `main` | Stable / release |
| `development` | Integration branch |
| `chore/*` | Architecture, tooling, project setup |
| `feat/*` | Product features |
| `fix/*` | Bug fixes |

## Architecture

```text
src/
├── app/                  # composition root + navigation
├── core/                 # shared errors, constants, result types
└── features/pokemon/
    ├── domain/           # entities, repository contract, use cases
    ├── data/             # DTOs, mapper, data sources, repository impl
    └── presentation/     # screens, components, ViewModels
```

Dependency rule:

```text
Presentation → Use Cases / Domain → Repository contract
Repository implementation → RemoteDataSource / LocalDataSource
```

`domain/` must not import React, React Native, React Navigation, AsyncStorage, DTOs, or presentation/data implementations. ESLint enforces that boundary.

## Scripts

```sh
npm start
npm run android
npm run ios
npm run typecheck
npm run lint
npm test
```

Node `>= 22.11.0`. See `.nvmrc`.

### iOS

```sh
bundle install
bundle exec pod install --project-directory=ios
```

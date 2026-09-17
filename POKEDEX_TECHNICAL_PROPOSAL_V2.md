# Pokédex Challenge --- Technical Proposal v2

> **Status:** Architecture frozen --- ready for implementation
> **Target:** React Native CLI + TypeScript **Architecture:** Pragmatic
> Clean Architecture + MVVM + SOLID **Scope:** Technical assessment ---
> 2 business days

## 1. Purpose

Build a small Pokédex application that demonstrates production-oriented
React Native engineering practices while remaining proportional to the
assessment scope.

The solution must be clear, maintainable, strongly typed, testable,
extensible, resilient to connectivity failures, consistent on
Android/iOS, and easy for another developer to understand.

> **Guiding principle:** Complexity must be earned by a requirement.

## 2. Functional Scope

The application must display the first 20 Pokémon with name and image,
navigate to a detail screen, display types, abilities, stats, weight,
height and base experience, handle
loading/error/empty/retry/connectivity states, persist relevant data
locally, provide partial offline support, work on Android/iOS, and use
strict TypeScript.

Bonus work, only after mandatory scope is stable: pagination,
pull-to-refresh, skeleton/loading polish, accessibility, performance
optimizations, tests, technical documentation and demo evidence.

## 3. Technology Decisions

-   React Native CLI
-   TypeScript strict
-   Pragmatic Clean Architecture
-   MVVM using custom hooks
-   Feature-first organization
-   Manual dependency injection

React Native CLI is intentionally selected to keep the project close to
a standard native React Native environment and retain direct access to
Android and iOS projects.

## 4. Third-Party Dependency Policy

The assessment contains apparently conflicting guidance: one section
prohibits external libraries while another grants freedom to select
libraries when justified, and both Expo and CLI are accepted.

Working interpretation: third-party dependencies are minimized rather
than used by default.

A dependency is acceptable only when React Native core does not provide
an equivalent maintained capability, implementing it ourselves would add
disproportionate complexity/platform risk, it has one clear
responsibility, it remains outside domain, and its use is explicitly
defensible.

### Approved dependencies

**React Navigation** --- application navigation. React Native core does
not provide a complete navigation solution; reimplementing route stacks,
Android back behavior, lifecycle and platform conventions would add
infrastructure unrelated to the challenge.

**@react-native-async-storage/async-storage** --- lightweight persistent
cache. React Native core no longer provides the former built-in
AsyncStorage capability, and key-value storage is sufficient for this
small read-heavy dataset.

### Intentionally avoided

-   Axios → native `fetch`
-   Redux / Zustand / MobX → React state + ViewModels
-   TanStack Query → Repository/DataSource strategy
-   UI libraries → React Native primitives
-   DI containers → manual DI
-   SQLite → unnecessary for current requirements
-   mapping libraries → explicit TypeScript mappers
-   generic architecture packages → unnecessary

Any additional dependency requires explicit justification before
introduction.

## 5. Frozen Project Structure

``` text
src/
├── app/
│   ├── navigation/
│   │   ├── AppNavigator.tsx
│   │   └── routes.ts
│   └── dependencies.ts
├── core/
│   ├── errors/
│   └── constants/
└── features/
    └── pokemon/
        ├── domain/
        │   ├── entities/
        │   │   ├── Pokemon.ts
        │   │   └── PokemonDetail.ts
        │   ├── repositories/
        │   │   └── PokemonRepository.ts
        │   └── useCases/
        │       ├── GetPokemonList.ts
        │       └── GetPokemonDetail.ts
        ├── data/
        │   ├── dto/
        │   │   ├── PokemonListDto.ts
        │   │   └── PokemonDetailDto.ts
        │   ├── mappers/
        │   │   └── PokemonMapper.ts
        │   ├── datasources/
        │   │   ├── PokemonRemoteDataSource.ts
        │   │   └── PokemonLocalDataSource.ts
        │   └── repositories/
        │       └── PokemonRepositoryImpl.ts
        └── presentation/
            ├── screens/
            │   ├── PokemonListScreen.tsx
            │   └── PokemonDetailScreen.tsx
            ├── components/
            │   ├── PokemonCard.tsx
            │   ├── LoadingState.tsx
            │   ├── ErrorState.tsx
            │   └── EmptyState.tsx
            └── viewModels/
                ├── usePokemonListViewModel.ts
                └── usePokemonDetailViewModel.ts
```

## 6. Dependency Rule

``` text
Presentation
     ↓
Use Cases / Domain
     ↓
Repository Contract
     ↑ implements
Repository Implementation
   ↙                 ↘
RemoteDataSource   LocalDataSource
      ↓                 ↓
    fetch           AsyncStorage
```

`domain/` must never import React, React Native, React Navigation,
AsyncStorage, PokéAPI DTOs, presentation code or data implementations.

## 7. MVVM

**View:** screens/components. Renders state and forwards interactions.
No networking, persistence or business rules.

**ViewModel:** custom hooks such as `usePokemonListViewModel`.
Coordinates use cases, owns presentation state and exposes actions. It
must not call `fetch` or AsyncStorage directly.

**Model:** domain entities, repository contracts and use cases.

## 8. Domain and API Boundary

PokéAPI responses never become domain models directly.

``` ts
export interface Pokemon {
  id: number;
  name: string;
  imageUrl: string;
}
```

``` ts
export interface PokemonDetail {
  id: number;
  name: string;
  imageUrl: string;
  height: number;
  weight: number;
  baseExperience: number;
  types: PokemonType[];
  abilities: PokemonAbility[];
  stats: PokemonStat[];
}
```

Flow:

``` text
PokéAPI JSON → DTO → PokemonMapper → Domain Entity
```

Screens and ViewModels never consume PokéAPI DTOs.

## 9. PokéAPI List Strategy

`GET /pokemon?limit=20&offset=0` returns list entries containing
essentially `name` and `url`; it does not directly provide the desired
list image.

Do not perform N+1 detail requests merely to obtain images.

``` text
{name, url}
    ↓
extractPokemonId(url)
    ↓
PokemonMapper
    ↓
{id, name, imageUrl}
```

ID extraction must be defensive. An invalid resource URL must result in
a controlled mapping failure rather than silently producing an invalid
entity.

## 10. Image Strategy

Construct Official Artwork from the extracted ID:

``` text
https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/{id}.png
```

This avoids 20 additional detail requests and provides higher-quality
artwork.

Trade-off: the data layer depends on the known PokeAPI sprites
repository convention. That coupling is intentional, documented and
isolated.

## 11. Repository and Use Cases

Domain owns the repository contract:

``` ts
export interface PokemonRepository {
  getPokemonList(offset: number, limit: number): Promise<DataResult<Pokemon[]>>;
  getPokemonDetail(id: number): Promise<DataResult<PokemonDetail>>;
}
```

Use cases remain minimal:

``` text
GetPokemonList
GetPokemonDetail
```

They provide the application boundary between ViewModels and
repositories. There will be no `BaseUseCase`, generic use-case hierarchy
or artificial logic added merely to justify their existence.

Repositories represent data capabilities/coordinating data sources. Use
cases represent application actions. These responsibilities must not be
merged merely to reduce file count.

## 12. Data Sources

### PokemonRemoteDataSource

-   uses native `fetch` directly;
-   calls PokéAPI;
-   handles HTTP failures;
-   obtains external DTO-shaped data;
-   exposes controlled data-layer failures.

There is deliberately no `HttpClient` / `FetchHttpClient` wrapper.

### PokemonLocalDataSource

-   uses AsyncStorage directly;
-   reads/writes cached Pokémon data;
-   handles serialization;
-   owns cache keys.

There is deliberately no `Storage` / `AsyncStorageAdapter` wrapper.

### PokemonRepositoryImpl

-   coordinates remote/local sources;
-   applies network/cache policy;
-   maps/returns domain results;
-   prevents HTTP/AsyncStorage concepts from leaking upward.

## 13. Offline Strategy

Selected strategy: **Network-first with cache fallback**.

Success:

``` text
request → network → success → map → update cache
        → return {data, source: 'network'}
```

Failure:

``` text
request → network failure → cache
                         ├─ exists → {data, source: 'cache'}
                         └─ absent → error
```

This is partial offline support, not a full offline-first
synchronization architecture.

Cache successfully fetched list pages and visited detail records.
Conceptual keys:

``` text
pokemon:list:<offset>:<limit>
pokemon:detail:<id>
```

Do not create a complex cache invalidation framework. Network-first
behavior attempts fresh data on relevant loads.

## 14. Result Origin and View State

Prefer explicit origin:

``` ts
export type DataSourceOrigin = 'network' | 'cache';

export type DataResult<T> = {
  data: T;
  source: DataSourceOrigin;
};
```

Do not use optional `isFromCache?: boolean`.

Presentation state:

``` ts
export type ViewState<T> =
  | {status: 'idle'}
  | {status: 'loading'}
  | {status: 'success'; data: T; source: DataSourceOrigin}
  | {status: 'empty'}
  | {status: 'error'; message: string};
```

Pagination state may extend this pragmatically to distinguish initial
loading, refreshing and loading-more without producing contradictory
boolean combinations.

## 15. Navigation

Use React Navigation with strongly typed params:

``` ts
export type RootStackParamList = {
  PokemonList: undefined;
  PokemonDetail: {
    pokemonId: number;
  };
};
```

Pass only stable identifiers:

``` ts
navigate('PokemonDetail', {pokemonId});
```

Do not pass the entire Pokémon object. The detail ViewModel retrieves
data through the use-case/repository flow.

## 16. Pagination

Initial page size: 20.

``` text
page 1 → limit 20, offset 0
page 2 → limit 20, offset 20
page 3 → limit 20, offset 40
```

Use `FlatList` incremental loading. Prevent concurrent duplicate
requests, preserve existing results while appending, avoid duplicate
entities, use stable keys and distinguish initial loading from
loading-more.

Pagination coordination belongs in the ViewModel/application flow, not
JSX.

## 17. Error Handling

Do not expose raw HTTP or AsyncStorage exceptions to users.

Keep errors proportional:

``` text
Network
Server
InvalidData
Storage
Unknown
```

Avoid deep exception hierarchies. Data/repository boundaries normalize
infrastructure failures; presentation turns them into readable feedback
and retry actions.

## 18. Manual Dependency Injection

No DI framework.

Compose dependencies in `src/app/dependencies.ts`:

``` text
PokemonRemoteDataSource
PokemonLocalDataSource
        ↓
PokemonRepositoryImpl
        ↓
GetPokemonList / GetPokemonDetail
        ↓
ViewModels
```

Avoid service locators and mutable global dependency registries.

## 19. SOLID

SOLID must emerge from concrete responsibilities:

-   Mapper → transforms representations
-   RemoteDataSource → remote communication
-   LocalDataSource → persistence
-   Repository → coordinates data sources
-   UseCase → application action
-   ViewModel → presentation state/actions
-   View → rendering/interactions

Use cases depend on `PokemonRepository`, not its implementation,
`fetch`, or AsyncStorage.

## 20. TypeScript Rules

-   strict TypeScript;
-   no casual `any`;
-   narrow `unknown` at external boundaries;
-   typed navigation;
-   typed DTOs;
-   typed domain entities;
-   discriminated unions where useful;
-   exhaustive switches where practical.

Do not introduce enums merely because the assessment mentions enums.
Prefer literal unions when clearer.

## 21. Performance

Use `FlatList` virtualization, stable keys, appropriate image dimensions
and duplicate-request protection.

Use `React.memo`, `useCallback` and `useMemo` only when solving a
plausible render problem, not mechanically.

## 22. Accessibility

At minimum:

-   meaningful `accessibilityLabel`;
-   appropriate `accessibilityRole`;
-   adequate touch targets;
-   readable typography;
-   adequate contrast;
-   do not encode meaning only through color;
-   meaningful screen-reader semantics.

## 23. UI/UX Priority

Prioritize:

1.  clear hierarchy;
2.  consistent spacing;
3.  responsive layout;
4.  readable information;
5.  loading feedback;
6.  error + retry;
7.  empty state;
8.  pagination feedback;
9.  cached/offline indication where useful.

Only after mandatory behavior: skeletons, type badges, stat bars, subtle
native animations and pull-to-refresh.

## 24. Testing Strategy

Priority:

1.  **Mappers:** valid/invalid resource URL, ID extraction, artwork
    generation, detail mapping.
2.  **Repository:** network success updates cache; network failure +
    cache returns cache; network failure + no cache returns error.
3.  **Use Cases:** repository interaction/result propagation.
4.  **ViewModels:** loading/success/error/retry/cache/pagination where
    tooling permits without disproportionate setup.

Behavioral confidence matters more than coverage percentage.

## 25. Explicit Non-Goals

Do not introduce:

``` text
BaseRepository
BaseUseCase
BaseViewModel
HttpClient abstraction
FetchHttpClient
Storage abstraction
AsyncStorageAdapter
Repository factories
DI containers
Redux
Zustand
MobX
Axios
TanStack Query
SQLite
generic caching framework
generic networking framework
premature design system
unnecessary native modules
```

## 26. Implementation Order

### Phase 1 --- Bootstrap

Create RN CLI project, verify Android/iOS builds, strict TypeScript,
approved dependencies, folders.

### Phase 2 --- Domain

Entities, supporting types, repository contract, minimal use cases.

### Phase 3 --- Remote Data

DTOs, defensive ID extraction, artwork strategy, mapper tests,
RemoteDataSource using fetch.

### Phase 4 --- Local Data

LocalDataSource using AsyncStorage, cache keys, serialization,
repository network-first/cache-fallback behavior, repository tests.

### Phase 5 --- Navigation + Presentation

Typed navigation, list/detail ViewModels, screens,
loading/error/empty/retry.

### Phase 6 --- Quality

Pagination, optional pull-to-refresh, accessibility, performance review,
additional tests, UI polish.

### Phase 7 --- Submission

Fresh-install test, Android/iOS validation, offline/restart tests,
lint/type/test checks, documentation, screenshots/video.

## 27. Definition of Done

-   [ ] First 20 Pokémon load.
-   [ ] Name and image are visible.
-   [ ] Detail navigation works.
-   [ ] Detail contains required relevant information.
-   [ ] Loading/error/empty/retry work.
-   [ ] Pagination works.
-   [ ] Cached data survives restart.
-   [ ] Appropriate network failure falls back to cache.
-   [ ] Domain imports no framework/infrastructure.
-   [ ] DTOs do not leak outside data.
-   [ ] Screens do not call fetch.
-   [ ] ViewModels do not call AsyncStorage.
-   [ ] Repository contract is in domain.
-   [ ] Repository implementation is in data.
-   [ ] Use cases remain small/concrete.
-   [ ] Strict TypeScript passes.
-   [ ] No unjustified `any`.
-   [ ] Navigation is typed.
-   [ ] Critical mapper/repository tests pass.
-   [ ] Android and iOS are validated.
-   [ ] Accessibility is reviewed.
-   [ ] Dependencies and trade-offs are documented.
-   [ ] No secrets are committed.

## 28. Frozen Decisions for AI-Assisted Implementation

Cursor or another implementation assistant must not silently change:

``` text
React Native CLI
TypeScript strict
Feature-first
Clean Architecture inside pokemon
MVVM through custom hooks
Repository contract in domain
Repository implementation in data
Minimal use cases
DTO → Mapper → Domain
RemoteDataSource → native fetch
LocalDataSource → AsyncStorage
Network-first with cache fallback
Explicit network/cache result origin
ID extracted from PokéAPI resource URL
Official Artwork URL constructed from ID
Typed React Navigation
Manual DI
No N+1 list-detail requests
```

If implementation reveals a reason to change one:

1.  stop;
2.  describe the concrete problem;
3.  propose the change;
4.  explain the trade-off;
5.  obtain approval before changing architecture.

## 29. AI Implementation Rules

Implement one phase at a time. Inspect existing code before replacing
anything. Do not install packages without explicit approval. Do not
generate speculative abstractions. Preserve the dependency rule. Explain
architecture-impacting changes before making them. Run relevant type
checks/tests after meaningful phases. Avoid unrelated refactors. Never
fabricate PokéAPI fields. Keep the two-business-day scope in mind.

Before adding an abstraction, answer:

> What concrete coupling/problem does this abstraction solve today?

Before adding a dependency, answer:

> What capability is missing, and why is implementing it ourselves worse
> for this assessment?

If there is no strong answer, do not add it.

## 30. Key Trade-Offs

**React Navigation:** robust platform-aware navigation at the cost of a
third-party dependency. Accepted and explicitly justified.

**AsyncStorage:** appropriate simple persistent cache at the cost of a
third-party dependency. Accepted and isolated to LocalDataSource.

**Constructed Official Artwork URL:** avoids N+1 and improves visuals,
but depends on a known PokeAPI sprites URL convention. Accepted and
isolated to data mapping.

**Network-first cache fallback:** favors fresh data and simple
partial-offline behavior, at the cost of attempting network before
returning cache.

**Use Cases:** explicit application boundary, at the cost of thin
wrappers initially. Retained without generic base classes.

**Feature-first:** scalable feature colocation, at the cost of slight
nesting in a one-feature app. Accepted.

## 31. Final Engineering Principle

The submission should communicate engineering judgment, not
architectural decoration.

A reviewer should quickly understand:

``` text
where data comes from
        ↓
how external data is transformed
        ↓
where cache behavior lives
        ↓
where application actions live
        ↓
how presentation state is produced
        ↓
how the UI renders it
```

> **Build the smallest architecture that clearly demonstrates the
> required engineering principles.**

# PokemonApp-Jairo-Camarillo-Tsoft

Pokédex built with React Native CLI and TypeScript.

Architecture decisions live in [`POKEDEX_TECHNICAL_PROPOSAL_V2.md`](./POKEDEX_TECHNICAL_PROPOSAL_V2.md). This first slice only bootstraps the native project and tooling.

## Stack

- React Native CLI `0.87`
- TypeScript strict
- npm

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

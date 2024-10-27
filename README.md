## AUTOCENTRAL.TN API

### Requirements

- Node 20.15.0
- NVM
- YARN
- Docker & docker compose

### Start App

- Install suitable node version `nvm install && nvm use`
- Install dependencies `yarn install` or `yarn`
- Start App in watch mode `yarn watch`
- Go to [http://localhost:5555/documentation](http://localhost:5555/documentation)

### ENV vars

ENV file is encrypted & versioned

1. Create a file `.environment` by copying `.environment.template`: `cp .environment.template .environment`
2. Put the `DOTVAULT_KEY` shared by the team
3. Execute `npx dotvault decrypt`
4. **Update** ENV : `npx dotvault encrypt`

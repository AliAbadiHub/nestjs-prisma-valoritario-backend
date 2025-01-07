<p align="center"> <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a> </p> <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p> <p align="center"> <a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a> <a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a> <a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a> <a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a> <a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a> <a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a> <a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a> <a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a> <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a> <a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a> <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a> </p> <!--[Backers on Open Collective [Sponsors on Open Collective-->
Description
This is a NestJS and Prisma backend for the VALORITARIO Shopping Companion API. It provides user management functionality with versioned API endpoints.
Features

    User creation, retrieval, update, and deletion
    API versioning
    Swagger documentation

Installation

bash
$ yarn install

Running the app

bash

# development

$ yarn run start

# watch mode

$ yarn run start:dev

# production mode

$ yarn run start:prod

The application will be available at http://localhost:3001.
API Documentation
Swagger UI is available at http://localhost:3001/api. Use this interface to explore and test the API endpoints.
API Endpoints
User-related endpoints are accessible at http://localhost:3001/api/v1/user. Available operations include:

    POST: Create a new user
    GET: Retrieve users (with pagination)
    GET /:id: Get a user by ID
    PATCH /:id: Update a user's password
    DELETE /:id: Delete a user

Test

bash

# unit tests

$ yarn run test

# e2e tests

$ yarn run test:e2e

# test coverage

$ yarn run test:cov

Support
Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please read more here.
Stay in touch

    Author - Kamil Myśliwiec
    Website - https://nestjs.com
    Twitter - @nestframework

License
Nest is MIT licensed.

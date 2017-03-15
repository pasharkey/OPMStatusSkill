## Synopsis

An Amazon Alexa skill developed in Typescript that will determine if the government is open via the OPM.gov API

## Motivation

The motiviation for this project was primarily in the interest in learning how to develop a custom Alexa skill using Typescript. 

## Installation

### Installation of Node and Yarn

Before you can build the project you will need to [install node](https://docs.npmjs.com/getting-started/installing-node) and [install yarn](https://yarnpkg.com/lang/en/docs/install/)

### Initialize the project

In the root directory, initialize the yarn project and install all of the projects dependencies

```sh
$ yarn init
$ yarn install
```

### Installation of Typings

Because the project was written in Typescript, you will need to install the typings for some of the dependencies

```sh
$ yarn install typings --global
$ typings install dt~alexa-sdk --save
$ typings install dt~moment --save --global
$ yarn install @types/node
```

## Tests

Test were created using Mocha.js with the Chai.js assertion library. All tests will be executed by running the following command

```sh
$ yarn test
```

## Contributors

* Patrick Sharkey (patrick.sharkey@gmail.com)

## License

MIT License. © 2017 Patrick Sharkey

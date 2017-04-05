## Synopsis

An Amazon Alexa skill developed in Typescript as well as Python. It will determine if the government is open via the OPM.gov API

## Motivation

The motiviation for this project was primarily in the interest of learning how to develop a custom Alexa skill using Typescript. I had trouble getting the typescript version of the skill certified through amazon. I decided to port the skill to python in order to successfully get the skill certified.  

## Installation

### Typescript Installation

#### Installation of Yarn

Before you can build the project you will need to [install yarn](https://yarnpkg.com/lang/en/docs/install/)

#### Initialize the project

In the root directory, initialize the yarn project and install all of the projects dependencies

```sh
$ yarn install
```

#### Installation of Typings

Because the project was written in Typescript, you will need to install the typings for some of the dependencies

```sh
$ yarn add typings
$ typings install dt~alexa-sdk --save
$ typings install dt~moment --save --global
$ yarn add @types/node
```

#### Tests

Test were created using Mocha.js with the Chai.js assertion library. All tests will be executed by running the following command

```sh
$ yarn test
```

### Python Installation

This project was created using python version 2.7+. Ensure you have python installed on your machine

#### Tests

I used the Amazon build in AWS Lambda testing tool for debugging and testing. I have yet to create test cases in python. 

### Packaging for deployment

Included in both the typscript and python code base is a script to package all the resources necssary for deploying OPM Status on Amazon Lambda. To create the zip to upload within Lambda, navigate to the **package/** directory and run the script

```sh
$ ./package.sh
```

## Contributors

* Patrick Sharkey (patrick.sharkey@gmail.com)

## License

MIT License. © 2017 Patrick Sharkey

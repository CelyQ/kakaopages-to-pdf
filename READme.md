# kakaopages-to-pdf

## About

This is a simple script that downloads the chapter you provided as images and converts them to pdf.

!NB: An account you try to access the webtoon's chapter with must have access to it.

## Features

- [x] Downloads all chapter images
- [x] Converts images to pdf

## Working on

There is a "bun" [branch](https://github.com/CelyQ/kakaopages-to-pdf/tree/bun) which is a work in progress.
It is a rewrite using [bun](https://bun.sh/). It is going to be a tool to sync all of your webtoons to your local machine.

### Prerequisites

- node v14
- create a `.env` file with the following variables:

```bash
KAKAOPAGES_USERNAME=your_email
KAKAOPAGES_PASSWORD=your_password
```

### To install dependencies

```bash
yarn install
```

### To run

```bash
yarn start %WEBTOON_URL%
```

### An example

```bash
yarn start https://page.kakao.com/content/51761524/viewer/51762648
```

### To build

```bash
yarn build
```

# kakaopages-to-pdf

## About

This is a simple script that downloads the chapter you provided as images and converts them to pdf.

!NB: An account you try to access the webtoon's chapter with must have access to it.

## Features

- [x] Downloads all chapter images
- [x] Converts images to pdf

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

# public-domain-library-book-automation

## Run Project

```
npm start
```

## Setup

1. Install packages

```
npm install
```

2. Create book local directories (will result in error & it is expected)

```
npm run start
```

3. Install Calibre to your pc

- Direct link: https://calibre-ebook.com/download
- Mac brew: https://formulae.brew.sh/cask/calibre
- Ubuntu: `sudo apt install calibre`

4. Download Books from sheets

   1. Export sheet in csv format (or use example in the drive)
   2. Remove Empty line of ","s. **First line of csv file has to be name of the
      columns**
   3. Rename file to `books.csv`
   4. Relocate file to folder `packages/application/books`

5. Download or add covers

   1. Download covers from drive in snake case format
      (ID_Title_Author(s)\_cover.jpg)
   2. Move them to covers folder in `packages/application/covers`

6. Download or add title svg's (Optional, will give warning if you don't have
   it)

   1. Download covers from drive in snake case format
      (ID_Title_Author(s)\_title.svg)
   2. Move them to titles forlder in `packages/application/titles`

7. Start book creation

```
npm run start
```

## Drive folder

Example assets folder name is: `local test folders` in shared drive under
`6. Public Domain Library`

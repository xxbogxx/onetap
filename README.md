# OneTap — Low Poly Clicker (Next.js PWA)

Готовая браузерная игра-кликер на Next.js с PWA-режимом, офлайн-кэшем и локальным сохранением без базы данных.

## Запуск локально

Требуется Node.js 18.17+.

```bash
npm install
npm run dev
```

Откройте http://localhost:3000

## Сборка

```bash
npm run build
npm run start
```

## Деплой на Vercel

1. Загрузите содержимое репозитория в GitHub.
2. В Vercel выберите **Add New → Project** и импортируйте репозиторий.
3. Framework Preset: Next.js. Build Command: `npm run build`.
4. Нажмите Deploy.

Переменные окружения и база данных не нужны.

## Сохранение

Весь игровой прогресс хранится в `localStorage` браузера на конкретном устройстве и в рамках конкретного домена. Данные переживают перезагрузку и повторный запуск приложения, но не синхронизируются между разными устройствами и браузерами. Очистка данных сайта может удалить сохранение.

## PWA

- `public/manifest.webmanifest` — манифест приложения.
- `public/sw.js` — service worker для кэширования приложения.
- `public/icons/icon.svg` — иконка.
- На iPhone откройте задеплоенный сайт в Safari → «Поделиться» → «На экран Домой».
- Для установки PWA и service worker нужен HTTPS (localhost подходит для разработки).

## Структура

```text
app/
  globals.css
  layout.tsx
  page.tsx
public/
  manifest.webmanifest
  sw.js
  icons/icon.svg
```

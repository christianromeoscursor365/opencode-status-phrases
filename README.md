# opencode-status-phrases

Плагин для [OpenCode](https://opencode.ai): во время работы агента показывает над полем ввода смешные статус-фразы на русском — новые меняются при смене шага/инструмента. Работает в Desktop (пилюля над композером) и в TUI (строка статуса).

## Установка

1. Закройте OpenCode Desktop (и остановите сервис: `opencode service stop`).
2. Скопируйте содержимое репозитория в папку:
   - Windows: `~/.config/opencode/plugins/status-phrases/`
   - macOS/Linux: `~/.config/opencode/plugins/status-phrases/`
3. Откройте OpenCode Desktop — плагин подхватится автоматически, конфиг править не нужно.

Для TUI плагин работает из той же папки авто-обнаружением.

## Как это работает

- `phrases.js` — список фраз, маппинг «инструмент → фаза» и контроллер смены (троттлинг 1,5 с, без повторов). Правьте только его.
- `tui.js` — строка статуса в терминале.
- `dist/gui-experimental.cjs` — собранный бандл для Desktop (vite + `@opencode/plugin/gui/vite`).
- `src/gui.tsx` — исходник GUI-части (SolidJS), пересобрать: `npm install && npx vite build`.

## Изменить фразы

Отредактируйте `phrases.js`, проверьте `node selfcheck.mjs`, для Desktop пересоберите бандл и перезапустите приложение.

## Требования

OpenCode CLI/Desktop 2.2+.

# cvedigest-ui

Веб-дашборд к свежим CVE из GitHub Advisory Database. Сестринский проект
[cvedigest](https://github.com/doxsir/cvedigest) — тот же источник данных,
но в браузере и с цветными бейджиками.

**Живой дашборд:** https://doxsir.github.io/cvedigest-ui/

React + Vite, ходит напрямую к api.github.com (CORS разрешён, анонимных
60 req/h для демо хватает) + каталог CISA KEV через raw-зеркало. Без бэкенда.
Деплой на GitHub Pages автоматом из CI при каждом пуше в main.

## Запуск

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # прод-сборка в dist/
```

## Умеет (v0.1)

- лента свежих advisories с severity-бейджами и CVSS-скором
- фильтр по экосистеме (pip/npm/go/...) и минимальной severity
- поиск по тексту и CVE-номеру

## Планы

- графики: advisory по дням/экосистемам
- подсветка того, что уже в CISA KEV
- тёмная/светлая тема (сейчас только тёмная, как и положено)

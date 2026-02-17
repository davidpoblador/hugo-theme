# hugo-theme

Shared Hugo theme for [davidpoblador.com](https://davidpoblador.com) and [poblador.cat](https://poblador.cat).

Monospace-first, minimal personal site theme with sidebar navigation, blog, projects page, dark mode, and i18n support.

## Features

- Sidebar layout with identity, navigation, social links
- Blog with year-grouped post list, tags, and RSS
- Projects page with status-grouped list and color-coded badges
- Three-way dark mode toggle (system/light/dark)
- i18n support (English and Catalan)
- Tailwind CSS with configurable accent color

## Usage

Add as a Hugo theme (submodule):

```sh
git submodule add https://github.com/davidpoblador/hugo-theme.git themes/hugo-theme
```

Set in `hugo.toml`:

```toml
theme = "hugo-theme"
```

## Accent color

Override the default accent in your site's `css/input.css`:

```css
@theme {
  --color-accent: oklch(0.646 0.222 41.116); /* orange-600 */
}
```

## License

MIT

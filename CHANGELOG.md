# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- README: replace the plugin list with a generated More from BinaryNoir section, and use a BinaryNoir logo that shows on light and dark backgrounds

## [0.1.2] - 2026-10-15

### Changed

- README: add Sidebar Accordion to the list of BinaryNoir plugins

## [0.1.1] - 2026-10-14

### Changed

- README: add a Documentation and live demo link to binarynoir.tech

## [0.1.0] - 2026-10-14

### Added

- Initial release: `[t:color:size]text[/t]` styles text inline in VitePress and markdown-it (`markdownTextStyle`, `withTextStyle`). Colors and sizes are validated, code is left alone, the text inside is parsed as Markdown, spans nest, and a page turns it off with `textStyle: false` in its frontmatter.

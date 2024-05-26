# new-catalog-products-detector

A web scraper, that detects changes on a given catalog page of an e-shop, and returns the new products.

## Execution

Written in [bun](https://bun.sh/). Type `bun install` and `bun run index.ts` to run the script.

## Functionality

It reads every configuration file under the `target/*` directory, and watches the changes for each page set in the configuration files.

For each change, it sends a telegram message, using a channel and a bot specified by the user.

## Configuration

Use the [targets/example.json](targets/example.json) template as an example to specify your own target pages.

Create a `settings/production.json`, based on the [settings/template.json](settings/template.json), to set your settings project variables.

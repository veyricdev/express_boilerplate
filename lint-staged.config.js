/**
 * @type {import('stylelint').Config}
 */
module.exports = {
  '*.{js,ts,cjs,mjs,d.cts,d.mts}': ['biome check --apply --no-errors-on-unmatched'],
}

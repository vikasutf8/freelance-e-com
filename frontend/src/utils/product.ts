export const PRODUCT_CATEGORIES = [
  'Cleansers',
  'Serums',
  'Moisturizers',
  'Sun Care',
  'Ritual Kits',
  'Best Sellers',
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export function getProductCategory(name: string): ProductCategory {
  const value = name.toLowerCase();

  if (/(kit|set|ritual|collection|bundle)/.test(value)) return 'Ritual Kits';
  if (/(sun|spf|sunscreen|uv)/.test(value)) return 'Sun Care';
  if (/(wash|cleanser|foam|gel|scrub|toner|mist)/.test(value))
    return 'Cleansers';
  if (/(serum|drop|oil|vitamin|retinol|essence|ampoule)/.test(value))
    return 'Serums';
  if (/(moistur|cream|butter|barrier|lotion|balm)/.test(value))
    return 'Moisturizers';
  if (/(best|bestseller|favourite|favorite)/.test(value)) return 'Best Sellers';
  return 'Best Sellers';
}

export function getCategorySearch(category: ProductCategory) {
  if (category === 'Best Sellers') return '';
  return category;
}

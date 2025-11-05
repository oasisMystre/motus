import { format } from "util";
import type {
  Product,
  ProductSearch,
} from "@openfoodfacts/openfoodfacts-nodejs";

type Options = {
  page?: number;
  baseURL?: string;
  page_size?: number;
  categories_tags?: string;
  fields?: string;
  nutrition_grades_tags?: "a";
};

export const searchFood = async (search_terms?: string, options?: Options) => {
  const defaultOptions: Record<string, string | number> = {
    page: 1,
    json: 1,
    page_size: 24,
    search_simple: 1,
    categories_tags: "meals",
    nutrition_grades_tags: "a",
    fields:
      "id,product_name,nutriments,abbreviated_product_name,product_name_en,serving_quantity,serving_quantity_unit",
    ...options,
  };

  const baseURL = options?.baseURL ?? "https://world.openfoodfacts.org";

  if (search_terms) defaultOptions.search_terms = search_terms;

  const params = Object.fromEntries(
    Object.entries(defaultOptions).map(([key, value]) => [
      key,
      value.toString(),
    ]),
  );
  const query = new URLSearchParams(params);
  const response = await fetch(
    format(
      search_terms ? "%s/cgi/search.pl?%s" : "%s/search?%s",
      baseURL,
      query.toString(),
    ),
    {
      method: "GET",
    },
  );

  if (response.ok) return (await response.json()) as ProductSearch<Product>;

  throw new Error(await response.text());
};

import { OpenFoodFacts } from "@openfoodfacts/openfoodfacts-nodejs";

export * from "./zod";
export * from "./firebase";

export const openFoodFact = new OpenFoodFacts(global.fetch || window.fetch);

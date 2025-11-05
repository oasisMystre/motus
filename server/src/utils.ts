import { stringify, parse } from "devalue";

export const transformer = {
  deserialize: (object: any) => parse(object),
  serialize: (object: any) => stringify(object),
};

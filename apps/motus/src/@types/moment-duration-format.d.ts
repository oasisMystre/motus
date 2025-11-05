import "moment";

declare module "moment" {
  interface Duration {
    format(template: string, precision?: number): string;
  }
}

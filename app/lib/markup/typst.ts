import { $typst } from "@myriaddreamin/typst.ts";

export class Typst {
  constructor(private readonly typst: typeof $typst) {}

  async svg(code: string) {
    return await this.typst.svg({ mainContent: code });
  }
}

export const typst = new Typst($typst);

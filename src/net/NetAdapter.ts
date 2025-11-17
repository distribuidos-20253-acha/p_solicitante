import type { BibInput, BibResponse } from "@acha/distribuidos/src/schemas/InputSchema";

export default interface NetAdapter {
  init(): Promise<boolean>
  sendRenew(context: {
    body: BibInput
  }): Promise<BibResponse>;
  sendReturn(context: {
    body: BibInput
  }): Promise<BibResponse>;
  sendReserve(context: {
    body: BibInput
  }): Promise<BibResponse>;
}
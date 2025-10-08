import type { Input, Response } from "../schemas/InputSchema";

export default interface NetAdapter {
  init(): Promise<boolean>
  sendRenew(context: {
    body: Input
  }): Promise<Response>;
  sendReturn(context: {
    body: Input
  }): Promise<Response>;
  sendReserve(context: {
    body: Input
  }): Promise<Response>;
}
import { BaseZMQSyncRequest } from "@acha/distribuidos/zeromq/BaseZMQSyncRequest"
import { BibOperation, type BibResponse } from "@acha/distribuidos/schemas/BibOperation"
import "dotenv/config"
export default class ZMQSyncRequest extends BaseZMQSyncRequest {
  override host = process.env.LOAD_MANAGER_HOST!;
  override port = process.env.LOAD_MANAGER_PORT!;

  override sendRenew(context: { body: BibOperation; }): Promise<BibResponse> {
    return super.resendBody(context)
  }
  override sendReturn(context: { body: BibOperation; }): Promise<BibResponse> {
    return super.resendBody(context)
  }
  override sendReserve(context: { body: BibOperation; }): Promise<BibResponse> {
    return super.resendBody(context)
  }
}
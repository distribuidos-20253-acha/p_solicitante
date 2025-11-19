import { BaseZMQSyncRequest } from "@acha/distribuidos/zeromq/BaseZMQSyncRequest"
import { BibOperation, type BibResponse } from "@acha/distribuidos/schemas/BibOperation"

export default class ZMQSyncRequest extends BaseZMQSyncRequest {

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
// ODIO ZEROMQ <3

import type NetAdapter from "../NetAdapter.ts";

import * as zmq from "zeromq"
import { writeLogSync, logVerbose } from "@acha/distribuidos"
import type { BibInput, BibResponse } from "@acha/distribuidos/src/schemas/InputSchema.ts";

export default class ClientZeroMQAdapter implements NetAdapter {
  private host: string;
  private port: string;
  private sock: zmq.Request;

  constructor({
    host, port
  }: { host: string, port: string }) {
    this.sock = new zmq.Request()
    this.port = port;
    this.host = host;

    writeLogSync(`ClientZeroMQAdapter Instantiated with params [host=${host}, port=${port}]`)
  }

  init(): Promise<boolean> {

    return new Promise(async (resolve, reject) => {
      try {
        this.sock.connect(`${this.host}:${this.port}`)
        logVerbose("Connected to " + `${this.host}:${this.port}`)
        setTimeout(() => {
          resolve(true)
        }, 500);
      } catch (err) {
        reject(false)
      }
    })
  }

  private resendBody(context: {
    body: BibInput
  }): Promise<BibResponse> {
    return new Promise(async (resolve, reject) => {
      await this.sock.send(JSON.stringify(context.body))
      const [result] = await this.sock.receive()

      resolve({ ok: true, body: result?.toString() ?? "" });
    })
  }

  sendRenew(context: {
    body: BibInput
  }): Promise<BibResponse> {
    return this.resendBody(context)
  }

  sendReserve(context: {
    body: BibInput
  }): Promise<BibResponse> {
    return this.resendBody(context)
  }

  sendReturn(context: {
    body: BibInput
  }): Promise<BibResponse> {
    return this.resendBody(context)
  }
}
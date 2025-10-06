// ODIO ZEROMQ <3

import type { Input, Response } from "../NetAdapter.ts";
import type NetAdapter from "../NetAdapter.ts";

import * as zmq from "zeromq"
import logVerbose from "../../utils/logVerbose.ts";

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
    body: Input
  }): Promise<Response> {
    return new Promise(async (resolve, reject) => {
      await this.sock.send(JSON.stringify(context.body))
      const [result] = await this.sock.receive()

      resolve({ ok: true, body: result?.toString() ?? "" });

    })
  }

  sendRenew(context: {
    body: Input
  }): Promise<Response> {
    return this.resendBody(context)
  }

  sendReserve(context: {
    body: Input
  }): Promise<Response> {
    return this.resendBody(context)
  }

  async sendReturn(context: {
    body: Input
  }): Promise<Response> {
    return this.resendBody(context)
  }
}
// ODIO ZEROMQ <3

import type { Response } from "../NetAdapter.ts";
import type NetAdapter from "../NetAdapter.ts";

import * as zmq from "zeromq"

export default class ZeroMQAdapter implements NetAdapter {
  private host: string;
  private port: string;
  private sock: zmq.Publisher;

  constructor({
    host, port
  }: { host: string, port: string }) {
    this.sock = new zmq.Publisher()
    this.sock.linger = 500
    this.sock.sendHighWaterMark = 1000
    this.sock.conflate = false
    this.port = port;
    this.host = host;
  }

  init(): Promise<boolean> {

    return new Promise(async (resolve, reject) => {
      try {
        this.sock.bind(`${this.host}:${this.port}`)
        setTimeout(() => {
          resolve(true)
        }, 500);
      } catch (err) {
        reject(false)
      }
    })
  }

  sendRenew(): Promise<Response> {
    return new Promise((resolve, reject) => {

      resolve({
        ok: true
      })
    })
  }

  sendReserve(): Promise<Response> {
    return new Promise((resolve, reject) => {

      resolve({
        ok: true
      })
    })
  }

  async sendReturn(): Promise<Response> {

    return new Promise(async (resolve, reject) => {
      while (!(await this.sock.writable)) {
        await new Promise(r => setTimeout(r, 10));
      }
      await this.sock.send(["return", `${new Date()}`])
      setTimeout(() => {
        resolve({ ok: true });
      }, 500);
    })
  }
}
import z from "zod";

export interface Response {
  ok: boolean,
  body?: Object
}

export interface Input {
  operation: "renew" | "return" | "reserve",
  user_id: string,
  copy_id?: string,
  book_id?: string
}

export const inputSchema = z.object({
  operation: z.enum([
    "renew",
    "return",
    "reserve"
  ]),
  user_id: z.uuidv7(),
  copy_id: z.uuidv7().optional(),
  book_id: z.uuidv7().optional()
})

export default interface NetAdapter {

  init(): Promise<boolean>
  sendRenew(): Promise<Response>;
  sendReturn(): Promise<Response>;
  sendReserve(): Promise<Response>;
}
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
  book_id: z.uuidv7().optional(),

  duration: z.string()
    .regex(/^\d+[dw]$/, "Formato inválido. Usa número + d o w")
    .refine((val) => {
      const num = parseInt(val.slice(0, -1), 10);
      const unit = val.slice(-1)

      if (unit == 'd' && num <= 14) return true;
      if (unit == 'w' && num <= 2) return true;

      return false;
    }, "Duración máxima es 2 semanas").optional(),
  location: z.string().optional()
})
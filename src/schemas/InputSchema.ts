import z from "zod";

export interface BibResponse {
  ok: boolean,
  body?: Object
}

export interface BibInput {
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

export const isValid = (x: Object): Promise<boolean> => {
  return new Promise(async (resolve, reject) => {
    const zQ = await inputSchema.safeParseAsync(x)
    const { data, error } = zQ

    if (error) {
      return reject(`Zod cannot parse, ${zQ.error.message}`)
    }

    if (data.operation == "renew" && !data.copy_id)
      reject("Operation renew requires copy_id")

    if (data.operation == "return" && !data.copy_id)
      reject("Operation return requires copy_id")

    if (data.operation == "reserve" && (!data.book_id || !data.duration || !data.location))
      reject("Operation reserv requires book_id, duration and location")


    resolve(true)
  })

}
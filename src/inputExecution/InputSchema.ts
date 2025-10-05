import { inputSchema } from "../net/NetAdapter.ts"

const isValid = (x: Object): Promise<boolean> => {

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

    if (data.operation == "reserve" && !data.book_id)
      reject("Operation reserv requires book_id")


    resolve(true)
  })

}

export default {
  isValid,
  inputSchema
}
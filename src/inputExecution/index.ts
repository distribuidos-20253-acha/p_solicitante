import { readFile } from "fs/promises"
import showFigletTitle from "../shared/showFigletTitle"
import InputSchema from "./InputSchema"
import colors from "chalk"
import { config } from "../../config"

export default async ({
  INPUT_FILE
}: {
  INPUT_FILE: string
}) => {
  showFigletTitle()

  const file_info = await readFile(INPUT_FILE, {
    encoding: "utf-8"
  })
  let data: Object[] = []

  try {
    data = JSON.parse(file_info)
  } catch (err) {

    console.error("Invalid file")
    process.exit(1)

  }

  if (!data?.length) {
    console.error("Invalid file")
    process.exit(1)
  }

  for (let operation of data) {

    try {
      if (!await InputSchema.isValid(operation)) throw new Error("Invalid Operation")
      const op = (await InputSchema.inputSchema.safeParseAsync(operation)).data!;


      console.log(`${colors.cyan(op.operation)} > ${colors.yellow('user:')} ${op.user_id} > ${colors.yellow(`${op.copy_id ? "copy_id" : "book_id"}:`)} ${op.copy_id ?? op.book_id}`)
    } catch (err) {
      console.error("Invalid operation, ignoring it")
      if (config.VERBOSE) console.log(colors.blue("[VERBOSE]", err))
    }

  }
}
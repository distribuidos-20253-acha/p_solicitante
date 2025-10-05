import { readFile } from "fs/promises"
import showFigletTitle from "../shared/showFigletTitle.ts"
import InputSchema from "./InputSchema.ts"
import colors from "chalk"
import { config } from "../../config.ts"
import type NetAdapter from "../net/NetAdapter.ts"
import logVerbose from "../utils/logVerbose.ts"
import ClientZeroMQAdapter from "../net/adapters/ClientZeroMQAdapter.ts"


export default async ({
  INPUT_FILE,
}: {
  INPUT_FILE: string,
}) => {
  const net: NetAdapter = new ClientZeroMQAdapter({
    host: import.meta.env.LOAD_MANAGER_HOST!,
    port: import.meta.env.LOAD_MANAGER_PORT!
  })

  try {
    await net.init();
  } catch (err) {
    console.error(err)
  }

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

      process.stdout.write(`${colors.cyan(op.operation)} > ${colors.yellow('user:')} ${op.user_id} > ${colors.yellow(`${op.copy_id ? "copy_id" : "book_id"}:`)} ${op.copy_id ?? op.book_id}`);
      process.stdout.write(`${colors.cyan(" ...")}`);

      await net.sendReturn({
        body: op
      })

      process.stdout.write(colors.green('\x1b[4D done\n'));

    } catch (err) {
      console.error(colors.red("Invalid operation, ignoring it"))
      logVerbose(err)
    }

  }
}
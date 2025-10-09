import { readFile } from "fs/promises"
import colors from "chalk"
import type NetAdapter from "../net/NetAdapter.ts"
import logVerbose from "../utils/logVerbose.ts"
import ClientZeroMQAdapter from "../net/adapters/ClientZeroMQAdapter.ts"
import 'dotenv/config'
import { inputSchema, isValid } from "../schemas/InputSchema.ts"


export default async ({
  INPUT_FILE,
}: {
  INPUT_FILE: string,
}) => {

  const net: NetAdapter = new ClientZeroMQAdapter({
    host: process.env?.LOAD_MANAGER_HOST!,
    port: process.env?.LOAD_MANAGER_PORT!
  })

  try {
    await net.init();
  } catch (err) {
    console.error(err)
  }

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
      if (!await isValid(operation)) throw new Error("Invalid Operation")
      const op = (await inputSchema.safeParseAsync(operation)).data!;
      logVerbose("Intentando enviar")
      logVerbose(JSON.stringify(op, null, 2))

      process.stdout.write(`${colors.cyan(op.operation)} > ${colors.yellow('user:')} ${op.user_id} > ${colors.yellow(`${op.copy_id ? "copy_id" : "book_id"}:`)} ${op.copy_id ?? op.book_id}`);
      process.stdout.write(`${colors.cyan(" ...")}`);

      let req;
      const time = new Date().getTime()

      switch (op.operation) {
        case "renew":
          req = net.sendRenew({
            body: op
          })
          break;
        case "return":
          req = net.sendReturn({
            body: op
          })
          break;
        case "reserve":
          req = net.sendReserve({
            body: op
          })
          break;

      }

      const data = await req;

      process.stdout.write(colors.green('\x1b[4D done\n'));

      logVerbose(`Request time: ${new Date().getTime() - time}ms`)

      logVerbose("Recibido:")
      logVerbose(JSON.stringify(data, null, 2))

    } catch (err) {
      console.error(colors.red("Invalid operation, ignoring it"))
      logVerbose(err)
    }

  }
}
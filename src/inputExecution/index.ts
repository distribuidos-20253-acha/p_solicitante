import { readFile } from "fs/promises"
import colors from "chalk"
import type NetAdapter from "../net/NetAdapter.ts"
import logVerbose, { writeLog } from "../utils/logVerbose.ts"
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
    await writeLog("Trying to init ClientZeroMQAdapter")
    await net.init();
    await writeLog("Succesfully inited ClientZeroMQAdapter")
  } catch (err) {
    await writeLog(`Error Trying to init ClientZeroMQAdapter`)
    console.error(err)
    process.exit(1)
  }

  try {
    const file_info = await readFile(INPUT_FILE, {
      encoding: "utf-8"
    })
    let data: Object[] = []

    try {
      data = JSON.parse(file_info)
    } catch (err) {
      await writeLog(`File does not contain a valid JSON Object`)
      console.error("Invalid file")
      process.exit(1)

    }

    if (!data?.length) {
      await writeLog(`File seems to be empty`)
      console.error("Invalid file")
      process.exit(1)
    }

    await writeLog(`Reading ${data.length} operations...`)
    for (let [index, operation] of data.entries()) {
      try {
        if (!await isValid(operation)) {
          await writeLog(`${index} - Invalid Operation`)
          throw new Error("Invalid Operation")
        }

        const op = (await inputSchema.safeParseAsync(operation)).data!;
        logVerbose("Intentando enviar")
        logVerbose(JSON.stringify(op, null, 2))
        await writeLog(`${index} - Valid Operation [${op.operation}]`)
        await writeLog(op)

        process.stdout.write(`${colors.cyan(op.operation)} > ${colors.yellow('user:')} ${op.user_id} > ${colors.yellow(`${op.copy_id ? "copy_id" : "book_id"}:`)} ${op.copy_id ?? op.book_id}`);
        process.stdout.write(`${colors.cyan(" ...")}`);

        let req;
        const time = new Date().getTime()
        await writeLog("Sending Operation...")

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

        await writeLog("Waiting for a response...")
        const data = await req;

        process.stdout.write(colors.green('\x1b[4D done\n'));

        logVerbose(`Request time: ${new Date().getTime() - time}ms`)
        await writeLog(`Request time: ${new Date().getTime() - time}ms`)

        logVerbose("Recibido:")
        logVerbose(JSON.stringify(data, null, 2))
        await writeLog(data)

      } catch (err) {
        console.error(colors.red("Invalid operation, ignoring it"))
        logVerbose(err)
      }
      await writeLog("")

    }
  } catch {
    await writeLog(`Error Trying to open file ${INPUT_FILE}`)
  }
}
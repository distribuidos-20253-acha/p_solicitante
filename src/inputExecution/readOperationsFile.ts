import { readFile } from "fs/promises"
import colors from "chalk"
import { writeLog } from "@acha/distribuidos"
import 'dotenv/config'
import { BibOperation, OperationFactory, OperationType, type BibResponse } from "@acha/distribuidos/schemas/BibOperation"

import { sendOperation } from "./index.ts"

export default async ({
  INPUT_FILE,
}: {
  INPUT_FILE: string,
}) => {


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
        let op: BibOperation;

        try {
          op = await OperationFactory.parseOperation(operation)
        } catch (err) {
          console.log(colors.red("Invalid Operation"));
          continue;
        }

        await writeLog(`${index} - Valid Operation [${op.getOperationLabel()}]`)

        const data = await sendOperation(op);

        if (op.getOperation() == OperationType.RESERVE) {
          if (data.ok) {
            console.log(colors.yellow("Reserva realizada"))
          } else {
            console.log(colors.yellow("No se pudo realizar la reserva, error:"), colors.red(data.body))
          }
        }

      } catch(err) {
        await writeLog("Error sending operation")
        console.error(err)
      }
    }
  } catch {
    await writeLog(`Error Trying to open file ${INPUT_FILE}`)
  }

}
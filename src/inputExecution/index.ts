import { writeLog } from "@acha/distribuidos";
import { OperationType, type BibOperation, type BibResponse } from "@acha/distribuidos/schemas/BibOperation";
import type { ZMQSender } from "@acha/distribuidos/zeromq/ZMQSender";
import colors from "chalk"
import ZMQSyncRequest from "../net/ZMQSyncRequest.ts";

export const sendOperation = async (op: BibOperation): Promise<BibResponse> => {
  try {
    const syncSocket: ZMQSender = ZMQSyncRequest.getInstance();

    process.stdout.write(op.toString());
    process.stdout.write(`${colors.cyan(" ...")}`);

    let req;
    const time = new Date().getTime()
    await writeLog("Sending Operation...")
    await writeLog(op.toStringNoColors())

    switch (op.getOperation()) {
      case OperationType.RENEW:
        req = syncSocket.sendRenew({
          body: op
        })
        break;
      case OperationType.RETURN:
        req = syncSocket.sendReturn({
          body: op
        })
        break;
      case OperationType.RESERVE:
        req = syncSocket.sendReserve({
          body: op
        })
        break;
    }

    await writeLog("Waiting for a response...")
    const data: BibResponse = await req;

    process.stdout.write(colors.green('\x1b[4D done\n'));

    const timeMsg = `Request time: ${new Date().getTime() - time}ms`

    console.log(timeMsg)

    await writeLog(timeMsg)
    await writeLog(data)

    return data

  } catch (err) {
    await writeLog(`Error sending operation`)
    throw err
  }
}
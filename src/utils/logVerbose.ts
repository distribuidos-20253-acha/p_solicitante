import colors from "chalk"
import { config } from "../../config.ts"
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { mkdirSync, writeFileSync } from "fs";

function getFormatedTimeNow(): string {
  const date = new Date();

  return `[${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}:${date.getMilliseconds()}]`
}

const date = new Date();
const filename = `log-${date.getFullYear()}${date.getMonth()}${date.getDate()}-${date.getHours()}_${date.getMinutes()}_${date.getSeconds()}.txt`
const logPath = path.join("./logs", filename);

const getLines = (logContent: string | Object, splitLines: boolean) => {
  let lines = [logContent];

  if (logContent instanceof Object) {
    lines = JSON.stringify(logContent, null, 2).split("\n")
  } else {
    if (splitLines) {
      lines = logContent.split("\n");
    }
  }

  return lines;
}

export const writeLogSync = (logContent: string | object, splitLines: boolean = false) => {
  try {
    mkdirSync("./logs")
  } catch { }

  for (const line of getLines(logContent, splitLines)) {
    writeFileSync(logPath, `${getFormatedTimeNow()} ${line}\n`, {
      encoding: "utf-8",
      flag: "a"
    })
  }
}

export const writeLog = async (logContent: string | object, splitLines: boolean = false) => {
  try {
    await mkdir("./logs");
  } catch { }

  for (const line of getLines(logContent, splitLines)) {
    await writeFile(logPath, `${getFormatedTimeNow()} ${line}\n`, {
      encoding: "utf-8",
      flag: "a"
    })
  }
}

export default async (msg: any) => {
  let logContent = msg;
  if (config.VERBOSE) console.log(colors.blue("[VERBOSE]", logContent))
}
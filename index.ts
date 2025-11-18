import { program } from "commander";
import friendly from "./src/friendly/index.ts";
import inputExecution from "./src/inputExecution/index.ts";
import { writeLog, showFigletTitle, Config } from "@acha/distribuidos"
const config = Config.getInstance();
config.setVersion("0.1.15")

program
  .option('-i, --input <file>')
  .option('-f, --friendly')
  .option('-v, --verbose')

program.showHelpAfterError(true)
program.parse()

const {
  input: INPUT_FILE, friendly: IS_FRIENDLY, verbose: VERBOSE
} = program.opts()

if (IS_FRIENDLY && INPUT_FILE) {
  console.error("You can use this program only friendly or with an input file, not the two options at the same.")
  program.help()
}
if (!IS_FRIENDLY && !INPUT_FILE) {
  console.error("Select at least one option")
  program.help()
}

config.setVerbose(Boolean(VERBOSE));

showFigletTitle("bib_db")

if (IS_FRIENDLY) {
  await writeLog("Friendly Mode")
  await writeLog("")
  friendly()
}
else {
  await writeLog("Input Mode")
  await writeLog(`Filename: ${INPUT_FILE}`)
  await writeLog("")
  inputExecution({
    INPUT_FILE
  })
}
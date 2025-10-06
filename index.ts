import { program } from "commander";
import friendly from "./src/friendly/index.ts";
import inputExecution from "./src/inputExecution/index.ts";
import { config } from "./config.ts";
import showFigletTitle from "./src/shared/showFigletTitle.ts";

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

config.VERBOSE = VERBOSE

showFigletTitle()

if (IS_FRIENDLY) friendly()
else inputExecution({
  INPUT_FILE
})
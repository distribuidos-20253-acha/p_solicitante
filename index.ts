import { program } from "commander";
import friendly from "./src/friendly/index.ts";
import inputExecution from "./src/inputExecution/index.ts";
import { config } from "./config.ts";

program
  .option('-i, --input <file>')
  .option('-f, --friendly')
  .option('-v, --verbose')

program.showHelpAfterError(true)
program.parse()

const {
  INPUT_FILE, friendly: IS_FRIENDLY, verbose: VERBOSE
} = program.opts()

if (IS_FRIENDLY && INPUT_FILE) {
  console.error("You can use this program only friendly or with an input file, not the two options at the same.")
}

config.VERBOSE = VERBOSE

if (IS_FRIENDLY) friendly()
else inputExecution({
  INPUT_FILE
})
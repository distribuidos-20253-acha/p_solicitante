import colors from "chalk"
import { config } from "../../config.ts"

export default (msg: any) => {
  if (config.VERBOSE) console.log(colors.blue("[VERBOSE]", msg))
}
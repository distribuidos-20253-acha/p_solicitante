import figlet from "figlet"
import colors from 'chalk'

export default () => {
  console.clear()
  console.log(colors.red.bold(figlet.textSync("BIB_DB")))
  console.log("v 0.0.1 -", colors.yellow("created by acha"))
}
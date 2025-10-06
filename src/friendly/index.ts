import { input, select } from "@inquirer/prompts"
import showFigletTitle from "../shared/showFigletTitle.ts"
import { existsSync } from "fs"
import inputExecution from "../inputExecution/index.ts"

export default async () => {
  showFigletTitle()

  while (1) {
    const option = await select({
      message: "Selecciona una opción: ",
      choices: [
        {
          value: "file",
          name: "Abrir archivo",
          description: "Carga un archivo local"
        }
      ]
    })


    switch (option) {
      case "file":
        console.clear()
        const filename = await input({
          message: "Ruta: ",
          required: true,
          validate: async (v) => {
            const doFileExists = existsSync(v)

            if (!doFileExists) return false
            return true
          }
        })

        await inputExecution({ INPUT_FILE: filename })

        console.log("\nEjecución del archivo Finalizada!\n")

        break;
    }
  }
}
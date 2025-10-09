import { input, search, select } from "@inquirer/prompts"
import showFigletTitle from "../shared/showFigletTitle.ts"
import { existsSync } from "fs"
import inputExecution from "../inputExecution/index.ts"
import "dotenv/config"
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
        },
        {
          value: "search",
          name: "Buscar un libro",
          description: "Busca un libro en la base de datos"
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
      case "search":
        throw new Error("Not implemented yet :(")
        const answer = await search({
          message: "Escribe el titulo de un libro",
          source: async (input, { signal }) => {
            if (!input) return []

            const response = await fetch(new URL(`/books/search?q=${encodeURIComponent(input)}`, process.env.CATALOG_SERVICE_URL).toString(), {
              signal
            })

            if (!response.ok) {
              throw new Error("Invalid query")
            }

            const data = await response.json() as any[]

            return data.map((book) => ({
              name: book.book_name,
              value: JSON.stringify(book),
              description: book.book_description
            }))
          }
        })

        console.table(JSON.parse(answer))
    }
  }
}
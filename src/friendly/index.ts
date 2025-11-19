import { input, search, select } from "@inquirer/prompts"
import { existsSync } from "fs"
import "dotenv/config"
import { writeLog, showFigletTitle } from "@acha/distribuidos"
import Table from "cli-table3";
import readOperationsFile from "../inputExecution/readOperationsFile.ts";
import { sendOperation } from "../inputExecution/index.ts";
import { InvalidOperationParamsError, OperationFactory, ParseOperationError } from "@acha/distribuidos/schemas/BibOperation";
import colors from "chalk"
import z from "zod";

const searchForABook = async () => {
  return await search({
    message: "Escribe el titulo de un libro",
    source: async (input, { signal }) => {
      if (!input) return []

      const response = await fetch(new URL(`/books/search?q=${encodeURIComponent(input)}`, process.env.CATALOG_SERVICE_URL).toString(), {
        signal
      })

      if (!response.ok) {
        throw new Error(`Invalid query ${response.status}`)
      }

      const data = await response.json() as any[]

      return data.map((book) => ({
        name: book.book_name,
        value: JSON.stringify(book),
        description: `${book.book_description} | ${book?.book_authors}`,
      }))
    }
  })
}

export default async () => {
  showFigletTitle("bib_db", false)

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
          value: "custom",
          name: "Crear Petición",
          description: "Genera una petición"
        },
        {
          value: "search",
          name: "Buscar un libro",
          description: "Busca un libro en la base de datos"
        },
        {
          value: "exit",
          name: "Salir del programa",
          description: "Adios!!! :D"
        }
      ]
    })

    await writeLog(`Friendly - User selected option: ${option}`)

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
        await writeLog(`Friendly - Filename: ${filename}`)

        await readOperationsFile({ INPUT_FILE: filename })

        console.log("\nEjecución del archivo Finalizada!\n")

        break;
      case "search": {
        // throw new Error("Not implemented yet :(")

        const answer = await searchForABook();

        const table = new Table({
          wordWrap: true,
          colWidths: [38, 20, 18, 12, 14, 20],
          head: [
            "book_id",
            "book_name",
            "total_book_count",
            "book_count",
            "book_authors",
            "book_description"
          ]

        })

        const row = JSON.parse(answer)

        table.push([
          row.book_id,
          row.book_name,
          row.total_book_count,
          row.book_count,
          row.book_authors,
          row.book_description
        ])

        console.log(table.toString());
        break;
      }
      case "custom": {
        const operation = await select({
          message: "Tipo de operación: ",
          choices: [
            {
              value: "renew",
              name: "Renovar (Asincrónica)",
              description: "Renovar la reserva de un libro"
            },
            {
              value: "return",
              name: "Devolver (Asincrónica)",
              description: "Devolver un libro"
            },
            {
              value: "reserve",
              name: "Reservar (Sincrónica)",
              description: "Reservar un libro"
            },
          ]
        })

        let opObj: any = {
          operation
        }

        try {
          switch (operation) {
            case "return":
            case "renew": {
              opObj.reserve_id = await input({
                message: "Código de reserva: ",
                required: true
              })

              const op = await OperationFactory.parseOperation(opObj)

              await sendOperation(op);

              break;
            }
            case "reserve": {
              const book = JSON.parse(await searchForABook())
              opObj.book_id = book.book_id;
              opObj.location = "BOG" // TODO: CAMBIAR!!!
              opObj.duration = await input({
                message: "Duración de la reserva: ",
                default: "2w",
                validate: async (value) => {
                  const schema = z.string()
                    .regex(/^\d+[dw]$/, "Formato inválido. Usa número+d/w, por ejemplo 12d o 2w")
                    .refine((val) => {
                      const num = parseInt(val.slice(0, -1), 10);
                      const unit = val.slice(-1)

                      if (unit == 'd' && num <= 14) return true;
                      if (unit == 'w' && num <= 2) return true;

                      return false;
                    }, "Duración máxima es 2 semanas")

                  const r = await schema.safeParseAsync(value);
                  if (r.error) return r.error.issues[0]?.message as string;
                  else return true;
                }
              })

              const op = await OperationFactory.parseOperation(opObj)

              const response = await sendOperation(op);

              if (response.ok) {
                console.log(colors.green("Reserva realizada con exito:", response.body))
              } else {
                console.log(colors.red("No se pudo realizar la reserva:", response.body))
              }
            }
          }
        } catch (err) {
          if (err instanceof ParseOperationError || err instanceof InvalidOperationParamsError) {
            writeLog("Error received")
            writeLog(err.message)
            console.error(colors.red(err.message))
          } else {
            writeLog("Unknown error received")
            console.error(err)
          }
        }

        break;
      }
      case "exit": {
        process.exit(0)
      }
    }
  }
}
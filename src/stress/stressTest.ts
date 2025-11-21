import { BibOperation, OperationFactory } from "@acha/distribuidos/schemas/BibOperation"
import "dotenv/config"
import { sendOperation } from "../inputExecution/index.ts";
import colors from "chalk"

const genReserveOperation = async (book_id: string): Promise<BibOperation> => {
  const query = {
    book_id,
    location: process.env.SEDE,
    duration: "2w",
    operation: "reserve"
  }

  return await OperationFactory.parseOperation(query);
}

const genReturnOperation = async (reserve_id: string): Promise<BibOperation> => {
  const query = {
    reserve_id,
    operation: "return"
  }

  return await OperationFactory.parseOperation(query);
}
const getRenewOperation = async (reserve_id: string): Promise<BibOperation> => {
  const query = {
    reserve_id,
    operation: "renew"
  }

  return await OperationFactory.parseOperation(query);
}

export default async () => {
  const rounds = 5;

  for(let i = 0; i < rounds; i++) {
    await round()
  }
}

const round = async () => {
  const req = await fetch(new URL(`/books/ids`, process.env.CATALOG_SERVICE_URL).toString())

  if (!req.ok) {
    throw new Error("Fetch Error")
  }

  const ids = await req.json() as string[];

  for (const [index, book_id] of ids.entries()) {
    let operation = await genReserveOperation(book_id)

    let response = await sendOperation(operation);
    
    if (response.ok) {
      console.log(colors.green("Reserva realizada con exito:", response.body))
    } else {
      console.log(colors.red("No se pudo realizar la reserva:", response.body))
      continue
    }
    
    const reserve_id = (response.body as string).trim();

    operation = await getRenewOperation(reserve_id)

    response = await sendOperation(operation);
 
    if (response.ok) {
      console.log(colors.green("Renovación realizada con exito:", response.body))
    } else {
      console.log(colors.red("No se pudo realizar la renovación:", response.body))
      continue
    }

    operation = await genReturnOperation(reserve_id)

    response = await sendOperation(operation);

    if (response.ok) {
      console.log(colors.green("Devolución realizada con exito:", response.body))
    } else {
      console.log(colors.red("No se pudo realizar la devolución:", response.body))
      continue
    }

  }


}
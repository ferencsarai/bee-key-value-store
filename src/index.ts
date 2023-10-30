import { JsonStorage } from "./JsonStorage"

main()

async function main() {
    const stamp = process.env.STAMP as string; // env STAMP variable
    console.log('stamp:', stamp)
    const jsonStorage = new JsonStorage(new URL("http://localhost:1633"), stamp)

    const abc = { first: 'abc1', second: 'abc2' }
    await jsonStorage.put('abc', abc)

    const def = { first: 'def1', second: 'def2' }
    await jsonStorage.put('def', def)

    await jsonStorage.get("abc")
    await jsonStorage.get("def")
}

import { getTerminalProfileLines } from './terminalProfile';

async function main() {
    const lines = await getTerminalProfileLines();
    console.log(lines.join(''));
}
main();

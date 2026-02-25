import qrcode from 'qrcode-generator';

export const getTerminalProfileLines = async (): Promise<string[]> => {
    const reset = "\x1b[0m";
    const bold = "\x1b[1m";
    const red = "\x1b[31m";
    const green = "\x1b[32m";

    const link = (url: string, text: string) => `\x1b]8;;${url}\x1b\\${text}\x1b]8;;\x1b\\`;

    const qr = qrcode(0, 'L');
    qr.addData('https://jonothan.dev');
    qr.make();

    const moduleCount = qr.getModuleCount();
    const margin = 0;
    const qrLines: string[] = [];

    for (let r = -margin; r < moduleCount + margin; r += 2) {
        let rowStr = ' ';
        for (let c = -margin; c < moduleCount + margin; c++) {
            const top = (r >= 0 && r < moduleCount && c >= 0 && c < moduleCount) ? qr.isDark(r, c) : false;

            const bottom = (r + 1 < moduleCount + margin) ?
                ((r + 1 >= 0 && r + 1 < moduleCount && c >= 0 && c < moduleCount) ? qr.isDark(r + 1, c) : false)
                : false;

            const isLastHalfRow = (r + 1 === moduleCount + margin);

            const invert = "\x1b[7m";
            const invertOff = "\x1b[27m";

            if (isLastHalfRow) {
                rowStr += top ? `${reset}${invert}▄${invertOff}` : ' ';
            } else if (top && bottom) {
                rowStr += `${reset}${invert} ${invertOff}`;
            } else if (!top && !bottom) {
                rowStr += ' ';
            } else if (top && !bottom) {
                rowStr += `${reset}${invert}▄${invertOff}`;
            } else {
                rowStr += `${reset}${invert}▀${invertOff}`;
            }
        }
        rowStr += reset;
        qrLines.push(rowStr);
    }

    const qrWidthChars = moduleCount + 1;
    const emptyQrSpace = " ".repeat(qrWidthChars);

    const textLines = [
        { styled: `${red}${bold}JONOTHAN HUNT${reset}`, len: 13 },
        { styled: ``, len: 0 },
        { styled: `${green}I'm a ${bold}creative technologist and developer${reset}`, len: 41 },
        { styled: `${green}creating innovative, award-winning experiences${reset}`, len: 46 },
        { styled: `${green}for brands like HSBC and the NHS, directing${reset}`, len: 43 },
        { styled: `${green}Creative Innovation at VML in London, UK.${reset}`, len: 41 },
        { styled: ``, len: 0 },
        { styled: ``, len: 0 },
        { styled: `${bold}${link('mailto:hey@jonothan.dev', 'hey@jonothan.dev')}${reset}`, len: 16 },
        { styled: `${bold}${link('https://jonothan.dev', 'https://jonothan.dev')}${reset}`, len: 20 },
        { styled: `\\O `.padStart(31, ' ') + ' '.repeat(15), len: 46 },
        { styled: ` |\\`.padStart(31, ' ') + ' '.repeat(15), len: 46 },
        { styled: `/ \\`.padStart(31, ' ') + ' '.repeat(15), len: 46 }
    ];

    const finalLines = [];
    const maxLines = Math.max(qrLines.length, textLines.length);
    const spacing = "    ";
    const maxTextWidth = 46;

    const innerWidth = 1 + qrWidthChars + spacing.length + maxTextWidth + 1;
    const borderTop = `╭${"─".repeat(innerWidth)}╮`;
    const borderBottom = `╰${"─".repeat(innerWidth)}╯`;

    finalLines.push(
        borderTop,
        `│${" ".repeat(innerWidth)}│`
    );

    for (let i = 0; i < maxLines; i++) {
        const qrLeft = qrLines[i] || emptyQrSpace;
        const textItem = textLines[i] || { styled: "", len: 0 };
        const textRight = textItem.styled;
        const textPadding = " ".repeat(maxTextWidth - textItem.len);

        finalLines.push(`│ ${qrLeft}${spacing}${textRight}${textPadding} │`);
    }

    finalLines.push(
        borderBottom,
        ""
    );

    return finalLines;
};
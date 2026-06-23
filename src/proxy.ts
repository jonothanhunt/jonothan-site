import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getTerminalProfileLines } from './utils/terminalProfile';

// Helper to pause execution
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export async function proxy(request: NextRequest) {
    const userAgent = request.headers.get('user-agent') || '';
    const isTerminal = userAgent.toLowerCase().includes('curl') ||
        userAgent.toLowerCase().includes('wget') ||
        userAgent.toLowerCase().includes('httpie');

    // Intercept the root path for terminal visitors
    if (isTerminal && request.nextUrl.pathname === '/') {
        const lines = await getTerminalProfileLines();

        // Create a ReadableStream to stream the response chunk by chunk
        const stream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();
                for (const line of lines) {
                    controller.enqueue(encoder.encode(line + '\n'));
                    // Add a tiny delay to simulate a terminal printing effect (typewriter effect)
                    await delay(30);
                }
                controller.close();
            },
        });

        return new NextResponse(stream, {
            status: 200,
            headers: {
                'content-type': 'text/plain; charset=utf-8',
                'x-terminal-view': 'true',
                // Ensure it streams properly without buffering
                'Transfer-Encoding': 'chunked',
            },
        });
    }

    return NextResponse.next();
}

// Only match the root path to avoid intercepting assets or other routes
export const config = {
    matcher: '/',
};

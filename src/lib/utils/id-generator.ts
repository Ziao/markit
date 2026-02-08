export function formatId(idNumber: number): string {
    if (idNumber < 1) {
        throw new Error('ID number must be >= 1');
    }
    return `#${String(idNumber).padStart(3, '0')}`;
}

export function parseId(idString: string): number {
    const cleaned = idString.replace(/^#/, '');
    const idNumber = parseInt(cleaned, 10);

    if (isNaN(idNumber) || idNumber < 1) {
        throw new Error(`Invalid task ID: ${idString}. Expected format: 001, #001, or 1`);
    }

    return idNumber;
}

export function extractIdFromLine(line: string): number | undefined {
    const match = line.match(/id:(\d+)/);
    if (match) {
        const idNumber = parseInt(match[1], 10);
        if (!isNaN(idNumber) && idNumber >= 1) {
            return idNumber;
        }
    }
    return undefined;
}

export function getNextId(existingIds: number[]): number {
    if (existingIds.length === 0) {
        return 1;
    }
    return Math.max(...existingIds) + 1;
}

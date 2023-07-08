export function convertToTimestamp(sentence) {
    const lowercaseSentence = sentence.toLowerCase();
    const now = Date.now();
    const match = lowercaseSentence.match(/\d+/);

    if (lowercaseSentence.includes("seconds ago")) {
        if (match) {
            const secondsAgo = parseInt(match[0]);
            return now - secondsAgo * 1000;
        }
    }

    if (lowercaseSentence.includes("minutes ago")) {
        if (match) {
            const minutesAgo = parseInt(match[0]);
            return now - minutesAgo * 60 * 1000;
        }
    }

    if (lowercaseSentence.includes("hours ago")) {
        if (match) {
            const hoursAgo = parseInt(match[0]);
            return now - hoursAgo * 60 * 60 * 1000;
        }
    }

    if (lowercaseSentence.includes("days ago")) {
        if (match) {
            const daysAgo = parseInt(match[0]);
            return now - daysAgo * 24 * 60 * 60 * 1000;
        }
    }

    if (lowercaseSentence.includes("months ago")) {
        if (match) {
            const monthsAgo = parseInt(match[0]);
            const date = new Date(now);
            date.setMonth(date.getMonth() - monthsAgo);
            return date.getTime();
        }
    }

    // If the sentence doesn't match any of the expected formats, return now
    return now;
}

export const token = "sk.eyJ1IjoiY29uZzg1MDEwIiwiYSI6ImNscGtybmxuNjA0ZjcybHIzaDhyajN5aWYifQ.aE1mnUmy3hiI8dZl9mi7zQ"

export const PRICE_TEXT = {
    0: "Miễn phí",
    1: "Ít",
    2: "Vừa phải",
    3: "Đắt",
    4: "Rất đắt"
}

export function convertUtcOffset(utcOffsetMinutes) {
    // Calculate hours and minutes
    var hours = Math.floor(utcOffsetMinutes / 60);
    var minutes = Math.abs(utcOffsetMinutes % 60);

    // Format the string
    var sign = utcOffsetMinutes >= 0 ? "+" : "-";
    var formattedOffset = `${sign}${Math.abs(hours).toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

    return formattedOffset;
}

var base64 = require('base-64');

export const token =
  "sk.eyJ1IjoiY29uZzg1MDEwIiwiYSI6ImNscGtybmxuNjA0ZjcybHIzaDhyajN5aWYifQ.aE1mnUmy3hiI8dZl9mi7zQ";

export const PRICE_TEXT = {
  0: "Miễn phí",
  1: "Ít",
  2: "Vừa phải",
  3: "Đắt",
  4: "Rất đắt",
};

export function convertUtcOffset(utcOffsetMinutes) {
  // Calculate hours and minutes
  var hours = Math.floor(utcOffsetMinutes / 60);
  var minutes = Math.abs(utcOffsetMinutes % 60);

  // Format the string
  var sign = utcOffsetMinutes >= 0 ? "+" : "-";
  var formattedOffset = `${sign}${Math.abs(hours)
    .toString()
    .padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;

  return formattedOffset;
}

export const radiusOptions = [
  { label: "500m", value: 500 },
  { label: "1Km", value: 1000 },
  { label: "2Km", value: 2000 },
  { label: "5Km", value: 5000 },
];


export const getImageBase64 = (image) => {
  return `data:image/png;base64,${image.base64}`
}

export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Bán kính của trái đất trong km
  const dLat = (lat2 - lat1) * Math.PI / 180;  // Chuyển đổi sang radian
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    0.5 - Math.cos(dLat)/2 + 
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    (1 - Math.cos(dLon))/2;

  return R * 2 * Math.asin(Math.sqrt(a));
}

// Hàm tìm kiếm bãi xe gần đây
export function findNearbyParkingLots(parkingLots, currentLat, currentLon, maxDistanceInKm) {
  return parkingLots.filter(lot => {
    const distance = calculateDistance(currentLat, currentLon, lot.latitude, lot.longitude);
    return distance < maxDistanceInKm;
  });
}
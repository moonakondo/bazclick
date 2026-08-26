const XLSX = require('xlsx');

// Sample dataset matching your zone format
const rawData = [
  { companyName: "Brand A", zone: "🏙️ South 📍 Zone 01", fbFollowers: 15000, igFollowers: 3400, gbpQuality: "High", metaAds: "Active", googleAds: "Deactive" },
  { companyName: "Brand B", zone: "🏙️ South 📍 Zone 01", fbFollowers: 8200, igFollowers: 1200, gbpQuality: "Medium", metaAds: "Active", googleAds: "Deactive" },
  { companyName: "Brand C", zone: "🏙️ North 📍 Zone 03", fbFollowers: 25000, igFollowers: 11000, gbpQuality: "High", metaAds: "Active", googleAds: "Active" },
  { companyName: "Brand D", zone: "🏙️ North 📍 Zone 05", fbFollowers: 4500, igFollowers: 500, gbpQuality: "Low", metaAds: "Active", googleAds: "Deactive" },
  { companyName: "Brand E", zone: "🏙️ North 📍 Zone 05", fbFollowers: 1200, igFollowers: 300, gbpQuality: "Medium", metaAds: "Active", googleAds: "Deactive" },
  { companyName: "Brand F", zone: "🏙️ North 📍 Zone 03", fbFollowers: 9800, igFollowers: 2100, gbpQuality: "High", metaAds: "Active", googleAds: "Deactive" },
  { companyName: "Brand G", zone: "🏙️ North 📍 Zone 02", fbFollowers: 3100, igFollowers: 800, gbpQuality: "Low", metaAds: "Active", googleAds: "Deactive" },
  { companyName: "Brand H", zone: "🏙️ South 📍 Zone 02", fbFollowers: 54000, igFollowers: 15000, gbpQuality: "High", metaAds: "Active", googleAds: "Active" },
  { companyName: "Brand I", zone: "🏙️ South 📍 Zone 01", fbFollowers: 2300, igFollowers: 400, gbpQuality: "Medium", metaAds: "Active", googleAds: "Deactive" },
  { companyName: "Brand J", zone: "🏙️ North 📍 Zone 04", fbFollowers: 11200, igFollowers: 4300, gbpQuality: "High", metaAds: "Active", googleAds: "Deactive" },
  { companyName: "Brand K", zone: "🏙️ South 📍 Zone 04", fbFollowers: 6700, igFollowers: 900, gbpQuality: "Medium", metaAds: "Active", googleAds: "Deactive" },
  { companyName: "Brand L", zone: "🏙️ North 📍 Zone 02", fbFollowers: 8900, igFollowers: 1800, gbpQuality: "Low", metaAds: "Active", googleAds: "Deactive" },
  { companyName: "Brand M", zone: "🏙️ North 📍 Zone 03", fbFollowers: 19500, igFollowers: 6200, gbpQuality: "High", metaAds: "Active", googleAds: "Deactive" }
];

// Map and format rows
const formattedData = rawData.map(item => {
  let cityCorporation = "";
  if (item.zone.includes("South")) {
    cityCorporation = "🟢 Dhaka South City Corporation (DSCC)";
  } else if (item.zone.includes("North")) {
    cityCorporation = "🔵 Dhaka North City Corporation (DNCC)";
  }

  return {
    "Company / Brand": item.companyName,
    "City Corporation": cityCorporation,
    "Zone": item.zone,
    "FB Followers": item.fbFollowers,
    "IG Followers": item.igFollowers,
    "GBP Quality": item.gbpQuality,
    "Facebook Ads": item.metaAds,
    "Google Ads": item.googleAds
  };
});

// Create Workbook & Worksheet
const worksheet = XLSX.utils.json_to_sheet(formattedData);
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, "Scraped Data");

// Write to file
const outputPath = "scraped_brands_data.xlsx";
XLSX.writeFile(workbook, outputPath);

console.log(`Excel file created successfully: ${outputPath}`);
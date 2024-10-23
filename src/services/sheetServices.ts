import { google } from "googleapis";
import { handleError } from "../utils/errorHandler";
import { OAuth2Client } from "google-auth-library";

/**
 * Service to get all data from a Google Sheet.
 * @param {string} sheetId - The ID of the Google Sheet.
 * @param {any} auth - The OAuth2 client for authentication.
 * @returns {Promise<Object>} - A promise that resolves to the full sheet data.
 */
export const getFullSheetDataService = async (
  sheetId: string,
  auth: OAuth2Client
): Promise<{ [sheetName: string]: any[] }> => {
  const sheets = google.sheets({ version: "v4", auth });

  try {
    const sheetMetadata = await sheets.spreadsheets.get({
      spreadsheetId: sheetId,
    });

    const sheetData = sheetMetadata.data.sheets;
    const fullSheetData: { [sheetName: string]: any[] } = {};

    if (sheetData && sheetData.length) {
      for (const sheet of sheetData) {
        const sheetName = sheet.properties?.title || "Untitled Sheet";

        const response = await sheets.spreadsheets.values.get({
          spreadsheetId: sheetId,
          range: sheetName,
        });

        const rows = response.data.values || [];
        fullSheetData[sheetName] = rows;
      }
    }

    return fullSheetData;
  } catch (error) {
    const errorMessage = handleError(error);
    console.error("Error retrieving data from Google Sheet:", errorMessage);
    throw new Error(errorMessage);
  }
};

export const getRecentSheetsService = async (
  maxResults: number,
  auth: OAuth2Client
): Promise<any[]> => {
  const drive = google.drive({ version: "v3", auth });

  try {
    const response = await drive.files.list({
      pageSize: maxResults,
      fields: "files(id, name, modifiedTime)",
      orderBy: "modifiedTime desc",
      q: "mimeType='application/vnd.google-apps.spreadsheet'",
    });

    const files = response.data.files || [];

    return files;
  } catch (error) {
    console.error("Error fetching recent sheets from Google Drive:", error);
    throw error;
  }
};

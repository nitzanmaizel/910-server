import { Request, Response, NextFunction } from "express";
import SheetModel from "../models/SheetModel";
import UserModel from "../models/UserModal";
import {
  getFullSheetDataService,
  getRecentSheetsService,
} from "../services/sheetServices";
import { processSheetData, groupDataByColumn } from "../utils/sheetUtils";
import { OAuth2Client } from "google-auth-library";
import { google } from "googleapis";

/**
 * Controller to process raw sheet data, group it, and save to the database.
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next middleware function.
 */
export const processRawSheetController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { sheetId, groupName } = req.params;
  const auth = req.oauth2Client as OAuth2Client;

  const sheetData = await SheetModel.findOne({ sheetId });

  if (sheetData && sheetData.groupTab === groupName) {
    res.status(200).json({ message: "Data from Database.", data: sheetData });
    return;
  }

  if (!groupName) {
    res
      .status(400)
      .json({ error: "groupName is required in the request body." });
    return;
  }

  try {
    const fullSheetData = await getFullSheetDataService(sheetId, auth);

    const sheetTabName = Object.keys(fullSheetData)[0];

    const rawData = fullSheetData[sheetTabName];

    const { data: processedData, headers } = processSheetData(rawData);

    if (!headers.includes(groupName)) {
      res
        .status(400)
        .json({ error: `Column '${groupName}' does not exist in the sheet.` });
      return;
    }

    const groupedData = groupDataByColumn(processedData, groupName);

    const sheetDocument = new SheetModel({
      sheetId,
      sheetName: sheetTabName,
      groupTab: groupName,
      groups: groupedData,
      headers: headers,
    });

    await sheetDocument.save();

    await UserModel.findByIdAndUpdate(
      req?.user?.userId,
      {
        $addToSet: {
          sheets: { _id: sheetDocument._id, title: sheetTabName },
        },
      },
      { new: true }
    );

    const sheet = {
      id: sheetDocument._id,
      sheetName: sheetTabName,
      groupTab: groupName,
      groups: groupedData,
      headers,
    };

    res.status(200).json(sheet);
  } catch (error) {
    console.error("Error processing and saving grouped sheet data:", error);
    next(error);
  }
};

export const getSheetByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { sheetId } = req.params;

    const sheetData = await SheetModel.findOne({ _id: sheetId });

    res
      .status(200)
      .json({ message: "Get data for sheetId ${sheetId}", data: sheetData });
  } catch (error) {
    console.error("Error fetching or processing sheet data:", error);
    next(error);
  }
};

export const getRecentSheetsController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const auth = req.oauth2Client as OAuth2Client;
  const maxResults = parseInt(req.query.maxResults as string, 10) || 10;

  try {
    const files = await getRecentSheetsService(maxResults, auth);
    res.status(200).json({ sheets: files });
  } catch (error) {
    console.error("Error fetching recent sheets:", error);
    next(error);
  }
};

/**
 * Controller to fetch headers (first row) from a specific Google Sheet.
 */
export const getSheetHeadersController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { sheetId } = req.params;
  const auth = req.oauth2Client;

  try {
    const sheets = google.sheets({ version: "v4", auth });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: "A1:Z1",
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      res.status(404).json({ error: "No data found in the sheet." });
      return;
    }

    const headers = rows[0];

    res.status(200).json({ headers });
  } catch (error) {
    console.error("Error fetching sheet headers:", error);
    next(error);
  }
};

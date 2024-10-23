import express from "express";
import {
  getRecentSheetsController,
  getSheetByIdController,
  getSheetHeadersController,
  processRawSheetController,
} from "../controllers/sheetsController";

const router = express.Router();

router.get("/recent", getRecentSheetsController);
router.get("/:sheetId", getSheetByIdController);
router.get("/:sheetId/headers", getSheetHeadersController);
router.get("/:sheetId/process-raw/:groupName", processRawSheetController);

export default router;

import mongoose, { Document, Schema } from "mongoose";

export interface ISheet extends Document {
  sheetId: string;
  sheetName: string;
  groupTab: string;
  groups: { [key: string]: any[] };
  headers: string[];
}

const SheetSchema: Schema = new Schema({
  sheetId: { type: String, required: true },
  sheetName: { type: String, required: true },
  groupTab: { type: String, required: true },
  groups: { type: Object, required: true },
  headers: { type: [String], required: true },
});

export default mongoose.model<ISheet>("sheets", SheetSchema);

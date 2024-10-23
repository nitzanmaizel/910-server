export interface ISheet {
  sheetId: string;
  sheetName: string;
  groupTab: string;
  headers: string[];
  groups: {
    [k: string]: [{ [k: string]: string | number | null }];
  };
}

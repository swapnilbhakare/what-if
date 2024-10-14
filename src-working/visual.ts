
"use strict";

import powerbi from "powerbi-visuals-api";
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import "./../style/visual.less";
import { createRoot } from "react-dom/client"; // Import createRoot from react-dom/client

import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import ISelectionManager = powerbi.extensibility.ISelectionManager;
import DataView = powerbi.DataView;
import { VisualFormattingSettingsModel } from "./settings";
import * as React from "react";
import * as ReactDOM from "react-dom";
import IDownloadService = powerbi.extensibility.IDownloadService;
import App from "./App";
interface IVisualHostExtended extends IVisualHost {
  getAccessToken: () => Promise<string>;
  getReportId: () => Promise<string>;
  createSelectionManager: () => ISelectionManager;
}
export class Visual implements IVisual {
  private target: HTMLElement;
  private static downloadService: IDownloadService;
  private host: any;

  private formattingSettings: VisualFormattingSettingsModel;
  private formattingSettingsService: FormattingSettingsService;
  private container: HTMLElement;
  exportDataCb: any;

  constructor(options: VisualConstructorOptions) {
    this.formattingSettingsService = new FormattingSettingsService();
    this.target = options.element;
    this.host= options.host
    Visual.downloadService = options.host.downloadService;
    this.exportDataCb = this.createExportDataCb(options.host.downloadService);
  }

  public update(options: VisualUpdateOptions) {
    this.formattingSettings =
      this.formattingSettingsService.populateFormattingSettingsModel(
        VisualFormattingSettingsModel,
        options.dataViews[0]
      );
    const dataView: DataView = options.dataViews[0];
    const root = React.createElement(App, {
      options: options,
      target: this.target,
      host: this.host,
      dataView: dataView,
      formattingSettings: this.formattingSettings,
      exportDataCb: this.exportDataCb,
    });
    ReactDOM.render(root, this.target);
  }

  private createExportDataCb(downloadService: IDownloadService): Function {
    return (contentString: string, contentType: string) => {
      const fileTypes = {
        "xlsx file": "result.xlsx",
        "txt file": "result.txt",
        "csv file": "result.csv",
        "pdf file": "result.pdf",
      };
      const fileName = fileTypes[contentType];
      const encoding = contentType === "pdf file" ? "base64" : "txt";
      downloadService.exportVisualsContent(
        contentString,
        fileName,
        encoding,
        contentType
      );
    };
  }

  /**
   * Returns properties pane formatting model content hierarchies, properties and latest formatting values, Then populate properties pane.
   * This method is called once every time we open properties pane or when the user edit any format property.
   */
  public getFormattingModel(): powerbi.visuals.FormattingModel {
    return this.formattingSettingsService.buildFormattingModel(
      this.formattingSettings
    );
  }
}

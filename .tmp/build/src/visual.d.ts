import powerbi from "powerbi-visuals-api";
import "./../style/visual.less";
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
export declare class Visual implements IVisual {
    private target;
    private static downloadService;
    private host;
    private formattingSettings;
    private formattingSettingsService;
    private container;
    exportDataCb: any;
    constructor(options: VisualConstructorOptions);
    update(options: VisualUpdateOptions): void;
    private createExportDataCb;
    getFormattingModel(): powerbi.visuals.FormattingModel;
}

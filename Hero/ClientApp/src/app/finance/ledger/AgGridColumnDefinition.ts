export class AgGridColumnDefinition {
    public headerName: string;
    public field: string;
    public checkboxSelection?: boolean;
    public width?: number;
    public headerTooltip?: string;
    public onCellClicked?: (params) => void;
}
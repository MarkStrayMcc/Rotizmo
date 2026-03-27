export class Activity {
    public activityMapId?: number;
    public parentActivityMapId?: number;
    public activityMasterId?: number;
    public code: string;
    public description: string;
    public availableActivities: Activity[];

    constructor(public level: number) {}
}

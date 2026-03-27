export class BlastZoneReservationGetResponse {
    public Id: string;
    public ClientId: string;
    public IsRenewable: boolean;
    public ReservationExpiryDate: string;
    public CapacityStartDate: string;
    public CapacityEndDate: string;
    public FloatingValue: number;
    public FirstLossLimit: number;
    public Reservations: BlastZoneReservation[];
}

export class BlastZoneReservation {
    public Id: string;
    public Location: {
        Latitude: number;
        Longitude: number;
    };
    public Exposure: number;
}

export interface IRegion {
    id: number;
    name: string;
}

export interface Questions {
    id: number;
    question: string;
    currentRegionId: number;
}

export interface ICycle {
    id: number;
    noOfdays: number;
}

// write a scheduler that will change the cycle every noOfDats
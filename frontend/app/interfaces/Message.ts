import type AnimalInfo from "./AnimalInfo";

export default interface Message {
    type:
        | "message"
        | "error"
        | "progress"
        | "connection_status"
        | "sessionId"
        | "title"
        | "animal"
        | "status";
    content: string;
    role?: "system" | "user";
    image?: string;
    animal?: AnimalInfo;
    csv?: string;
    migrationData?: {
        resting: [
            {
                year: number;
                locationLong: [number];
                locationLat: [number];
            },
        ];
        stopover: [
            {
                year: number;
                locationLong: [number];
                locationLat: [number];
            },
        ];
    };
    threatData?: [{ year: number; population: number }];
}

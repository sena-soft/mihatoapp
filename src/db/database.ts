import Dexie, { type EntityTable } from "dexie";

export interface Animal {
  id?: number;
  earTag: string;
  name: string;
  breed: string;
  sex: "Macho" | "Hembra";
  birthDate?: string;
  createdAt: Date;
}
export interface WeightRecord {
  id?: number;
  animalId?: number;
  animalLabel: string;
  weight: number;
  method: "bovinometric-tape" | "body-measurements";
  heartGirth?: number;
  bodyLength?: number;
  measuredAt: Date;
}
class LivestockDatabase extends Dexie {
  animals!: EntityTable<Animal, "id">;
  weightRecords!: EntityTable<WeightRecord, "id">;
  constructor() {
    super("MiHatoAppDB");
    this.version(1).stores({
      animals: "++id, &earTag, name, breed, sex",
      weightRecords: "++id, animalId, measuredAt, method"
    });
  }
}
export const db = new LivestockDatabase();
export type WeightMethod = "bovinometric-tape" | "body-measurements";

export interface WeightCalculationInput {
  method: WeightMethod;
  heartGirth?: number;
  bodyLength?: number;
  tapeWeight?: number;
}
export interface WeightCalculationResult {
  estimatedWeight: number;
  unit: "kg";
  method: WeightMethod;
  calculatedAt: Date;
}

const SCHAEFFER_METRIC_DIVISOR = 10838.2;

export function calculateWeight(input: WeightCalculationInput): WeightCalculationResult {
  let weight: number;
  if (input.method === "bovinometric-tape") {
    if (input.tapeWeight === undefined || !Number.isFinite(input.tapeWeight) || input.tapeWeight <= 0)
      throw new Error("Ingresa una lectura válida de la cinta bovinométrica.");
    weight = input.tapeWeight;
  } else {
    const { heartGirth, bodyLength } = input;
    if (heartGirth === undefined || bodyLength === undefined ||
        !Number.isFinite(heartGirth) || !Number.isFinite(bodyLength) ||
        heartGirth <= 0 || bodyLength <= 0)
      throw new Error("Ingresa medidas válidas en centímetros.");
    weight = (heartGirth ** 2 * bodyLength) / SCHAEFFER_METRIC_DIVISOR;
  }
  return { estimatedWeight: Number(weight.toFixed(1)), unit: "kg", method: input.method, calculatedAt: new Date() };
}
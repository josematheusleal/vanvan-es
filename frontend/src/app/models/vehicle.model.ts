/**
 * DTO do veículo retornado pelo backend.
 * Unifica Vehicle (admin.service) e VehicleResponse (vehicle.service).
 */
export interface Vehicle {
  id: string;
  modelName: string;
  licensePlate: string;
  documentPath: string;
  photoPath: string | null;
  driverId: string;
  driverName?: string;
}

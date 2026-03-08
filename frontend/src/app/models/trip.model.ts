/**
 * Viagem passada completa (usada em viagens-motorista e ofertar-viagem).
 */
export interface PastTrip {
  id: string;
  origin: string;
  originLocation?: string;
  originReference?: string;
  destination: string;
  destinationLocation?: string;
  destinationReference?: string;
  price: string;
  distance: string;
  date: string;
  time: string;
  passengers?: number;
  status?: 'completed' | 'cancelled';
  vehicleName?: string;
  vehiclePlate?: string;
}

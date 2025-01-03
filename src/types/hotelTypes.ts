import { Manager } from "./managerTypes";

export interface Rooms {
    guests ?: number | null;
    bedrooms ?: number | null;
    bathrooms ?: number | null;
    diningrooms ?: number | null;
    livingrooms ?: number | null;
}

export interface Address {
    city ?: string;
    state ?: string;
    country ?: string;
    postalCode ?: string;
}

export interface RoomCategory {
    name: string;
    bedType: string;
    capacity: number;
    quantity: number;
    rate: number;
    description?: string;
  }

export interface Hotel {
    unavailableDates: any;
    availability: string;
    reviews: number;
    rating: number;
    isListed: boolean;
    manager: Manager | string;
    _id : string;
    name: string;
    address: Address;
    rooms: Rooms;
    roomCategories: RoomCategory[];
    amenities: string[];
    description: string;
    photos: string[]; 
    price: string | null;
    managerId?: string;
    isVerified : boolean
}


export interface HotelFormState {
    manager: Manager | null;
    propertyType: string;
    placeType: string;
    roomCategories: RoomCategory[];
    address: Address;
    rooms: Rooms;
    amenities: string[];
    name: string;
    description: string;
    photos: string[];
    price: number | null;
    step: number
    isLoading: boolean;
    isSuccess: boolean;
    isError: boolean;
    message: string;
    hotels: Hotel[]
    hotel ?: any
    isListed : boolean
  }

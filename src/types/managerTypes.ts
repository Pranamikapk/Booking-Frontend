import { Hotel } from "./hotelTypes"

export interface Manager {
    _id: string
    name: string
    email: string
    token: string
    isBlocked: boolean
    isVerified?: boolean
    isApproved?: boolean
    phone: string
    licence: string
    wallet?: number
    hotels: Hotel[]  
}

export interface ManagerData {
    _id?: string
    name?: string
    email: string
    phone?: string
    password?: string
}

export interface ManagerResponse {
    _id: string
    name: string
    email: string
    token: string
    isBlocked: boolean
    isVerified?: boolean
    isApproved?: boolean
    phone: string
    licence: string
    wallet?: number
    hotelId: Hotel | null
    hotels: Hotel[]
}
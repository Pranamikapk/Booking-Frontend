import React, { useEffect, useRef, useState } from 'react'
import { Crop, PixelCrop } from 'react-image-crop'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { AppDispatch, RootState } from '../../app/store'
import PhotoUploader from '../../components/PhotoUploader'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Checkbox from '../../components/ui/Checkbox'
import InputField from '../../components/ui/InputField'
import TextArea from '../../components/ui/TextArea'
import { fetchHotelById, updateHotel } from '../../features/hotel/hotelSlice'
import { Address, Hotel, RoomCategory } from '../../types/hotelTypes'
import RoomCategories from './AddHotel/RoomCategory'


const EditHotel: React.FC = () => {
  const { hotelId } = useParams<{ hotelId: string }>()
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { hotel, isLoading, isError, message } = useSelector((state: RootState) => state.hotelAuth)
  
  const [formData, setFormData] = useState<Partial<Hotel>>({
    name: '',
    address: { city: '', state: '', country: '', postalCode: '' },
    price: 0,
    description: '',
    amenities: [],
    photos: [],
    roomCategories: []
  })

  const [cropImage, setCropImage] = useState<string | null>(null)
  const [crop, setCrop] = useState<Crop>({ unit: '%', width: 100, height: 100, x: 0, y: 0 })
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const allAmenities = ['Wi-Fi', 'Parking', 'Pool', 'Gym', 'Fridge', 'A/C', 'TV', 'Kitchen', 'First Aid']

  useEffect(() => {
    if (hotelId) {
      dispatch(fetchHotelById(hotelId))
    }
  }, [dispatch, hotelId])

  useEffect(() => {
    if (hotel) {
      setFormData({
        name: hotel.name,
        address: { ...hotel.address },
        price: hotel.price,
        description: hotel.description,
        amenities: hotel.amenities || [],
        photos: hotel.photos || [],
        roomCategories: hotel.roomCategories || []
      })
    }
  }, [hotel])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      ...(name.includes('address.') 
        ? { address: { ...prev.address, [name.split('.')[1]]: value } } 
        : { [name]: value }),
    }))
  }

  const toggleAmenity = (amenity: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities?.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...(prev.amenities || []), amenity],
    }))
  }

  const handleRoomCategoriesChange = (updatedCategories: RoomCategory[]) => {
    setFormData((prev) => ({
      ...prev,
      roomCategories: updatedCategories
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()    
    if (hotelId) {
      try {
        const updatedData = {
          ...formData,
          price: Number(formData.price),
        }
        await dispatch(updateHotel({ hotelId, updatedData })).unwrap()
        navigate(`/manager/hotel/${hotelId}`)
      } catch (error) {
        console.error('Failed to update hotel:', error)
      }
    }
  }

  const handlePhotoChange = (newPhoto: string) => {
    // Implement photo adding logic here
    console.log("New photo:", newPhoto);
    setFormData(prev => ({...prev, photos: [...(prev.photos || []), newPhoto]}))
  }

  const removePhoto = (photoToRemove: string) => {
    // Implement photo removing logic here
    console.log("Photo to remove:", photoToRemove);
    setFormData(prev => ({...prev, photos: (prev.photos || []).filter(photo => photo !== photoToRemove)}))
  }

  const handleSaveCroppedImage = async () => {
    if (completedCrop && imgRef.current) {
      // Implement image cropping and saving logic here
      setIsSaving(true)
      try {
        // ... your image cropping and saving logic here ...
        setIsSaving(false)
      } catch (error) {
        console.error("Error saving cropped image:", error)
        setIsSaving(false)
      }
    }
  }


  if (isLoading) return <div className="flex justify-center items-center h-screen">Loading...</div>
  if (isError) return <div className="flex justify-center items-center h-screen text-red-500">Error: {message}</div>

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <h1 className="text-3xl font-bold mb-4">Edit Hotel</h1>
          
          <InputField label="Hotel Name" name="name" value={formData.name || ''} onChange={handleInputChange} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['city', 'state', 'country', 'postalCode'].map((field) => (
              <InputField 
                key={field} 
                label={field.charAt(0).toUpperCase() + field.slice(1)} 
                name={`address.${field}`} 
                value={formData.address?.[field as keyof Address] || ''} 
                onChange={handleInputChange} 
              />
            ))}
          </div>

          <InputField 
            label="Price per Night" 
            name="price" 
            type="number" 
            value={formData.price?.toString() || ''} 
            onChange={handleInputChange} 
          />

          <TextArea 
            label="Description" 
            name="description" 
            value={formData.description || ''} 
            onChange={handleInputChange} 
          />

          <div>
            <label className="block text-sm font-medium mb-2">Amenities</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {allAmenities.map((amenity) => (
                <Checkbox 
                  key={amenity} 
                  label={amenity} 
                  checked={formData.amenities?.includes(amenity) || false} 
                  onChange={() => toggleAmenity(amenity)} 
                />
              ))}
            </div>
          </div>

          <RoomCategories
            formData={{ roomCategories: formData.roomCategories || [] }}
            handleChange={handleRoomCategoriesChange}
            errors={errors}
          />

          <PhotoUploader  
            photos={formData.photos || []} 
            addPhoto={handlePhotoChange} 
            removePhoto={removePhoto} 
            cropImage={cropImage}
            setCrop={setCrop}
            crop={crop}
            setCompletedCrop={setCompletedCrop}
            imgRef={imgRef}
            handleSaveCroppedImage={handleSaveCroppedImage}
            isSaving={isSaving}
          />

          <Button type="submit" className="w-full bg-blue-500 text-white hover:bg-blue-600 transition duration-200">
            Update Hotel
          </Button>
        </form>
      </Card>
    </div>
  )
}

export default EditHotel


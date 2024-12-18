import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../../app/store';
import Button from '../../components/ui/Button';
import { createHotel, updateFormData } from '../../features/hotel/hotelSlice';
import { HotelFormState } from '../../types/hotelTypes';
import Address from './AddHotel/Address';
import Amenities from './AddHotel/Amenities';
import Photo from './AddHotel/Photo';
import PlaceType from './AddHotel/PlaceType';
import Price from './AddHotel/Price';
import PropertyType from './AddHotel/PropertyType';
import Room from './AddHotel/Room';
import RoomCategories from './AddHotel/RoomCategory';

const AddHotel = () => {
    const dispatch = useDispatch<AppDispatch>()
    const {propertyType, placeType, roomCategories, address, rooms, amenities, name, description, photos, price, step, isLoading, isSuccess, isError, message } = useSelector(
        (state : RootState) => state.hotelAuth
    )
    const navigate = useNavigate()
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isFormValid, setIsFormValid] = useState(false);

    const validateStep = (stepData: any): boolean => {
        let stepErrors: Record<string, string> = {};
        let isValid = true;

        switch (step) {
            case 0: 
                if (!propertyType) {
                    stepErrors.propertyType = "Property type is required";
                    isValid = false;
                }
                break;
            case 1: 
                if (!placeType) {
                    stepErrors.placeType = "Place type is required";
                    isValid = false;
                }
                break;
            case 2: 
                if (placeType === 'Room' || placeType === 'Shared Space') {
                    if (!roomCategories || roomCategories.length === 0) {
                        console.log("All required");
                        
                    stepErrors.roomCategories = "At least one room category is required";
                    isValid = false;
                    } else {
                    const invalidCategories = roomCategories.some(
                        cat => !cat.name || cat.capacity < 1 || cat.quantity < 1 || cat.rate < 0
                    );
                    if (invalidCategories) {
                        console.log("Invalid");
                        
                        stepErrors.roomCategories = "All room categories must have valid details";
                        isValid = false;
                    }
                    }
                } else {
                    if ((rooms?.guests ?? 0) < 1 || (rooms?.bedrooms ?? 0) < 1 || (rooms?.bathrooms ?? 0) < 1) {
                    stepErrors.rooms = "Invalid room configuration";
                    isValid = false;
                    }
                }
                break;
            case 3: 
                if (amenities.length === 0) {
                    stepErrors.amenities = "At least one amenity is required";
                    isValid = false;
                }
                break;
            case 4: 
                if (!name || !description || photos.length === 0) {
                    stepErrors.photo = "Name, description, and at least one photo are required";
                    isValid = false;
                }
                break;
            case 5: 
                if (!address.city || !address.state || !address.country || !address.postalCode) {
                    stepErrors.address = "All address fields are required";
                    isValid = false;
                }
                break;
            case 6: 
                if (!price || price <= 0) {
                    stepErrors.price = "Valid price is required";
                    isValid = false;
                }
                break;
        }

        setErrors(stepErrors);
        setIsFormValid(isValid);
        return isValid;
    };
console.log(errors);

    const nextStep = () => {
        if (validateStep(step)) {
            const nextStepIndex = (placeType === 'Room' || placeType === 'Shared Space') && step === steps.length - 2 ? step + 2 : step + 1;
            dispatch(updateFormData({ step: nextStepIndex }));
        }
    };

    const prevStep = () => dispatch(updateFormData({step : step - 1}));

    const handleChange = (data: Partial<HotelFormState>) => {
        dispatch(updateFormData(data))
        validateStep(step);
    };

    const handleSubmit = async () => {
        if (validateStep(step)) {
            const formData: HotelFormState = {
                propertyType,
                placeType,
                roomCategories,
                address,
                rooms,
                amenities,
                name,
                description,
                photos,
                price,
                step,
                isLoading,
                isSuccess,
                isError,
                message,
                manager: null,
                hotels: [],
                isListed: false
            };
            dispatch(createHotel(formData));
        }
    }

    useEffect(() => {
        if (isSuccess) {
            navigate('/manager/hotels')
        }
    }, [isSuccess, navigate]);

    useEffect(() => {
        validateStep(step);
    }, [step]);

    if(isLoading){
        return <p>Loading ...</p>
    }

    const steps = [
        <PropertyType formData={{propertyType}} handleChange={handleChange} errors={errors} />,
        <PlaceType formData={{placeType}} handleChange={handleChange} errors={errors} />,
            placeType === 'Room' || placeType === 'Shared Space' ? (
        <RoomCategories 
            formData={{ roomCategories }}
            handleChange={(data) => handleChange({ roomCategories: data.roomCategories })} 
            errors={errors}
            />
          ) : (
            <Room 
              formData={{
                rooms: {
                  guests: rooms.guests || 1,
                  bedrooms: rooms.bedrooms || 0,
                  bathrooms: rooms.bathrooms || 0,
                  diningrooms: rooms.diningrooms || 0,
                  livingrooms: rooms.livingrooms || 0
                }
              }} 
              handleChange={handleChange} 
              errors={errors} 
            />
          ),
        <Amenities formData={{amenities}} handleChange={handleChange} errors={errors} />,
        <Photo formData={{name ,description ,photos }} handleChange={handleChange} errors={errors} />,
        <Address formData={{
            address: {
                city: address?.city || '',
                state: address?.state || '',
                country: address?.country || '',
                postalCode: address?.postalCode || ''
            }
        }} handleChange={handleChange} errors={errors} />,
        ...(placeType !== 'Room' && placeType !== 'Shared Space' ? [
            <Price formData={{ price }} handleChange={handleChange} errors={errors} />
        ] : [])    
    ];

    return (
        <div className="max-w-2xl mx-auto p-4">
            {steps[step]}
            <div className="flex justify-between mt-4">
                {step > 0 && (
                    <Button 
                        onClick={prevStep} 
                        variant="secondary"
                    >
                        Previous
                    </Button>
                )}
                {step < steps.length - 1 && (
                    <Button 
                        onClick={nextStep} 
                        disabled={!isFormValid || Object.keys(errors).length > 0}
                        className="ml-auto"
                    >
                        Next
                    </Button>
                )}
                {step === steps.length - 1 && (
                    <Button 
                        onClick={handleSubmit} 
                        disabled={!isFormValid}
                        className="ml-auto"
                    >
                        Submit
                    </Button>
                )}
            </div>
        </div>
    );
};

export default AddHotel;
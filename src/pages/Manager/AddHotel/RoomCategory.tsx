import { Plus, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { RoomCategory } from '../../../types/hotelTypes';

interface RoomCategoriesProps {
  formData: {
    roomCategories: RoomCategory[];
  };
  handleChange: (updatedCategories: RoomCategory[]) => void;
  errors: Record<string, string>;
}

const bedTypes = [
  'Single Bed',
  'Double Bed',
  'Queen Bed',
  'King Bed',
  'Twin Beds',
]

export default function RoomCategories({ formData, handleChange, errors }: RoomCategoriesProps) {
  const [categories, setCategories] = useState<RoomCategory[]>(Array.isArray(formData.roomCategories) ? formData.roomCategories : []);

  const addCategory = () => {
    const newCategory: RoomCategory = {
      name: '',
      bedType: bedTypes[0],
      capacity: 1,
      quantity: 1,
      rate: 0,
      description: '',
    }
    const updatedCategories = [...categories, newCategory]
    setCategories(updatedCategories)
    handleChange( updatedCategories )
  }

  useEffect(() => {
    if (Array.isArray(formData.roomCategories)) {
      setCategories(formData.roomCategories);
    }
  }, [formData.roomCategories]);

  const removeCategory = (index: number) => {
    const updatedCategories = categories.filter((_, i) => i !== index)
    setCategories(updatedCategories)
    handleChange( updatedCategories )
  }

  const updateCategory = (index: number, field: keyof RoomCategory, value: string | number) => {
    const updatedCategories = categories.map((category, i) => {
      if (i === index) {
        return { ...category, [field]: value }
      }
      return category
    })
    setCategories(updatedCategories)
    handleChange( updatedCategories )
  }
console.log('categories:',categories);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Room Categories</h2>
        <p className="text-muted-foreground">Add different room categories with their rates and details</p>
      </div>

      <div className="space-y-6">
        {categories.map((category, index) => (
          <div key={index} className="p-4 border rounded-lg space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Room Category {index + 1}</h3>
              <Button
                variant="danger"
                // size="icon"
                onClick={() => removeCategory(index)}
                className="text-destructive w-12"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor={`name-${index}`}>Category Name </label>
                <Input
                  id={`name-${index}`}
                  value={category.name}
                  onChange={(e) => updateCategory(index, 'name', e.target.value)}
                  placeholder="e.g., Deluxe Room"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor={`bedType-${index}`}>Bed Type </label>
                <select
                    id={`bedType-${index}`}
                    value={category.bedType}
                    onChange={(e) => updateCategory(index, 'bedType', e.target.value)}
                    >
                    {bedTypes.map((type) => (
                        <option key={type} value={type}>
                        {type}
                        </option>
                    ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor={`capacity-${index}`}>Guest Capacity </label>
                <Input
                  id={`capacity-${index}`}
                  type="number"
                  min="1"
                  value={category.capacity}
                  onChange={(e) => updateCategory(index, 'capacity', parseInt(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor={`quantity-${index}`}>Number of Rooms </label>
                <Input
                  id={`quantity-${index}`}
                  type="number"
                  min="1"
                  value={category.quantity}
                  onChange={(e) => updateCategory(index, 'quantity', parseInt(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor={`rate-${index}`}>Rate per Night </label>
                <Input
                  id={`rate-${index}`}
                  type="number"
                  min="0"
                  value={category.rate}
                  onChange={(e) => updateCategory(index, 'rate', parseFloat(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor={`description-${index}`}>Description </label>
                <Input
                  id={`description-${index}`}
                  value={category.description || 'Description'}
                  onChange={(e) => updateCategory(index, 'description', e.target.value)}
                  placeholder="Room features and amenities"
                />
              </div>
            </div>
          </div>
        ))}

        <Button onClick={addCategory} className="w-full" variant="primary">
          <Plus className="mr-2 h-4 w-4" />
          Add Room Category
        </Button>

        {errors.roomCategories && (
          <p className="text-sm text-destructive mt-2">{errors.roomCategories}</p>
        )}
      </div>
    </div>
  )
}


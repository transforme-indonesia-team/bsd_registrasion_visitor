"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  Upload,
  User,
  Car,
  Camera,
  Phone,
  Mail,
  Home,
  X,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock data for house list
const mockHouseList = [
  { id: "1", house_number: "A-101", detail_address: "Block A, Floor 1" },
  { id: "2", house_number: "A-102", detail_address: "Block A, Floor 1" },
  { id: "3", house_number: "B-201", detail_address: "Block B, Floor 2" },
  { id: "4", house_number: "B-202", detail_address: "Block B, Floor 2" },
  { id: "5", house_number: "C-301", detail_address: "Block C, Floor 3" },
];

interface FormData {
  full_name: string;
  gender: string;
  phone_number: string;
  email: string;
  plate_number: string;
  house_id: string;
  guest_image: string;
  plate_image: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function GuestRegistrationForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [guestImage, setGuestImage] = useState<string>("");
  const [plateImage, setPlateImage] = useState<string>("");
  const [guestImagePreview, setGuestImagePreview] = useState<string>("");
  const [plateImagePreview, setPlateImagePreview] = useState<string>("");
  const [formData, setFormData] = useState<FormData>({
    full_name: "",
    gender: "",
    phone_number: "",
    email: "",
    plate_number: "",
    house_id: "",
    guest_image: "",
    plate_image: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // Convert file to base64
  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = "Full name is required";
    } else if (formData.full_name.length < 2) {
      newErrors.full_name = "Name must be at least 2 characters";
    } else if (formData.full_name.length > 35) {
      newErrors.full_name = "Name cannot exceed 35 characters";
    }

    if (!formData.gender) {
      newErrors.gender = "Please select gender";
    }

    if (!formData.phone_number.trim()) {
      newErrors.phone_number = "Phone number is required";
    } else if (!/^[0-9]+$/.test(formData.phone_number)) {
      newErrors.phone_number = "Only numbers are allowed";
    } else if (formData.phone_number.length < 10) {
      newErrors.phone_number = "Phone number must be at least 10 digits";
    } else if (formData.phone_number.length > 15) {
      newErrors.phone_number = "Phone number cannot exceed 15 digits";
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.plate_number.trim()) {
      newErrors.plate_number = "Plate number is required";
    } else if (formData.plate_number.length > 10) {
      newErrors.plate_number = "Plate number cannot exceed 10 characters";
    }

    if (!formData.house_id) {
      newErrors.house_id = "Please select house number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Handle file upload
  const handleFileUpload = async (file: File, type: "guest" | "plate") => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      toast({
        title: "Invalid file type",
        description: "You can only upload image files!",
        variant: "destructive",
      });
      return false;
    }

    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      toast({
        title: "File too large",
        description: "Image must be smaller than 5MB!",
        variant: "destructive",
      });
      return false;
    }

    try {
      const base64 = await toBase64(file);
      const cleanBase64 = base64.replace(/^data:.+;base64,/, "");

      if (type === "guest") {
        setGuestImage(cleanBase64);
        setGuestImagePreview(base64);
      } else {
        setPlateImage(cleanBase64);
        setPlateImagePreview(base64);
      }

      return true;
    } catch {
      toast({
        title: "Upload error",
        description: "Error processing image",
        variant: "destructive",
      });
      return false;
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields correctly.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const submitData = {
        ...formData,
        guest_image: guestImage,
        plate_image: plateImage,
      };

      console.log("Form Data:", submitData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Reset form
      setFormData({
        full_name: "",
        gender: "",
        phone_number: "",
        email: "",
        plate_number: "",
        house_id: "",
        guest_image: "",
        plate_image: "",
      });
      setGuestImage("");
      setPlateImage("");
      setGuestImagePreview("");
      setPlateImagePreview("");
      setErrors({});

      toast({
        title: "Success!",
        description: "Guest registered successfully!",
      });
    } catch {
      toast({
        title: "Error",
        description: "Error registering guest. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setFormData({
      full_name: "",
      gender: "",
      phone_number: "",
      email: "",
      plate_number: "",
      house_id: "",
      guest_image: "",
      plate_image: "",
    });
    setGuestImage("");
    setPlateImage("");
    setGuestImagePreview("");
    setPlateImagePreview("");
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6">
      <div className="mx-auto max-w-4xl">
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-2 pb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Guest Registration
            </CardTitle>
            <CardDescription className="text-lg text-muted-foreground">
              Please fill out all required information below
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Information Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Personal Information
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Basic details about the guest
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="full_name" className="text-sm font-medium">
                      Full Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="full_name"
                      placeholder="Enter full name"
                      value={formData.full_name}
                      onChange={(e) =>
                        handleInputChange("full_name", e.target.value)
                      }
                      className={cn(
                        "h-11 transition-all duration-200",
                        errors.full_name &&
                          "border-red-500 focus-visible:ring-red-500"
                      )}
                    />
                    {errors.full_name && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <X className="w-3 h-3" />
                        {errors.full_name}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender" className="text-sm font-medium">
                      Gender <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value) =>
                        handleInputChange("gender", value)
                      }
                    >
                      <SelectTrigger
                        className={cn(
                          "h-11 transition-all duration-200",
                          errors.gender && "border-red-500 focus:ring-red-500"
                        )}
                      >
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="m">Male</SelectItem>
                        <SelectItem value="f">Female</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.gender && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <X className="w-3 h-3" />
                        {errors.gender}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="phone_number"
                      className="text-sm font-medium"
                    >
                      Phone Number <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="phone_number"
                        placeholder="e.g. 08123456789"
                        value={formData.phone_number}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "");
                          handleInputChange("phone_number", value);
                        }}
                        className={cn(
                          "h-11 pl-10 transition-all duration-200",
                          errors.phone_number &&
                            "border-red-500 focus-visible:ring-red-500"
                        )}
                      />
                    </div>
                    {errors.phone_number && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <X className="w-3 h-3" />
                        {errors.phone_number}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email{" "}
                      <span className="text-muted-foreground">(Optional)</span>
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="email@example.com"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        className={cn(
                          "h-11 pl-10 transition-all duration-200",
                          errors.email &&
                            "border-red-500 focus-visible:ring-red-500"
                        )}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <X className="w-3 h-3" />
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <Separator className="my-8" />

              {/* Vehicle & Location Information */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Car className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Vehicle & Location
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Vehicle and destination details
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="plate_number"
                      className="text-sm font-medium"
                    >
                      Plate Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="plate_number"
                      placeholder="e.g. B1234XYZ"
                      value={formData.plate_number}
                      onChange={(e) => {
                        const value = e.target.value
                          .replace(/[^a-zA-Z0-9]/g, "")
                          .toUpperCase();
                        handleInputChange("plate_number", value);
                      }}
                      className={cn(
                        "h-11 font-mono tracking-wider transition-all duration-200",
                        errors.plate_number &&
                          "border-red-500 focus-visible:ring-red-500"
                      )}
                    />
                    {errors.plate_number && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <X className="w-3 h-3" />
                        {errors.plate_number}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="house_id" className="text-sm font-medium">
                      House Number <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.house_id}
                      onValueChange={(value) =>
                        handleInputChange("house_id", value)
                      }
                    >
                      <SelectTrigger
                        className={cn(
                          "h-11 transition-all duration-200",
                          errors.house_id && "border-red-500 focus:ring-red-500"
                        )}
                      >
                        <SelectValue placeholder="Select house number" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockHouseList.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            <div className="flex items-center gap-2">
                              <Home className="w-4 h-4" />
                              <span>
                                {item.house_number} - {item.detail_address}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                        <SelectItem value="face">
                          <div className="flex items-center gap-2">
                            <Camera className="w-4 h-4" />
                            <span>Face Recognition</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="plate">
                          <div className="flex items-center gap-2">
                            <Car className="w-4 h-4" />
                            <span>Plate Recognition</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="club_house">
                          <div className="flex items-center gap-2">
                            <Home className="w-4 h-4" />
                            <span>Club House</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.house_id && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <X className="w-3 h-3" />
                        {errors.house_id}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <Separator className="my-8" />

              {/* Image Upload Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Camera className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Photo Upload
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Upload guest and vehicle photos
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Guest Photo Upload */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Guest Photo</Label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleFileUpload(file, "guest");
                          }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div
                        className={cn(
                          "relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 hover:border-blue-400 hover:bg-blue-50/50",
                          guestImagePreview
                            ? "border-green-300 bg-green-50/50"
                            : "border-gray-300 bg-gray-50/50"
                        )}
                      >
                        {guestImagePreview ? (
                          <div className="space-y-4">
                            <img
                              src={guestImagePreview || "/placeholder.svg"}
                              alt="Guest preview"
                              className="w-32 h-32 object-cover rounded-lg mx-auto border-2 border-white shadow-lg"
                            />
                            <div className="flex items-center justify-center gap-2">
                              <Check className="w-4 h-4 text-green-600" />
                              <span className="text-sm font-medium text-green-700">
                                Photo uploaded
                              </span>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setGuestImage("");
                                setGuestImagePreview("");
                              }}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="w-4 h-4 mr-1" />
                              Remove
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                              <Upload className="w-8 h-8 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-lg font-medium text-gray-700">
                                Upload Guest Photo
                              </p>
                              <p className="text-sm text-muted-foreground mt-1">
                                Max 5MB • JPG, PNG supported
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Plate Photo Upload */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">
                      Vehicle Plate Photo
                    </Label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleFileUpload(file, "plate");
                          }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div
                        className={cn(
                          "relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 hover:border-green-400 hover:bg-green-50/50",
                          plateImagePreview
                            ? "border-green-300 bg-green-50/50"
                            : "border-gray-300 bg-gray-50/50"
                        )}
                      >
                        {plateImagePreview ? (
                          <div className="space-y-4">
                            <img
                              src={plateImagePreview || "/placeholder.svg"}
                              alt="Plate preview"
                              className="w-32 h-32 object-cover rounded-lg mx-auto border-2 border-white shadow-lg"
                            />
                            <div className="flex items-center justify-center gap-2">
                              <Check className="w-4 h-4 text-green-600" />
                              <span className="text-sm font-medium text-green-700">
                                Photo uploaded
                              </span>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setPlateImage("");
                                setPlateImagePreview("");
                              }}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="w-4 h-4 mr-1" />
                              Remove
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                              <Upload className="w-8 h-8 text-green-600" />
                            </div>
                            <div>
                              <p className="text-lg font-medium text-gray-700">
                                Upload Plate Photo
                              </p>
                              <p className="text-sm text-muted-foreground mt-1">
                                Max 5MB • JPG, PNG supported
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-8">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  className="flex-1 h-12 text-base bg-transparent"
                  disabled={loading}
                >
                  Reset Form
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-12 text-base bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Registering...
                    </div>
                  ) : (
                    "Register Guest"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
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
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
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
  Calendar,
  Clock,
  Loader2,
  ChevronsUpDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ApiGetHouse } from "@/services/house";
import { toast } from "sonner";
import { ApiGuestRegister, ApiGuestUpdate } from "@/services/visitor";
import { useLocation, useNavigate } from "react-router";

interface FormData {
  full_name: string;
  gender: string;
  phone_number: string;
  email: null;
  plate_number: string;
  house_id: string;
  visit_date: string;
  visit_time: string;
  image: string;
  plate_image: string;
}

// interface HouseSelectType {
//   id: string;
//   block_id: string;
//   house_number: string;
//   detail_address: string | null;
// }

interface FormErrors {
  [key: string]: string;
}

interface HouseOption {
  id: string;
  label: string;
}

function GuestRegistrationForm() {
  const location = useLocation();
  const { resident } = location.state || {};
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [guestImage, setGuestImage] = useState<string>("");
  const [plateImage, setPlateImage] = useState<string>("");
  const [guestImagePreview, setGuestImagePreview] = useState<string>("");
  const [plateImagePreview, setPlateImagePreview] = useState<string>("");
  const [formData, setFormData] = useState<FormData>({
    full_name: "",
    gender: "",
    phone_number: "",
    email: null,
    plate_number: "",
    house_id: "",
    visit_date: "",
    visit_time: "",
    image: "",
    plate_image: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [houseList, setHouseList] = useState<HouseOption[]>([]);
  const [houseListLoading, setHouseListLoading] = useState<boolean>(false);
  const [open, setOpen] = useState(false);
  const selected = houseList.find((h: any) => h.id === formData.house_id);
  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  console.log("resident", resident);

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

    if (!formData.visit_date) {
      newErrors.visit_date = "Visit date is required";
    }

    if (!formData.visit_time) {
      newErrors.visit_time = "Visit time is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleFileUpload = async (file: File, type: "guest" | "plate") => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      toast.error("Invalid Image File", {
        description: "Please select an image file (e.g., JPEG, PNG, etc.)",
        duration: 3000,
      });
      return false;
    }

    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      toast.error("Image size exceeds 5MB", {
        description: "Please select an image file less than 5MB",
        duration: 3000,
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
      toast.error("Failed to upload image", {
        duration: 3000,
      });
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill in all required fields", {
        duration: 3000,
      });
      return;
    }

    if (!guestImage || !plateImage) {
      toast.error("Please upload both guest and plate images", {
        duration: 3000,
      });
      return;
    }

    const { visit_date, visit_time, ...rest } = formData;

    const submitData = {
      ...rest,
      birth_date: null,
      image: guestImage,
      plate_image: plateImage,
      expired_at: `${visit_date} ${visit_time}:00`,
    };

    console.table(submitData);

    try {
      setLoading(true);
      let data;
      if (resident?.id) {
        const res = await ApiGuestUpdate(resident.id, submitData);
        data = res.data;
      } else {
        const res = await ApiGuestRegister(submitData);
        data = res.data;
      }

      if ([200, 201].includes(data.status)) {
        toast.success(data.message, {
          duration: 3000,
        });

        toast.success(
          `${
            resident?.id
              ? "Guest updated successfully"
              : "Guest registered successfully"
          }`,
          {
            duration: 3000,
          }
        );

        setFormData({
          full_name: "",
          gender: "",
          phone_number: "",
          email: null,
          plate_number: "",
          house_id: "",
          visit_date: "",
          visit_time: "",
          image: "",
          plate_image: "",
        });
        setGuestImage("");
        setPlateImage("");
        setGuestImagePreview("");
        setPlateImagePreview("");
        setErrors({});
        //hapus data dari state uselocation

        navigate("/", { replace: true });
      }
    } catch {
      toast.error("Failed to register guest", {
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      full_name: "",
      gender: "",
      phone_number: "",
      email: null,
      plate_number: "",
      house_id: "",
      visit_date: "",
      visit_time: "",
      image: "",
      plate_image: "",
    });
    setGuestImage("");
    setPlateImage("");
    setGuestImagePreview("");
    setPlateImagePreview("");
    setErrors({});
  };

  const handleGetHouseList = async () => {
    try {
      setHouseListLoading(true);
      const res = await ApiGetHouse({ isNotPaginate: true });
      if (res?.status == 200) {
        type House = {
          id: string;
          house_number: string;
          detail_address: string | null;
        };
        type Block = {
          houses: House[];
        };
        type Cluster = {
          blocks: Block[];
        };
        type RecordType = {
          clusters: Cluster[];
        };

        const options = res.data.records.flatMap((record: RecordType) =>
          record.clusters.flatMap((cluster: Cluster) =>
            cluster.blocks.flatMap((block: Block) =>
              block.houses.map((house: House) => ({
                id: house.id,
                label: `${house.house_number} - ${house.detail_address}`,
              }))
            )
          )
        );

        setHouseList(options);
      }
      setHouseListLoading(false);
    } catch (error) {
      console.log(error);
      setHouseListLoading(false);
    }
  };

  useEffect(() => {
    handleGetHouseList();
  }, []);

  useEffect(() => {
    console.table(formData);
  }, [formData]);

  useEffect(() => {
    if (resident) {
      console.log(resident.gender, "testing123123");
      let visit_date = "";
      let visit_time = "";

      const expiredAt = resident?.resident_houses?.[0]?.expired_at;
      if (expiredAt) {
        const [date, time] = expiredAt.split(" ");
        visit_date = date;
        visit_time = time ? time.slice(0, 5) : "";
      }

      setFormData((prev) => ({
        ...prev,
        full_name: resident.full_name || "",
        email: resident.email || null,
        phone_number: resident.phone_number || "",
        gender: resident.gender || "",
        house_id: resident.resident_houses[0]?.house?.id || "",
        visit_date: visit_date,
        visit_time: visit_time,
        image: resident?.image_base64 || "",
        plate_image:
          resident.resident_houses[0]?.guest_vehicles[0]?.plate_image_base64 ||
          "",
        plate_number:
          resident.resident_houses[0]?.guest_vehicles[0]?.plate_number,
      }));
      if (resident?.image_base64) {
        setGuestImagePreview(`data:image/jpeg;base64,${resident.image_base64}`);
        setGuestImage(resident.image_base64);
      }

      const plateBase64 =
        resident.resident_houses[0]?.guest_vehicles[0]?.plate_image_base64;

      if (plateBase64) {
        setPlateImagePreview(`data:image/jpeg;base64,${plateBase64}`);
        setPlateImage(plateBase64);
      }
    }
  }, [resident]);

  useEffect(() => {
    if (resident?.house_id && houseList.length > 0) {
      const found = houseList.find((h) => h.id === resident.house_id);
      if (found) {
        setFormData((prev) => ({
          ...prev,
          house_id: resident.house_id,
        }));
      }
    }
  }, [resident, houseList]);

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
                      autoComplete="off"
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

                    {(() => {
                      console.log("Select value sekarang:", formData.gender);
                      return null;
                    })()}
                    <Select
                      value={formData.gender || resident?.gender}
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
                        autoComplete="off"
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
                        value={formData.email ?? ""}
                        autoComplete="off"
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
                      autoComplete="off"
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
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={open}
                          disabled={houseListLoading}
                          className={cn(
                            "w-full justify-between h-11 transition-all duration-200",
                            errors.house_id &&
                              "border-red-500 focus:ring-red-500"
                          )}
                        >
                          {houseListLoading ? (
                            <span className="flex items-center gap-2 text-muted-foreground">
                              <Loader2 className="h-4 w-4 animate-spin" />{" "}
                              Loading houses...
                            </span>
                          ) : selected ? (
                            <span className="font-normal">
                              {selected.label}
                            </span>
                          ) : (
                            <span className="font-normal">
                              Select house number
                            </span>
                          )}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>

                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search house..." />
                          <CommandList>
                            <CommandEmpty>No house found.</CommandEmpty>
                            <CommandGroup>
                              {houseList.map((house: any) => (
                                <CommandItem
                                  key={house.id}
                                  value={house.label}
                                  onSelect={() => {
                                    handleInputChange("house_id", house.id);
                                    setOpen(false);
                                  }}
                                  className="font-normal aria-selected:font-normal"
                                >
                                  <div className="flex items-center gap-2">
                                    <Home className="w-4 h-4 text-muted-foreground" />
                                    <span>{house.label}</span>
                                  </div>
                                  {formData.house_id === house.id && (
                                    <Check className="ml-auto h-4 w-4 text-blue-600" />
                                  )}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>

                    {errors.house_id && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <X className="w-3 h-3" /> {errors.house_id}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <Separator className="my-8" />

              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Visit Schedule
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      When is the guest expected to arrive?
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="visit_date" className="text-sm font-medium">
                      Expired Date <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="visit_date"
                        type="date"
                        value={formData.visit_date}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={(e) =>
                          handleInputChange("visit_date", e.target.value)
                        }
                        className={cn(
                          "h-11 pl-10 transition-all duration-200",
                          errors.visit_date &&
                            "border-red-500 focus-visible:ring-red-500"
                        )}
                      />
                    </div>
                    {errors.visit_date && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <X className="w-3 h-3" />
                        {errors.visit_date}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="visit_time" className="text-sm font-medium">
                      Expired Time <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="visit_time"
                        type="time"
                        value={formData.visit_time}
                        onChange={(e) =>
                          handleInputChange("visit_time", e.target.value)
                        }
                        className={cn(
                          "h-11 pl-10 transition-all duration-200",
                          errors.visit_time &&
                            "border-red-500 focus-visible:ring-red-500"
                        )}
                      />
                    </div>
                    {errors.visit_time && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <X className="w-3 h-3" />
                        {errors.visit_time}
                      </p>
                    )}
                  </div>
                </div>
                {formData.visit_date && formData.visit_time && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">
                        Expired Visit:
                      </span>
                    </div>
                    <p className="text-blue-700 mt-1">
                      {new Date(
                        `${formData.visit_date}T${formData.visit_time}`
                      ).toLocaleString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })}
                    </p>
                  </div>
                )}
              </div>
              <Separator className="my-8" />
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
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Guest Photo</Label>
                    <div className="relative">
                      {!guestImagePreview && (
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file, "guest");
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                      )}
                      <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          const file = e.dataTransfer.files?.[0];
                          if (file) handleFileUpload(file, "guest");
                        }}
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
                                Drag & Drop or Click to Upload
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
                      {!plateImagePreview && (
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file, "plate");
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                      )}
                      <div
                        onDragOver={(e) => e.preventDefault()} // aktifkan drag over
                        onDrop={(e) => {
                          e.preventDefault();
                          const file = e.dataTransfer.files?.[0];
                          if (file) handleFileUpload(file, "plate");
                        }}
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
                                Drag & Drop or Click to Upload
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

              <div className="flex flex-col sm:flex-row gap-4 pt-8">
                {!resident && (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleReset}
                      className="flex-1 h-12 text-base bg-transparent"
                      disabled={loading}
                    >
                      Reset Form
                    </Button>
                  </>
                )}
                <Button
                  type="submit"
                  className="flex-1 h-12 text-base bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {resident ? "Updating..." : "Registering..."}
                    </div>
                  ) : (
                    <>{resident ? "Update" : "Register"}</>
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

export default GuestRegistrationForm;

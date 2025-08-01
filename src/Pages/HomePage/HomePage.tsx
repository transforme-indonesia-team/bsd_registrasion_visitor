import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Phone, UserPlus, Search, ArrowLeft, CheckCircle } from "lucide-react";
import Logo from "../../assets/logo.png";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import "flag-icons/css/flag-icons.min.css";
import { ApiSearchResident } from "@/services/visitor";
import { toast } from "sonner";

export default function HomePage() {
  const [phone, setPhone] = useState("");
  const [showPhoneForm, setShowPhoneForm] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const handleNewGuest = () => {
    navigate("/guest-form");
  };

  const handleSearch = async () => {
    setIsSearching(true);
    console.log("Searching for phone:", phone);
    const payload = {
      "search": phone,
      "residenceType": "guest",
      "include[]": "image_base64",
    };

    try {
      const { data: response } = await ApiSearchResident(payload);
      if (response?.records.length === 0) {
        toast.error("Phone number not found", {
          duration: 3000,
        });
      } else {
        const residentData = response.records[0];
        navigate("/guest-form", { state: { resident: residentData } });
      }
    } catch (error: unknown) {
      type ErrorResponse = {
        response?: {
          data?: {
            message?: string;
          };
        };
      };
      const err = error as ErrorResponse;
      toast.error("Error searching for phone", {
        description: err.response?.data?.message || "Unknown error",
        duration: 3000,
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    setPhone(value);
  };

  const isPhoneValid = phone.length >= 10;

  const changeLang = (lang: "en" | "id") => {
    i18n.changeLanguage(lang);
    localStorage.setItem("lang", lang);
    setShowLangMenu(false);
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-6">
      {/* <div className="absolute top-4 right-6 z-50">
        <button
          onClick={() => setShowLangMenu(!showLangMenu)}
          className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow hover:bg-slate-100 transition"
        >
          <span
            className={`fi fi-${i18n.language === "en" ? "us" : "id"}`}
          ></span>
          <span className="text-sm font-medium text-slate-700">
            {i18n.language === "en" ? "English" : "Indonesia"}
          </span>
        </button>

        {showLangMenu && (
          <div className="absolute right-0 mt-2 w-36 bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden">
            <button
              onClick={() => changeLang("en")}
              className="flex items-center gap-2 w-full px-4 py-2 hover:bg-slate-100 text-left"
            >
              <span className="fi fi-us"></span> English
            </button>
            <button
              onClick={() => changeLang("id")}
              className="flex items-center gap-2 w-full px-4 py-2 hover:bg-slate-100 text-left"
            >
              <span className="fi fi-id"></span> Indonesia
            </button>
          </div>
        )}
      </div> */}

      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-4">
          <div className="mx-auto rounded-2xl flex items-center justify-center">
            <img
              src={Logo}
              alt="Residence One BSD Logo"
              className="w-34 h-34 drop-shadow-md"
            />
          </div>

          <div className="space-y-2">
            <Badge variant="secondary" className="text-xs font-medium">
              {t("system")}
            </Badge>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              {t("title")}
            </h1>
            <p className="text-slate-600 text-sm leading-relaxed">
              {t("subtitle")}
            </p>
          </div>
        </div>

        {!showPhoneForm ? (
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl text-slate-800">
                {t("getStarted")}
              </CardTitle>
              <CardDescription>{t("chooseOption")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={handleNewGuest}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <UserPlus className="w-5 h-5 mr-2" />
                {t("newReg")}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-slate-500">
                    {t("or")}
                  </span>
                </div>
              </div>

              <Button
                onClick={() => setShowPhoneForm(true)}
                variant="outline"
                className="w-full h-12 border-2 border-green-200 hover:border-green-300 hover:bg-green-50 text-green-700 rounded-xl transition-all duration-200"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                {t("already")}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl text-slate-800 flex items-center justify-center gap-2">
                <Phone className="w-5 h-5" />
                {t("findTitle")}
              </CardTitle>
              <CardDescription>{t("findDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label
                  htmlFor="phone"
                  className="text-sm font-medium text-slate-700"
                >
                  {t("phoneLabel")}
                </label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder={t("phonePlaceholder")}
                  autoComplete="off"
                  value={phone}
                  onChange={handlePhoneChange}
                  className="h-12 text-center text-lg tracking-wider border-2 focus:border-green-400 rounded-xl"
                  maxLength={15}
                />
                {phone && !isPhoneValid && (
                  <p className="text-xs text-amber-600 text-center">
                    {t("phoneError")}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={handleSearch}
                  disabled={!isPhoneValid || isSearching}
                  className="h-12 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                >
                  {isSearching ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      {t("search")}
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleNewGuest}
                  variant="outline"
                  className="h-12 border-2 border-blue-200 hover:border-blue-300 hover:bg-blue-50 text-blue-700 rounded-xl transition-all duration-200"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  {t("new")}
                </Button>
              </div>

              <Button
                onClick={() => {
                  setShowPhoneForm(false);
                  setPhone("");
                }}
                variant="ghost"
                className="w-full text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t("back")}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

import axios from "axios";

const webService = import.meta.env.VITE_API_BASE_URL;
const secretKey = import.meta.env.VITE_SECRET_KEY;

export function ApiSearchResident<T>(params: T) {
  const url = webService + "public/master/resident";
  const res = axios({
    method: "GET",
    params: params,
    url: url,
    headers: {
      "Content-Type": "application/json",
      "x-api-key": secretKey,
    },
  });
  return res;
}

export function ApiGuestRegister<T>(payload: T) {
  const url = webService + "public/master/guest-register";
  const res = axios({
    method: "POST",
    data: payload,
    url: url,
    headers: {
      "Content-Type": "application/json",
      "x-api-key": secretKey,
    },
  });
  return res;
}

export function ApiGuestUpdate<T>(id: string, payload: T) {
  const url = webService + `public/master/update-guest/${id}`;
  const res = axios({
    method: "PUT",
    data: payload,
    url: url,
    headers: {
      "Content-Type": "application/json",
      "x-api-key": secretKey,
    },
  });
  return res;
}

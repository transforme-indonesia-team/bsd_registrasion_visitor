import axios from "axios";

const webService = import.meta.env.VITE_API_BASE_URL;
const secretKey = import.meta.env.VITE_SECRET_KEY;

export function ApiGetHouse<T>(params: T) {
  const url = webService + "public/master/housing";
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

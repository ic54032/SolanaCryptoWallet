let API_URL: string;

if (process.env.NODE_ENV === "development") {
  API_URL = "http://localhost:8000/";
} else {
  API_URL = "https://mywebsite.com/";
}

export default API_URL;

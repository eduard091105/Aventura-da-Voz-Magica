/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        skyKid: "#5cc8ff",
        sunKid: "#ffd166",
        grassKid: "#80ed99",
        coralKid: "#ff7f7f"
      }
    }
  },
  plugins: []
};

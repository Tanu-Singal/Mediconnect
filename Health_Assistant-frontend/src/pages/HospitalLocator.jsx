import {React,useState} from 'react'
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const HospitalLocator = () => {
  const [location, setLocation] = useState(null);
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
 const [selectedPlace, setSelectedPlace] = useState(null); 
  const fetchLocationAndPlaces=()=>{
     if (!navigator.geolocation) {
      toast.error("❌ Geolocation is not supported by your browser.");
      return;
     }

     setLoading(true)
     navigator.geolocation.getCurrentPosition(
        async(position)=>{
             const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        console.log("Sending coordinates:", lat, lng);
        setLocation({ lat, lng });

       try{
           const res=await fetch("http://localhost:8000/nearby-places",{
             method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ lat, lng, tag: "hospital" }),
           })
           const data = await res.json();
          setPlaces(data.places || []);
       }
       catch(err){
        toast.error("⚠️ Failed to fetch nearby hospitals.");

       }
 setLoading(false);
        },
         (error) => {
        toast.error("❌ Location access denied or unavailable.");
        setLoading(false);
      }
     )
  }
const extractCoords = (text) => {
    const match = text.match(/query=([-0-9.]+),([-0-9.]+)/);
    if (match) return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };

    return null;
  };

  return (
 
     <div className="flex flex-col md:flex-row h-screen">
      {/* Left: Hospital list */}
      <div className="md:w-1/2 p-4 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-4 text-center">🏥 Hospital Finder</h1>
      <button
      onClick={fetchLocationAndPlaces}
      disabled={loading}
      className={`${
        loading
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-green-600 hover:bg-green-700 active:scale-95"
      } text-white px-6 py-2 rounded mb-4 w-full transition duration-200`}
    >
      {loading ? "🔄 Fetching nearby hospitals..." : "📍 Find Nearby Hospitals"}
    </button>
 <div className="bg-red-100 p-4 rounded text-center">
      <p className="text-lg font-semibold text-red-700 mb-2">⚠️ This might be serious.</p>
      <p className="mb-4">Please call emergency services if you're in danger.</p>
      <a href="tel:112">
        <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded">
          📞 Call Nearest Emergency
        </button>
      </a>
    </div>
{location && (
  <div className="text-sm text-gray-600 text-center mb-4">
    📍 Your Location: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
  </div>
)}
        {places.length > 0 && (
          <div className="bg-white rounded shadow p-4">
            <h2 className="text-xl font-semibold mb-2">Nearby Hospitals:</h2>
            <ul className="list-disc list-inside space-y-2">
              {places.map((place, idx) => {
                const parts = place.split("\n");
                const name = parts[0];
                const link = parts[1]?.replace("📍 ", "").trim();
                const coords = extractCoords(place);

                return (
                  <li key={idx} className="text-gray-700">
                    <div>{name}</div>
                  {coords && (
  <div className="flex space-x-3 mt-1">
    <button
      onClick={() =>
       {console.log("Zooming to:", coords);
        setSelectedPlace(coords)}}
      
      className="text-blue-600 underline text-sm hover:text-blue-800 active:text-blue-900 transition duration-150"
    >
      View on Map
    </button>
    <a
      href={`https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`}
      target="_blank"
      rel="noopener noreferrer"
      className="text-green-600 underline text-sm ml-2 hover:text-green-800 active:text-green-900 transition duration-150"

    >
      Get Directions
    </a>
  </div>
)}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {!loading && places.length === 0 && location && (
          <p className="text-center text-red-500 mt-4">No nearby hospitals found.</p>
        )}
      </div>

      {/* Right: Map Preview */}
      <div className="md:w-1/2 p-4">
        <h2 className="text-xl font-semibold mb-2 text-center">🗺️ Map Preview</h2>
        {selectedPlace ? (
          <iframe
            title="Hospital Directions"
            src={`https://www.google.com/maps?q=${selectedPlace.lat},${selectedPlace.lng}&z=18&output=embed`}
            


            width="100%"
            height="100%"
            className="rounded border shadow"
            allowFullScreen
          ></iframe>
        ) : (
          <p className="text-center text-gray-600 mt-8">Click on a hospital to view it on the map.</p>
        )}
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
   
  )
}

export default HospitalLocator

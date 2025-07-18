const getLocation = (): Promise<{ coordinates: [number, number] | null; error?: string }> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.error("Geolocation is not supported by this browser.");
      resolve({ coordinates: null, error: "Geolocation is not supported by this browser." });
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        console.log("FacilityMap: ", lat, lon);
        resolve({ coordinates: [lat, lon] });
      },
      (error) => {
        console.error("Geolocation error:", error);
        if (error.code === 1) {
          resolve({ coordinates: null, error: "Location access denied. Enable location services in browser settings." });
        } else if (error.code === 2) {
          resolve({ coordinates: null, error: "Location unavailable. Try again later." });
        } else if (error.code === 3) {
          resolve({ coordinates: null, error: "Location request timed out. Retry." });
        } else {
          resolve({ coordinates: null, error: "Unknown error occurred while fetching location." });
        }
      },
      options
    );
  });
};

export default getLocation;

import { useState } from "react";
import { SearchBox } from "@mapbox/search-js-react";
import type { Stop } from "@/types";

interface StopSearchInputProps {
  onSelect: (stop: Omit<Stop, "id">) => void;
  placeholder?: string;
  proximity?: [number, number];
}

export default function StopSearchInput({ onSelect, placeholder = "Search stop, building, landmark…", proximity }: StopSearchInputProps) {
  const [value, setValue] = useState("");

  const handleRetrieve = (res: any) => {
    // Search Box gives the selected feature in features[0]
    const feature = res.features?.[0] || res;
    if (!feature || !feature.geometry) return;

    onSelect({
      name: feature.properties?.name || feature.properties?.place_name || feature.properties?.full_address || feature.properties?.text || "Selected place",
      coordinates: {
        lng: feature.geometry.coordinates[0],
        lat: feature.geometry.coordinates[1],
      },
    });

    // Reset the internal input value so the next keystroke clears out the completed selection
    setTimeout(() => {
      setValue("");
      
      // Optionally blur if we want to dismiss the mobile keyboard upon selection
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    }, 100);
  };

  return (
    <div className="stop-search-input w-full relative">
      <SearchBox
        accessToken={import.meta.env.VITE_MAPBOX_TOKEN}
        options={{
          country: "PH",
          proximity: proximity ? [proximity[0], proximity[1]] : [123.8854, 10.3157],
          limit: 8,
        }}
        value={value}
        onChange={(val) => setValue(val)}
        onRetrieve={handleRetrieve}
        placeholder={placeholder}
        // Tailwind/styling support: You might need to adjust mapbox-search-box CSS vars here
        theme={{
          variables: {
            fontFamily: "inherit",
          }
        }}
      />
    </div>
  );
}

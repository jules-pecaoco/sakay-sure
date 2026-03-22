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
    <div className="stop-search-input w-full relative z-50">
      <SearchBox
        accessToken={import.meta.env.VITE_MAPBOX_TOKEN}
        options={{
          country: "PH",
          proximity: proximity ? [proximity[0], proximity[1]] : [120.9842, 14.5995], // Default to Manila
          limit: 8,
        }}
        value={value}
        onChange={(val) => setValue(val)}
        onRetrieve={handleRetrieve}
        interceptSearch={(query) => {
          if (query.length < 3) return "";
          return query;
        }}
        placeholder={placeholder}
        theme={{
          variables: {
            fontFamily: "inherit",
          }
        }}
      />
    </div>
  );
}

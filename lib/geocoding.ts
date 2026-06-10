export async function getCoordinates(
  address?: string,
  district?: string,
  state?: string
): Promise<{ latitude: number; longitude: number } | null> {
  try {
    const queryParts = [address, district, state, "India"].filter(Boolean);
    const query = queryParts.join(", ");

    if (!query) return null;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.append("q", query);
    url.searchParams.append("format", "jsonv2");
    url.searchParams.append("limit", "1");

    const response = await fetch(url.toString(), {
      headers: {
        "User-Agent": "AnnDoctorMattresses/1.0 (admin@anndoctor.com)",
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      console.error("Nominatim API error:", response.statusText);
      return null;
    }

    const data = await response.json();

    if (Array.isArray(data) && data.length > 0) {
      return {
        latitude: Number(data[0].lat),
        longitude: Number(data[0].lon),
      };
    }

    return null;
  } catch (error) {
    console.error("Failed to geocode location:", error);
    return null;
  }
}

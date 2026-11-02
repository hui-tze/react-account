export function useHourFormat()
{
    const hourFormat = localStorage.getItem("hour_format"); // "12" or "24"

    const is12Hour = hourFormat === "12";
    const is24Hour = hourFormat === "24";

    return {
        hourFormat,
        is12Hour,
        is24Hour
    };
}

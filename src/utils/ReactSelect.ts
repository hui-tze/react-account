// reactSelectCustomStyles.ts
import {StylesConfig} from "react-select";
import {colors} from "@/configs/constants/ThemeColors";

// Define the custom styles for React Select with the color #007D88
export const reactSelectCustomStyles: StylesConfig = {
    container: (provided) => ({
        ...provided,
        flexGrow: 1
    }),
    control: (provided, state) => ({
        ...provided,
        borderColor: state.isFocused ? colors.primary : '#ccc', // Border color when focused
        boxShadow: state.isFocused ? `0 0 0 0.2rem rgba(${colors.primaryRgb}, 0.25)` : 'none', // Box shadow when focused
    }),
    option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isSelected ? colors.primary : state.isFocused ? `rgba(${colors.primaryRgb}, 0.1)` : '#fff', // Option selected or hovered color
        color: state.isSelected ? '#fff' : '#000', // Text color for selected option
        padding: 10,
    }),
    singleValue: (provided) => ({
        ...provided,
    }),
    menu: (provided) => ({
        ...provided,
        backgroundColor: '#f9f9f9', // Background color of the menu
        borderRadius: 4,
    }),
    group: (provided: any) => ({
        ...provided,
        fontWeight: 'bold',
        backgroundColor: '#f7f7f7'
    }),
    menuPortal: (base) => ({ ...base, zIndex: 9999 })
};
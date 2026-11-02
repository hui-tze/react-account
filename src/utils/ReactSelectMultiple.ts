// reactSelectCustomStyles.ts
import {CSSObjectWithLabel, GroupBase, StylesConfig} from "react-select";
import {colors} from "@/configs/constants/ThemeColors";
import {SelectOptionProps} from "@/apis/models/common";
import {AdjustmentStaffSelectOption} from "@/apis/models/leave-config";
import {AnnouncementTypeOption} from "@/apis/requests/announcement-type-api";

export const createReactSelectMultipleCustomStyles = <
  T extends { label: string; value: string | number } = SelectOptionProps
>(): StylesConfig<T, true, GroupBase<T>> => ({
    clearIndicator: (base: CSSObjectWithLabel, props) => {
        return {
            ...base,
        };
    },
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
});

export const reactSelectMultipleCustomStyles = createReactSelectMultipleCustomStyles();
export const staffSelectMultipleCustomStyles = createReactSelectMultipleCustomStyles<AdjustmentStaffSelectOption>();
export const announcementTypeSelectMultipleCustomStyles = createReactSelectMultipleCustomStyles<AnnouncementTypeOption>();

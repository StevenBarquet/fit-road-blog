import { type GroupBase, type StylesConfig } from 'react-select';
import { appColors } from 'src/app/_providers/AntdProv/AntdProv';

export const customStyles = <
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>
>({
  removeClear,
}: {
  removeClear?: boolean;
}): StylesConfig<Option, IsMulti, Group> => {
  const antBackground = '#fff';
  const themeTextColor = '#1e1e1e';
  const themeTextColorSoft = '#3e3e3e'
  return {
    control: (provided) => {
      return {
        ...provided,
        minHeight: '32.5px',
        borderRadius: '6px',
        borderColor: '#e0e0e0',
        boxShadow: 'none',
        backgroundColor: antBackground,
        ':hover': {
          borderColor: appColors.primaryColor,
        },
      };
    },
    indicatorSeparator: (provided) => ({
      ...provided,
      display: 'none',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? appColors.primaryColor6 : 'inherit',
      cursor: 'pointer',
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: themeTextColor,
      cursor: 'pointer',
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#4c576a',
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: themeTextColor,
      backgroundColor: antBackground,
      border: '1px solid ' + appColors.primaryColor,
      borderRight: 'none',
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: appColors.colorLight,
      backgroundColor: appColors.primaryColor,
      cursor: 'pointer',
    }),
    clearIndicator: (provided) => ({
      ...provided,
      cursor: 'pointer',
      color: themeTextColorSoft,
      display: removeClear ? 'none' : 'flex',
      ':hover': {
        color: appColors.colorError,
      },
    }),
    menu: (provided) => ({
      ...provided,
      color: themeTextColor,
      backgroundColor: appColors.primaryColor2,
    }),
    
  };
};

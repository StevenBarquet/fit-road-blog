// ---Dependencies
import { type ReactElement } from 'react';
// ---UI Dependencies
import MultiSelect, { type GroupBase, type Props } from 'react-select';
// ---Styles
import { customStyles } from './customStyles';

/**
 * AntMultiSelect Component:  Descripción del comportamiento...
 * @param {Props} props - Parámetros del componente como: ...
 * @returns {ReactElement}
 */
export function AntMultiSelect<
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>
>(
  props: Props<Option, IsMulti, Group> & {
    removeClear?: boolean;
  }
): ReactElement {
  // -----------------------CONSTS, HOOKS, STATES
  // -----------------------MAIN METHODS
  const selectProps: Props<Option, IsMulti, Group> = {
    ...props,
    styles: customStyles({ removeClear: props.removeClear })
  };
  // -----------------------AUX METHODS
  // -----------------------RENDER
  return <MultiSelect {...selectProps} />;
}

export function mapStringsToOptions(strings: string[]) {
  return strings.map((e) => ({ label: e, value: e }));
}

export type ReactSelectOption<K> = {
  label: string;
  value: K;
};

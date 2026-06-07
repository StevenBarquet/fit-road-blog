// ---Dependencies
import { type ReactElement } from 'react';
// ---UI Dependencies
import { Checkbox } from 'antd';
import { type CheckboxChangeEvent } from 'antd/es/checkbox';
import { Fcol, Frow, type GridSystem, type FrowProps } from 'react-forge-grid';
// ---Custom Hooks
import { type FormikProps } from 'formik';

interface Props<T> {
  label?: string;
  formik: FormikProps<T>;
  valueName: keyof T;
  labelGrid?: GridSystem;
  inputGrid?: GridSystem;
  disabled?: boolean;
  containerProps?: Omit<FrowProps, 'children'>;
}

/**
 * FBasicCheckbox Component: Permite crear un "Checkbox" dentro de un formulario de formik de una manera sencilla.
 * @param {Props} props - Parámetros del componente
 * @returns {ReactElement}
 */
export function FBasicCheckbox<T>(props: Props<T>): ReactElement {
  // -----------------------CONSTS, HOOKS, STATES
  const {
    disabled,
    label,
    formik,
    valueName,
    labelGrid,
    inputGrid,
    containerProps,
  } = props;

  const safeValueName = String(valueName);
  const errMessage = formik.errors[valueName];
  const isError = !!errMessage && !!formik.touched[valueName];

  const newRowProps: FrowProps = {
    vAlign: 'top',
    hAlign: 'start',
    ...containerProps,
  };
  const newLabelGrid: GridSystem = {
    span: 70,
    ...labelGrid,
  };
  const newInputGrid: GridSystem = {
    span: label?.length ? 6 : 100,
    ...inputGrid,
  };
  const currentStyle = { textAlign: 'end', padding: '5px 0px' };

  // -----------------------MAIN METHODS
  const onChange = async (e: CheckboxChangeEvent) => {
    await formik.setFieldValue(safeValueName, e.target.checked);
  };

  // -----------------------RENDER
  return (
    <Frow {...newRowProps} style={{ marginTop: '10px' }}>
      
      {label?.length ? (
        <Fcol {...newLabelGrid} style={currentStyle}>
          <span>{label}:</span>
        </Fcol>
      ) : null}

      <Fcol {...newInputGrid}>
        <Checkbox
          disabled={disabled}
          checked={Boolean(formik.values[valueName])}
          onChange={onChange}
        />
      </Fcol>

      <Fcol>
        {isError ? (
          <div style={{ paddingLeft: 15 }} className="customHelper">
            {String(errMessage)}
          </div>
        ) : null}
      </Fcol>
    </Frow>
  );
}

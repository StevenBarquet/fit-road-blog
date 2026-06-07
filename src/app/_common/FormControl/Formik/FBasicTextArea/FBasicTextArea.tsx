// ---Dependencies
import { type ReactElement } from 'react';
// ---UI Dependencies
import { Input } from 'antd';
import { Fcol, Frow, type GridSystem, type FrowProps } from 'react-forge-grid';
// ---Custom Hooks
import { type FormikProps } from 'formik';
import { useAppInfoStore } from 'src/app/_store/appInfo';

const { TextArea } = Input;

interface Props<T> {
  label?: string;
  placeholder?: string;
  formik: FormikProps<T>;
  valueName: keyof T;
  labelGrid?: GridSystem;
  inputGrid?: GridSystem;
  required?: boolean;
  disabled?: boolean;
  containerProps?: Omit<FrowProps, 'children'>;
}

/**
 * FBasicTextArea Component: Permite crear un "TextArea" dentro de un formulario de formik de una manera sencilla.
 * @param {Props} props - Parámetros del componente
 * @returns {ReactElement}
 */
export function FBasicTextArea<T>(props: Props<T>): ReactElement {
  // -----------------------CONSTS, HOOKS, STATES
  const {
    disabled,
    formik,
    valueName,
    label,
    placeholder,
    labelGrid,
    inputGrid,
    required,
    containerProps,
  } = props;
  const { isMobile } = useAppInfoStore();

  const errMessage = formik.errors[valueName];
  const isError = !!errMessage && !!formik.touched[valueName];

  const newRowProps: FrowProps = {
    vAlign: 'top',
    hAlign: 'start',
    ...containerProps,
  };
  const newLabelGrid: GridSystem = {
    span: 25,
    ...labelGrid,
  };
  const newInputGrid: GridSystem = {
    span: label ? 70 : 100,
    ...inputGrid,
  };
  const newLabel = required && label ? `*${label}` : label;

  const currentStyle =
    newLabelGrid.span === 100 ||
    (isMobile && (newLabelGrid.xs === 100 || newLabelGrid.sm === 100))
      ? { textAlign: 'start', padding: '5px 0px' }
      : { textAlign: 'end', padding: '5px 10px' };

  // -----------------------RENDER
  return (
    <Frow {...newRowProps} style={{ marginTop: '10px' }}>
      {label?.length ? (
        <Fcol {...newLabelGrid} style={currentStyle}>
          <span>{newLabel}:</span>
        </Fcol>
      ) : null}
      <Fcol {...newInputGrid}>
        <TextArea
          disabled={disabled}
          value={String(formik.values[valueName] || '')}
          onChange={formik.handleChange(valueName)}
          status={isError ? 'error' : undefined}
          placeholder={placeholder}
        />
        {isError ? (
          <div className="ant-form-item-explain-error customHelper">
            {String(errMessage)}
          </div>
        ) : null}
      </Fcol>
    </Frow>
  );
}

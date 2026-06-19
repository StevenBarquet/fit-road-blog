'use client';

// ---Dependencies
import { type ReactElement, type ReactNode } from 'react';
import { Radio } from 'antd';
import { type FormikProps } from 'formik';
// ---Config
import style from './FRadioGroup.module.scss';

export interface RadioOption {
  label: string;
  value: string;
  icon?: ReactNode;
  extra?: ReactNode;
}

interface Props<T> {
  label?: string;
  formik: FormikProps<T>;
  valueName: keyof T;
  options: RadioOption[];
}

export function FRadioGroup<T>(props: Props<T>): ReactElement {
  // -----------------------CONSTS, HOOKS, STATES
  const { label, formik, valueName, options } = props;

  const currentValue = formik.values[valueName] as string;
  const errMessage = formik.errors[valueName];
  const isError = !!errMessage && !!formik.touched[valueName];

  // -----------------------MAIN METHODS
  function handleChange(value: string) {
    formik.setFieldValue(String(valueName), value, true);
    formik.setFieldTouched(String(valueName), true);
  }

  // -----------------------RENDER
  return (
    <div className={style.FRadioGroup}>
      {label && <label className="group-label">{label}</label>}

      <div className="radio-list">
        {options.map((opt) => (
          <div
            key={opt.value}
            className={`radio-card ${currentValue === opt.value ? 'selected' : ''}`}
            onClick={() => handleChange(opt.value)}
          >
            <Radio value={opt.value} checked={currentValue === opt.value}>
              <span className="radio-label">
                {opt.icon && <span className="radio-icon">{opt.icon}</span>}
                {opt.label}
              </span>
            </Radio>
            {opt.extra && currentValue === opt.value && (
              <div className="radio-extra">{opt.extra}</div>
            )}
          </div>
        ))}
      </div>

      {isError && <div className="customHelper">{String(errMessage)}</div>}
    </div>
  );
}

'use client';

// ---Dependencies
import { type ReactElement } from 'react';
import { Button } from 'antd';
import { type FormikProps } from 'formik';
// ---Config
import style from './FToggleGrid.module.scss';

interface Props<T> {
  label?: string;
  formik: FormikProps<T>;
  valueName: keyof T;
  options: string[];
  columns?: number;
  compact?: boolean;
}

export function FToggleGrid<T>(props: Props<T>): ReactElement {
  // -----------------------CONSTS, HOOKS, STATES
  const { label, formik, valueName, options, columns = 3, compact } = props;

  const selected = formik.values[valueName] as string[];
  const errMessage = formik.errors[valueName];
  const isError = !!errMessage && !!formik.touched[valueName];
  const allSelected = selected.length === options.length;

  // -----------------------MAIN METHODS
  function handleToggle(option: string) {
    const next = selected.includes(option)
      ? selected.filter((s) => s !== option)
      : [...selected, option];
    formik.setFieldValue(String(valueName), next, true);
    formik.setFieldTouched(String(valueName), true);
  }

  function handleToggleAll() {
    const next = allSelected ? [] : [...options];
    formik.setFieldValue(String(valueName), next, true);
    formik.setFieldTouched(String(valueName), true);
  }

  // -----------------------RENDER
  return (
    <div className={`${style.FToggleGrid} ${compact ? style.compact : ''}`}>
      {label && (
        <div className="header">
          <label>{label}</label>
          <Button type="link" size="small" onClick={handleToggleAll}>
            {allSelected ? 'Limpiar' : 'Todos'}
          </Button>
        </div>
      )}

      {!label && (
        <div className="header-minimal">
          <Button type="link" size="small" onClick={handleToggleAll}>
            {allSelected ? 'Limpiar' : 'Todos'}
          </Button>
        </div>
      )}

      <div className="grid" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {options.map((option) => (
          <button
            key={option}
            type="button"
            className={`tag ${selected.includes(option) ? 'active' : ''}`}
            onClick={() => handleToggle(option)}
          >
            {option}
          </button>
        ))}
      </div>

      {isError && <div className="customHelper">{String(errMessage)}</div>}
    </div>
  );
}

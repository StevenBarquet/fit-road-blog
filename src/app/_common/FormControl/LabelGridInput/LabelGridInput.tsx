import { type ReactNode } from 'react';
import { Fcol, Frow, type GridSystem } from 'react-forge-grid';
import { useAppInfoStore } from 'src/app/_store/appInfo';
import { basicResponsive } from 'src/app/_utils/functions/responsiveUtils';

interface Props {
  colProps?: GridSystem;
  label: string;
  children: ReactNode;
  labelGrid?: GridSystem;
  inputGrid?: GridSystem;
}

/**
 * LabelGridInput Component:  Descripción del comportamiento...
 * @param {Props} props - Parámetros del componente como: ...
 */
export function LabelGridInput(props: Props) {
  // -----------------------CONSTS, HOOKS, STATES


  // -----------------------MAIN METHODS
  // -----------------------AUX METHODS
  // -----------------------RENDER
  if (props.colProps)
    return (
      <Fcol {...props.colProps}>
        <Nested {...props} />
      </Fcol>
    );
  return <Nested {...props} />;
}

function Nested(props: Props) {
  const { label, children } = props
  const { isMobile } = useAppInfoStore();

  const newLabelGrid: GridSystem = {
    ...basicResponsive(25),
    ...props.labelGrid,
  };
  const newInputGrid: GridSystem = {
    ...basicResponsive(70),
    ...props.inputGrid,
  };
  const currentStyle =
    (isMobile && (newLabelGrid.xs === 100 || newLabelGrid.sm === 100))
      ? { textAlign: 'start', padding: '5px 0px' }
      : { textAlign: 'end', padding: '5px 10px' };
  return (
    <Frow vAlign="middle" hAlign="start" style={{ marginTop: '10px' }}>
      <Fcol {...newLabelGrid} style={currentStyle}>
        <span>{label}:</span>
      </Fcol>
      <Fcol {...newInputGrid}>{children}</Fcol>
    </Frow>
  );
}

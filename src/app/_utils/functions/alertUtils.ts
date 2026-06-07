import { appColors } from "src/app/_providers/AntdProv/AntdProv";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

export const appSwal = withReactContent(
  Swal.mixin({
    confirmButtonColor: appColors.primaryColor
  })
)

export async function swalApiSuccessAuto(message?: string) {
  await appSwal.fire({
    title: 'Exito',
    text: message || 'Operación realizada con éxito',
    icon: 'success',
    timerProgressBar: true,
    timer: 5500,
  });
}



export async function swalApiError(message?: string) {
  await appSwal.fire({
    title: 'OPERACIÓN FALLIDA',
    text: message || 'Lo sentimos, hubo un problema al procesar tu solicitud. Por favor, asegúrate de que tu conexión a internet está estable y vuelve a intentarlo.',
    icon: 'warning',
  });
}
export async function swalApiConfirm({ callback, confirmMsg, fireSuccess = true, successMsg }:
  {
    callback: (() => void) | (() => Promise<void>);
    fireSuccess?: boolean;
    confirmMsg?: string;
    successMsg?: string;
  }
) {
  await appSwal.fire({
    title: '¿Estás seguro?',
    text: confirmMsg || 'El proceso no puede revertirse o podría cambiar seriamente una funcionalidad.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Si, continuar',
  }).then(async (result) => {
    if (result.isConfirmed) {
      await callback();
      if (fireSuccess) {
        await swalApiSuccessAuto(successMsg)
      }
    }
  });
}
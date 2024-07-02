import React, {useEffect} from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Toast = ({ message, type }) => {
  const toastOptions = {
    position: 'top-center',
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: 'colored', // light, dark, colored
  };

  useEffect(() => {
    showToast(type, message);
  }, []);

  const showToast = (type, message) => {
    if (type === 'success') {
      toast.success(message, toastOptions);
    } else if (type === 'error') {
      toast.error(message, toastOptions);
    } else if (type === 'info') {
        toast.info(message, toastOptions);
    } else if (type === 'warning') {
        toast.warning(message, toastOptions);
    } else {
        toast(message, toastOptions);
    }
  };

  return (
    <div>
      <ToastContainer
        position={toastOptions.position}
        autoClose={toastOptions.autoClose}
        hideProgressBar={toastOptions.hideProgressBar}
        newestOnTop={toastOptions.hideProgressBar}
        closeOnClick={toastOptions.closeOnClick}
        rtl={false}
        pauseOnFocusLoss
        draggable={toastOptions.draggable}
        pauseOnHover={toastOptions.pauseOnHover}
        theme={toastOptions.theme}
      />
    </div>
  );
};

export default Toast;

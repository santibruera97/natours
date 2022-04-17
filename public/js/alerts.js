export const showAlert = (type, message) => {
  hideAlert();

  let markup = document.createElement('div');
  markup.className = `alert alert--${type}`;
  markup.innerHTML = message;

  document.querySelector('body').insertAdjacentElement('afterbegin', markup);

  window.setTimeout(hideAlert, 5000);
};

export const hideAlert = () => {
  const el = document.querySelector('.alert'); //
  if (el) el.parentElement.removeChild(el);
};

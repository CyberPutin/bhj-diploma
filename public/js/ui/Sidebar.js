/**
 * Класс Sidebar отвечает за работу боковой колонки:
 * кнопки скрытия/показа колонки в мобильной версии сайта
 * и за кнопки меню
 * */
class Sidebar {
  /**
   * Запускает initAuthLinks и initToggleButton
   * */
  static init() {
    this.initAuthLinks();
    this.initToggleButton();
  }

  /**
   * Отвечает за скрытие/показа боковой колонки:
   * переключает два класса для body: sidebar-open и sidebar-collapse
   * при нажатии на кнопку .sidebar-toggle
   * */
  static initToggleButton() {
    const sidebarBtnEl = document.querySelector('.sidebar-toggle');
    sidebarBtnEl.addEventListener('click', () => {
      document.body.classList.toggle('sidebar-open');
      document.body.classList.toggle('sidebar-collapse');
    });
  }

  /**
   * При нажатии на кнопку входа, показывает окно входа
   * (через найденное в App.getModal)
   * При нажатии на кнопку регастрации показывает окно регистрации
   * При нажатии на кнопку выхода вызывает User.logout и по успешному
   * выходу устанавливает App.setState( 'init' )
   * */
  static initAuthLinks() {
    const loginBtnEl = document.querySelector('.menu-item_login a');
    const registerBtnEl = document.querySelector('.menu-item_register a');
    const logoutBtnEl = document.querySelector('.menu-item_logout a');

    loginBtnEl.addEventListener('click', (e) => {
      e.preventDefault();
      App.getModal('login').open();
    });

    registerBtnEl.addEventListener('click', (e) => {
      e.preventDefault();
      App.getModal('register').open();
    });

    logoutBtnEl.addEventListener('click', (e) => {
      e.preventDefault();
      User.logout((err, resp) => {
        if (resp && resp.success) {
          App.setState('init');
          return;
        }
        console.err(err);
      });
    });
  }
}
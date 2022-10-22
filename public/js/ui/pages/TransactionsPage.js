/**
 * Класс TransactionsPage управляет
 * страницей отображения доходов и
 * расходов конкретного счёта
 * */
class TransactionsPage {
  /**
   * Если переданный элемент не существует,
   * необходимо выкинуть ошибку.
   * Сохраняет переданный элемент и регистрирует события
   * через registerEvents()
   * */
  constructor( element ) {
    if (!element) {
      throw new Error('Элемент не существует');
    }
    this.element = element;
    this.lastOptions = null;
    this.registerEvents();
  }

  /**
   * Вызывает метод render для отрисовки страницы
   * */
  update() {
    if (this.lastOptions) {
      this.render(this.lastOptions);
    }
  }

  /**
   * Отслеживает нажатие на кнопку удаления транзакции
   * и удаления самого счёта. Внутри обработчика пользуйтесь
   * методами TransactionsPage.removeTransaction и
   * TransactionsPage.removeAccount соответственно
   * */
  registerEvents() {
    this.removeTransactionBtns = this.element.getElementsByClassName('transaction__remove');
    this.removeAccountBtn = this.element.querySelector('.remove-account');
    this.removeAccountBtn.onclick = this.removeAccount.bind(this);
    [...this.removeTransactionBtns].forEach((btn) => {
      const dataId = btn.dataset.id;
      btn.addEventListener('click', () => {
        this.removeTransaction(dataId);
      });
    });
  }

  /**
   * Удаляет счёт. Необходимо показать диаголовое окно (с помощью confirm())
   * Если пользователь согласен удалить счёт, вызовите
   * Account.remove, а также TransactionsPage.clear с
   * пустыми данными для того, чтобы очистить страницу.
   * По успешному удалению необходимо вызвать метод App.updateWidgets() и App.updateForms(),
   * либо обновляйте только виджет со счетами и формы создания дохода и расхода
   * для обновления приложения
   * */
  removeAccount() {
    if (
      confirm(`Вы уверены, что хотите удалить счёт: ${this.lastOptions.account_id}?`)
    ) {
      Account.remove({
        id: this.lastOptions.account_id
      }, (err, response) => {
        if (response.success) {
          this.clear();
          App.updateWidgets();
        } else {
          console.error(err);
        }
      });
    }
  }

  /**
   * Удаляет транзакцию (доход или расход). Требует
   * подтверждеия действия (с помощью confirm()).
   * По удалению транзакции вызовите метод App.update(),
   * либо обновляйте текущую страницу (метод update) и виджет со счетами
   * */
  removeTransaction( id ) {
    Transaction.remove({
      account_id: this.lastOptions.account_id,
      id,
    },
    (err, response) => {
      if (response && response.success) {
        App.update();
      } else {
        console.error(err);
      }
    },
  );
  }

  /**
   * С помощью Account.get() получает название счёта и отображает
   * его через TransactionsPage.renderTitle.
   * Получает список Transaction.list и полученные данные передаёт
   * в TransactionsPage.renderTransactions()
   * */
  render(options) {
    this.lastOptions = {
      ...options
    };
    if (!options) {
      return;
    }
    Account.get(options.account_id, (err, response) => {
      if (response.success) {
        this.renderTitle(response.data.name);
        Transaction.list(options, (err, response) => {
          if (response.success) {
            this.renderTransactions(response.data);
            this.registerEvents();
          } else {
            console.error(err);
          }
        });
      } else {
        console.error(err);
      }
    });
  }

  /**
   * Очищает страницу. Вызывает
   * TransactionsPage.renderTransactions() с пустым массивом.
   * Устанавливает заголовок: «Название счёта»
   * */
  clear() {
    this.renderTransactions([]);
    this.renderTitle('Название счёта');
    this.lastOptions = null;
  }

  /**
   * Устанавливает заголовок в элемент .content-title
   * */
  renderTitle(name){
    const title = this.element.querySelector('.content-title');
    title.textContent = name;
  }

  /**
   * Форматирует дату в формате 2019-03-10 03:20:41 (строка)
   * в формат «10 марта 2019 г. в 03:20»
   * */
  formatDate(date) {
    const [day, time] = new Date(date)
    .toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    })
    .split(', ');

  return `${day} , ${time}`;
  }

  /**
   * Формирует HTML-код транзакции (дохода или расхода).
   * item - объект с информацией о транзакции
   * */
  getTransactionHTML(item){
    const classname = item.type === 'income' ? 'transaction_income' : 'transaction_expense';
    const template = `
    <div class="transaction ${classname} row">
        <div class="col-md-7 transaction__details">
          <div class="transaction__icon">
              <span class="fa fa-money fa-2x"></span>
          </div>
          <div class="transaction__info">
              <h4 class="transaction__title">${item.name}</h4>
              <div class="transaction__date">${this.formatDate(item.created_at)}</div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="transaction__summ">
            ${item.sum}  <span class="currency">₽</span>
          </div>
        </div>
        <div class="col-md-2 transaction__controls">
            <button class="btn btn-danger transaction__remove" data-id="${item.id}">
                <i class="fa fa-trash"></i>  
            </button>
        </div>
    </div>`;
    return template;
  }

  /**
   * Отрисовывает список транзакций на странице
   * используя getTransactionHTML
   * */
  renderTransactions(data){
    const content = this.element.querySelector('.content');
    content.innerHTML = '';
    if (!data.length) {
      return;
    }

    data.forEach((item) => {
      content.innerHTML += this.getTransactionHTML(item);
    });
  }
}

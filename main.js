const URL = "./request.php?method=";
const ROOT_TITLE = "root";
const ROOT_MESSAGE = "Create root";
const CHILDREN_HIDE = "fa-angle-right";
const CHILDREN_SHOW = "fa-angle-down";
const ITEM_BTN_ADD = "fa-plus";
const ITEM_BTN_DELETE = "fa-minus";

class Request {
  constructor() {
    this.method = "read";
    this.data = {};
  }

  create(data) {
    this.method = "create";
    this.data = data;
    return this;
  }

  update(id, data) {
    this.method = "update";
    this.data = { id, ...data };
    return this;
  }

  delete(id) {
    this.method = "delete";
    this.data = { id };
    return this;
  }

  async execute() {
    const response = await fetch(URL + this.method, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(this.data),
    });
    return await response.json();
  }
}

class App {
  constructor() {
    this.application = document.getElementById("app");
    this.modalAdd = document.getElementById("add");
    this.modalRemove = document.getElementById("remove");
    this.backDrop = document.getElementById("backdrop");
    this.modalItemId = null;
    this.modalItemUpdate = false;
  }

  request() {
    return new Request();
  }

  loading() {
    this.application.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
  }

  btnRoot(message = ROOT_MESSAGE) {
    this.application.innerHTML = `<span class="btn btn-primary" onclick="app.createRoot()">${message}</span>`;
  }

  callbackAfterExecute(data) {
    if (data && data.length > 0) {
      this.application.innerHTML = this.template(this.generateTreeFromItems(data));
    } else {
      this.btnRoot();
    }
    this.closeModal();
  }

  createRequest(data) {
    this.loading();
    this.request()
      .create(data)
      .execute()
      .then((data) => this.callbackAfterExecute(data));
  }

  updateRequest(id, data) {
    this.loading();
    this.request()
      .update(id, data)
      .execute()
      .then((data) => this.callbackAfterExecute(data));
  }

  deleteRequest() {
    this.loading();
    this.request()
      .delete(this.modalItemId)
      .execute()
      .then((data) => this.callbackAfterExecute(data));
  }

  readItems() {
    this.loading();
    this.request()
      .execute()
      .then((data) => this.callbackAfterExecute(data));
  }

  generateTreeFromItems(params) {
    let values = Object.values(params);
    let map = {};

    values.forEach(function (row) {
      map[row.id] = {
        title: row.title,
        id: row.id,
        parent: row.parent_id,
        children: [],
      };
    });
    values.forEach(function (row) {
      if (map[row.parent_id]) {
        map[row.parent_id].children.push(map[row.id]);
      }
    });

    Object.keys(map).forEach((k) => {
      if (map[k].parent != 0) {
        delete map[k];
      }
    });

    return map;
  }

  template(params) {
    let li = [];
    Object.values(params).forEach((row) => {
      li.push(
        `<li>
          <div class="d-flex justify-content-between my-1">
            <div>
              <span class="branch-name" onclick="app.update(${row.id}, '${row.title}')">${row.title}</span>
            </div>
            <div class="btn-group" role="group">
              <span class="btn btn-outline-secondary btn-sm" onclick="app.add(${row.id}, '${row.title}')"><i class="fa-solid ${ITEM_BTN_ADD}"></i></span>
              <span class="btn btn-outline-secondary btn-sm" onclick="app.remove(${row.id}, '${row.title}')"><i class="fa-solid ${ITEM_BTN_DELETE}"></i></span>
            </div>
          </div>
          ${row.children.length ? this.template(row.children) : ""}
        </li>`
      );
    });
    return li.length ? `<ul>${li.join("")}</ul>` : "";
  }

  openModal(modal, id) {
    this.modalItemId = id;
    if (!modal.classList.contains("show")) {
      modal.classList.add("show", "d-block");
    }
    if (this.backDrop.classList.contains("d-none")) {
      this.backDrop.classList.remove("d-none");
      this.backDrop.classList.add("show");
    }
  }

  closeModal() {
    document.querySelectorAll(".modal input").forEach(input => input.value = "");
    document.querySelectorAll(".modal").forEach(modal => {
      if (modal.classList.contains("show")) {
        modal.classList.remove("show", "d-block");
      }
    });
    if (!this.backDrop.classList.contains("d-none")) {
      this.backDrop.classList.add("d-none");
      this.backDrop.classList.remove("show");
    }
    this.modalItemId = null;
  }

  createRoot() {
    this.createRequest({
      title: ROOT_TITLE,
    });
  }

  add(id, title) {
    this.modalItemUpdate = false;
    this.modalAdd.querySelector(".modal-title").textContent = `Add item in "${title}"`;
    this.modalAdd.querySelector(".btn-primary").textContent = "Add item";
    this.openModal(this.modalAdd, id);
  }

  addSubmit() {
    let data = {
      title: this.modalAdd.querySelector("input").value,
    };
    if (this.modalItemUpdate) {
      this.updateRequest(this.modalItemId, data);
    } else {
      data.parent_id = this.modalItemId;
      this.createRequest(data);
    }
  }

  remove(id, title) {
    this.modalRemove.querySelector(".modal-body").textContent = `Would you like to delete "${title}"? Are you sure?`;
    this.openModal(this.modalRemove, id);
  }

  update(id, title) {
    this.modalItemUpdate = true;
    this.modalAdd.querySelector(".modal-title").textContent = `Edit item "${title}"`;
    this.modalAdd.querySelector(".btn-primary").textContent = "Edit item";
    this.modalAdd.querySelector("input").value = title;
    this.openModal(this.modalAdd, id);
  }
}

var app = new App();

window.onload = function () {
  app.readItems();
};

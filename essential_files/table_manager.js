const new_value_cell = () => {
    return constructElement("td", { class: "value-cell type-buttons" },
        constructElement("div", { class: "button", onclick: "insert_value_input(this, TEXT)" }, "Tekst"),
        constructElement("div", { class: "button", onclick: "insert_value_input(this, NUMBER)" }, "Liczba"),
        constructElement("div", { class: "button", onclick: "insert_value_input(this, BOOLEAN)" }, "Logiczna"),
        constructElement("br"),
        constructElement("div", { class: "button", onclick: "insert_value_input(this, ARRAY)" }, "Lista"),
        constructElement("div", { class: "button", onclick: "insert_value_input(this, OBJECT)" }, "Objekt"),
        constructElement("div", { class: "button", onclick: "insert_value_input(this, NULL)" }, "Nic")
    );
};

const new_remove_button_cell = () =>
    constructElement("td", { class: "remove-button-cell" },
        constructElement("div", { class: "button", onclick: "remove_row(this)" }, "Usuń")
    );

const new_value_row = () =>
    constructElement("tr", {},
        new_value_cell(),
        new_remove_button_cell()
    );

const new_key_value_row = () =>
    constructElement("tr", {},
        constructElement("td", { class: "key-cell" },
            constructElement("input", { type: "text", placeholder: "nazwa_klucza", oninput: "update_preview()" })
        ),
        new_value_cell(),
        new_remove_button_cell()
    );

const new_text_input = text =>
    constructElement("input", { type: "text", placeholder: "tekst", oninput: "update_preview()", value: text });

const new_number_input = number =>
    constructElement("input", { type: "number", placeholder: "liczba", oninput: "update_preview()", value: number });

const new_boolean_input = boolean =>
    constructElement("input", (boolean ?
        { type: "checkbox", oninput: "update_preview()", checked: "" } :
        { type: "checkbox", oninput: "update_preview()" }));

const new_null_indicator = () => constructElement("div", { class: "null-indicator" }, "null");

const new_array_table = array => {
    const row = constructElement("tr", {},
        constructElement("td", { class: "add-button-cell button-cell", colspan: "3" },
            constructElement("div", { class: "blue button", onclick: "insert_value_row(this)" }, "Dodaj wartość")
        )
    );
    const tbody = constructElement("tbody", {}, row);
    for (const value of array)
        tbody.insertBefore(
            constructElement("tr", {},
                constructElement("td", { class: "value-cell" }, value_to_table(value)),
                new_remove_button_cell()
            ),
            row
        );
    return constructElement("table", { class: "array-table" }, tbody);
}

const new_object_table = object => {
    const row = constructElement("tr", {},
        constructElement("td", { class: "add-button-cell button-cell", colspan: "3" },
            constructElement("div", { class: "blue button", onclick: "insert_key_value_row(this)" }, "Dodaj klucz")
        )
    );
    const tbody = constructElement("tbody", {}, row);
    for (const key in object)
        tbody.insertBefore(
            constructElement("tr", {},
                constructElement("td", { class: "key-cell" },
                    constructElement("input", { type: "text", placeholder: "nazwa_klucza", oninput: "update_preview()", value: key })
                ),
                constructElement("td", { class: "value-cell" }, value_to_table(object[key])),
                new_remove_button_cell()
            ),
            row
        );
    return constructElement("table", { class: "object-table" }, tbody);
}

const insert_value_input = (button, type) => {
    const value_cell = button.parentNode;
    value_cell.innerHTML = "";
    removeClass(value_cell, "type-buttons");
    switch (type) {
        case TEXT:
            value_cell.appendChild(new_text_input(""));
            break;
        case NUMBER:
            value_cell.appendChild(new_number_input(null));
            break;
        case BOOLEAN:
            value_cell.appendChild(new_boolean_input(false));
            break;
        case ARRAY:
            value_cell.appendChild(new_array_table());
            break;
        case OBJECT:
            value_cell.appendChild(new_object_table());
            break;
        case NULL:
            value_cell.appendChild(new_null_indicator());
            break;
    }
    update_preview();
};

const insert_value_row = button => {
    const button_row = button.parentNode.parentNode;
    button_row.parentNode.insertBefore(new_value_row(), button_row);
    update_preview();
};

const insert_key_value_row = button => {
    const button_row = button.parentNode.parentNode;
    button_row.parentNode.insertBefore(new_key_value_row(), button_row);
    update_preview();
};

const remove_row = button => {
    removeNode(button.parentNode.parentNode);
    update_preview();
};

const value_to_table = value => {
    if (value == null) {
        return new_null_indicator();
    } else if (value instanceof Array) {
        return new_array_table(value);
    } else if (value instanceof Object) {
        return new_object_table(value);
    } else {
        switch ((typeof value).toLowerCase()) {
            case "string":
                return new_text_input(value);
            case "number":
                return new_number_input(value);
            case "boolean":
                return new_boolean_input(value);
        }
    }
};

const load_table_from_database = () => {
    document.body.querySelector("#editor").innerHTML = "";
    document.body.querySelector("#editor").appendChild(value_to_table(database));
};
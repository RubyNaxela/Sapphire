const read_key = key_cell => key_cell.childNodes[0].value;

const read_value = value_cell => {
    if (value_cell.childElementCount == 1) {
        const value_node = value_cell.childNodes[0];
        switch (value_node.nodeName.toLowerCase()) {
            case "input":
                switch (value_node.type) {
                    case "text":
                        return value_node.value;
                    case "number":
                        return Number(value_node.value);
                    case "checkbox":
                        return value_node.checked;
                }
            case "table":
                if (containsClass(value_node, "array-table")) {
                    const ret = new Array();
                    for (var i = 0; i < value_node.querySelector("tbody").childElementCount; i++) {
                        const value_cell = value_node.querySelector("tbody").childNodes[i].childNodes[0];
                        if (!containsClass(value_cell, "button-cell")) ret.push(read_value(value_cell));
                    }
                    return ret;
                }
                else if (containsClass(value_node, "object-table")) {
                    const ret = new Object();
                    for (var i = 0; i < value_node.querySelector("tbody").childElementCount; i++) {
                        const entry_row = value_node.querySelector("tbody").childNodes[i];
                        const key_cell = entry_row.childNodes[0];
                        const value_cell = entry_row.childNodes[1];
                        if (!containsClass(key_cell, "button-cell")) ret[read_key(key_cell)] = read_value(value_cell);
                    }
                    return ret;
                }
            case "div":
                if (value_node.innerHTML == "null") return null;
                else return value_node.innerHTML;
        }
    } else return null;
};
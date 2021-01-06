var database = new Object();
var file_name = "database.json";
const TEXT = 0, NUMBER = 1, BOOLEAN = 2, ARRAY = 3, OBJECT = 4, NULL = 5;

const syntax_highlight = json_string => {
    json_string = json_string.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json_string.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
        match => {
            var color_group = 'number';
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    color_group = 'key';
                } else {
                    color_group = 'string';
                }
            } else if (/true|false/.test(match)) {
                color_group = 'boolean';
            } else if (/null/.test(match)) {
                color_group = 'null';
            }
            return `<span class="json-${color_group}">${match}</span>`.replaceAll(":</span>", "</span>:");
        }
    );
};

const load_preview = () => {
    selectElement("#preview").innerHTML = syntax_highlight(JSON.stringify(database, null, 2));
};

const update_preview = () => {
    database = read_value(selectElement("#editor"));
    load_preview();
};

const clear = () => {
    database = new Object();
    load_preview();
};

const confirm_upload = () => {
    const json_upload_input = selectElement("#json-upload-input");
    const file = json_upload_input.files[0];
    if (_(file)) {
        const json_reader = new FileReader();
        json_reader.onload = event => {
            database = JSON.parse(event.target.result);
            load_preview();
            load_table_from_database();
        };
        json_reader.readAsText(file);
        file_name = file.name;
        close_window("upload-window");
        json_upload_input.value = null;
    }
};

const save_file = () => downloadFile(JSON.stringify(database, null, 4), file_name);

const close_window = window => addClass(selectElement(`#${window}`), "closed");
// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::sync::Mutex;
use tauri::State;

use csv::StringRecord;

enum Operator {
    Przelewy24,
    PayU,
}

impl Operator {
    fn as_str(&self) -> &str {
        match self {
            Operator::Przelewy24 => "Przelewy24",
            Operator::PayU => "PayU",
        }
    }
}

//TODO: rozpisz struct stanu, ma miec dwie wartosci, header i
/* struct ResultState(Mutex<InnerResultState>);
struct InnerResultState {
    header: Option<StringRecord>,
    lines: Vec<StringRecord>,
}
 */

struct ResultState {
    header: StringRecord,
    lines: Mutex<Vec<StringRecord>>,
}

impl Default for ResultState {
    fn default() -> Self {
        ResultState {
            header: StringRecord::from_iter(vec![
                "data",
                "data zaksięgowania",
                "identyfikator",
                "operacja",
                "operator",
                "kupujący",
                "oferta",
                "dostawa",
                "kwota",
                "saldo",
            ]),
            lines: Default::default(),
        }
    }
}

fn parse_files(
    file_path_src: &str,
    transfer_id: &str,
    state: State<ResultState>,
) -> Result<(), String> {
    // Build the CSV reader and iterate over each record.
    let mut rdr = csv::ReaderBuilder::new()
        .has_headers(false)
        .from_path(file_path_src)
        .map_err(|err| err.to_string())?;

    let header = state.header.clone();

    if header != rdr.headers().unwrap().clone() {
        return Err("Nieprawidowy format nagłówka".to_string());
    }

    let mut results = vec![];

    let mut save = false;

    let mut operator: Option<Operator> = None;

    for result in rdr.records() {
        // The iterator yields Result<StringRecord, Error>, so we check the
        // error here..
        let record = result.map_err(|err| err.to_string())?;

        if transfer_id == &record[2] {
            save = true;
            operator = match &record[4] {
                "Przelewy24" => Some(Operator::Przelewy24),
                "PayU" => Some(Operator::PayU),
                _ => return Err("Nieznany operator płatności".to_string()),
            };
        }

        if save {
            if results.len() > 1 && &record[9] == "0.00 zł" {
                break;
            }

            match &operator {
                Some(x) => {
                    if x.as_str() == &record[4] {
                        results.push(record.clone());
                    }
                }
                None => {}
            }
        }
    }

    if results.is_empty() {
        return Err(
            "W pliku nie ma linijek powiązanych z wpisanym identyfikatorem płatności".to_string(),
        );
    }

    let mut ss = state.lines.lock().unwrap();

    *ss = results;

    Ok(())
}

#[tauri::command]
fn save_results_to_file(
    save_path: String,
    transfer_id: String,
    state: State<ResultState>,
) -> Result<String, String> {
    let results = state.lines.lock().unwrap().clone();

    let save_file_path_full = save_path + "\\" + &transfer_id + ".csv";

    let mut writer = csv::WriterBuilder::new()
        .quote_style(csv::QuoteStyle::Always)
        .from_path(&save_file_path_full)
        .map_err(|err| err.to_string())?;

    writer
        .write_record(state.header.clone().into_iter())
        .unwrap();

    for line in results {
        writer.write_record(line.into_iter()).unwrap();
    }

    println!("zapisuje plik");

    writer.flush().map_err(|err| err.to_string())?;

    Ok(save_file_path_full)
}

#[tauri::command]
fn generate_file(
    file_path_src: String,
    transfer_id: String,
    state: State<ResultState>,
) -> Result<(), String> {
    parse_files(&file_path_src, &transfer_id, state)
}

fn main() {
    tauri::Builder::default()
        .manage(ResultState::default())
        .invoke_handler(tauri::generate_handler![
            generate_file,
            save_results_to_file
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

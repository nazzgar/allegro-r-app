import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import "../App.css";
import { WebviewWindow } from "@tauri-apps/api/window";

import { z } from "zod";

import { open, message } from "@tauri-apps/api/dialog";
import HelpIcon from "../components/HelpIcon";

// Tauri state: https://gist.github.com/captainhusaynpenguin/5bdb6fcb141628b6865619bcd1c827fd

function Home() {
  const [filePath, setFilePath] = useState<string>("");
  const [transferId, setTransferId] = useState<string>("");

  const openHelpWindow = () => {
    const webview = new WebviewWindow("theUniqueLabel", {
      url: "/help",
      title: "Pomoc",
    });
  };

  const handleOpenFile = async () => {
    let selected = await open({
      multiple: false,
      filters: [
        {
          name: "plik",
          extensions: ["csv"],
        },
      ],
    });

    if (Array.isArray(selected)) {
      selected = selected[0];
    }

    if (selected == null) {
      selected = "";
    }

    setFilePath(selected);
  };

  const handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault();

    const uuidSchema = z
      .string()
      .nonempty("Brak identyfikatora płatności")
      .uuid("Nieprawidłowy identyfikator płatności");

    const filePathSchema = z.string().nonempty("Nieprawidłowa ścieżka pliku");

    try {
      uuidSchema.parse(transferId);
      filePathSchema.parse(filePath);

      await invoke("generate_file", {
        filePathSrc: filePath,
        transferId,
      });

      let savePath = await open({
        multiple: false,
        directory: true,
        title: "Wybierz folder do zapisania pliku",
      });

      if (Array.isArray(savePath)) {
        savePath = savePath[0];
      }

      if (savePath == null) {
        return;
      }

      const savedFilePath = await invoke("save_results_to_file", {
        savePath,
        transferId,
      });

      await message(`Plik zapisany: \n ${savedFilePath}`);

      setFilePath("");
      setTransferId("");
    } catch (e) {
      if (typeof e == "string") {
        await message(e, {
          type: "error",
        });
      }

      if (e instanceof z.ZodError) {
        await message(e.issues[0].message, {
          type: "error",
        });
      }
    }
  };

  return (
    <div className="container">
      <HelpIcon onClick={openHelpWindow} />

      <h1>Generowanie plików do rozliczeń Allegro</h1>
      <div className="row">
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="transferid">Identyfikator przelewu</label>
            <input
              id="transferid"
              type="text"
              value={transferId}
              onChange={(e) => setTransferId(e.target.value)}
            />
          </div>

          <div>
            <button type="button" onClick={handleOpenFile}>
              Otwórz plik
            </button>
          </div>

          {filePath && (
            <div>
              <label htmlFor="filepath">Wybrany plik</label>
              <input id="filepath" disabled type="text" value={filePath} />
            </div>
          )}

          <div>
            <button type="submit">Wygeneruj plik</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Home;

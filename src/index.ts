import { Colors } from "./Colors";
import { addNote, getAllNotes, Note } from "./db/db";

function setStyle(el: HTMLElement, style: Partial<CSSStyleDeclaration>) {
  for (const key of Object.keys(style)) {
    el.style[key] = style[key];
  }
}

async function init() {
  let serviceWorkerRegistration: ServiceWorkerRegistration;
  if ("serviceWorker" in navigator) {
    serviceWorkerRegistration = await navigator.serviceWorker.register("serviceworker.js");
  }

  const root = document.getElementById("root");
  if (!root) {
    return;
  }

  setStyle(document.body, {
    backgroundColor: Colors.BG_DARK,
    color: Colors.TEXT,
    margin: "0",
    fontFamily: `"Roboto", "Helvetica", "Arial", sans-serif`
  })

  setStyle(root, {
    
  });

  const noteList = document.createElement("div");
  noteList.id = 'note-list';
  setStyle(noteList, {
    height: "calc(100vh - 46px)",
    overflowY: "scroll",
    overflowX: "hidden",
    display: "flex",
    flexDirection: "column-reverse",
    maxWidth: "800px",
    width: "100%",
    margin: "0 auto",
  });
  root.append(noteList);

  const footer = document.createElement("div");
  setStyle(footer, {
    backgroundColor: Colors.BG_LIGHT,
    padding: "8px"
  })
  root.append(footer);

  const input = document.createElement("input");
  input.autofocus = true;
  setStyle(input, {
    display: "block",
    width: "100%",
    maxWidth: "800px",
    height: "30px",
    margin: "0 auto",
    padding: "0",
    backgroundColor: Colors.BG_LIGHT,
    outline: "none",
    border: "none",
    borderBottom: "1px solid white",
    borderRadius: "0",
    color: Colors.TEXT,
    fontSize: "1em"
  });
  footer.append(input);

  const NoteListItem = (note: Note) => {
    const noteDiv = document.createElement("div");
    setStyle(noteDiv, {
      borderTop: `1px solid ${Colors.BG_LIGHT}`,
      padding: "8px"
    })
    noteDiv.innerText = note.body || "";
    noteList.prepend(noteDiv);
    return noteDiv;
  };

  document.addEventListener("keydown", async (e) => {
    if (e.key === "Enter") {
      if (!input.value) {
        noteList.innerHTML = "";
      } else if (!e.shiftKey) {
        const value = input.value;
        input.value = "";

        if (value === "/refresh") {
          await caches.delete("notes-v1");
          if (serviceWorkerRegistration) {
            await serviceWorkerRegistration.unregister();
          }
          window.location.reload();
          return;
        }

        const note = await addNote({
          body: value,
        });

        const noteListItem = NoteListItem(note);
        noteListItem.scrollIntoView();
      }
    }
  });

  const notes = await getAllNotes();
  const sortedNotes = notes.sort((a, b) => {
    return (a.createdAt as any).getTime() - (b.createdAt as any).getTime();
  });
  for (const note of sortedNotes) {
    NoteListItem(note);
  }
}

init();

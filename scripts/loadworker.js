import { createDbWorker } from "sql.js-httpvfs";

const workerUrl = new URL(
  "sql.js-httpvfs/dist/sqlite.worker.js",
  import.meta.url
);
const wasmUrl = new URL("sql.js-httpvfs/dist/sql-wasm.wasm", import.meta.url);

async function loadWorker() {
  document.getElementById('wrapper').innerHTML = '<span style="font-size:15px; margin-top:5px;">Connecting to sqlite httpvfs database...</span>';
  const worker = await createDbWorker(
    [
      {
        from: "inline",
        config: {
          serverMode: "full",
          url: "../../data/journal.db",
          requestChunkSize: 4096,
        },
      },
    ],
    workerUrl.toString(),
    wasmUrl.toString()
  );
  window.worker = worker;
  document.getElementById('wrapper').innerHTML = '<span style="font-size:15px; margin-top:5px;">Database connected</span>';
  document.querySelector('.loading-mask').style.height = "5px"
  document.querySelector('.loading-mask').style.backgroundColor = ""
  // return worker
}

async function loadDB(){
    let chunks = []
    var loadingBar = document.querySelector(".progress-bar")
    var res = new Object;
    const sqlPromise = initSqlJs({
      locateFile: file => `../scripts/sql-wasm.wasm`
    });
    let total = null;
    let loaded = 0;
    const logProcess = (res) => {
        const reader = res.body.getReader();
        const push = ({ value, done }) => {
            if (done) return chunks;
            chunks.set(value, loaded);
            loaded += value.length;
            if (total === null) {
                console.log(`Downloaded ${loaded}`);
            } else {
                loadingBar.ariaValueNow = (loaded / total * 100)
                loadingBar.style.width = `${(loaded / total * 100).toFixed(2)}%`
            }
            return reader.read().then(push);
        };
        return reader.read().then(push);
    };
    // const dataPromise = fetch("https://raw.githubusercontent.com/jiangjy-713/AL_Index/master/data/journal.db")
    dataPromise = fetch("../data/journal.db")
                   .then((res) => {
                        total = res.headers.get('content-length')
                        chunks = new Uint8Array(total) // array of received binary chunks (comprises the body)
                        return res
                    }).then(logProcess);
    const [SQL, buf] = await Promise.all([sqlPromise, dataPromise])
    document.querySelector('.loading-mask').style.display = "none";
    window.db = new SQL.Database(new Uint8Array(buf));
}


loadWorker();
loadDB();

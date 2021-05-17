import sha1 from 'sha1'
import Zip from 'jszip'
import { SqlJs } from 'sql.js/module'
import initSql from '../Database/intiSqlJs'

export type AnkiTemplate = {front:string, back:string, css:string}

function buildTemplateSql ({ front, back, css }:AnkiTemplate) {
  const conf = {
    nextPos: 1,
    estTimes: true,
    activeDecks: [1],
    sortType: 'noteFld',
    timeLim: 0,
    sortBackwards: false,
    addToCur: true,
    curDeck: 1,
    newBury: true,
    newSpread: 0,
    dueCounts: true,
    curModel: '1435645724216',
    collapseTime: 1200
  }

  const models = {
    1388596687391: {
      veArs: [],
      name: 'Basic-f15d2',
      tags: ['Tag'],
      did: 1435588830424,
      usn: -1,
      req: [[0, 'all', [0]]],
      flds: [
        {
          name: 'Front',
          media: [],
          sticky: false,
          rtl: false,
          ord: 0,
          font: 'Arial',
          size: 20
        },
        {
          name: 'Back',
          media: [],
          sticky: false,
          rtl: false,
          ord: 1,
          font: 'Arial',
          size: 20
        }
      ],
      sortf: 0,
      latexPre:
        '\\documentclass[12pt]{article}\n\\special{papersize=3in,5in}\n\\usepackage[utf8]{inputenc}\n\\usepackage{amssymb,amsmath}\n\\pagestyle{empty}\n\\setlength{\\parindent}{0in}\n\\begin{document}\n',
      tmpls: [
        {
          name: 'Card 1',
          qfmt: front,
          did: null,
          bafmt: '',
          afmt: back,
          ord: 0,
          bqfmt: ''
        }
      ],
      latexPost: '\\end{document}',
      type: 0,
      id: 1388596687391,
      css,
      mod: 1435645658
    }
  }

  const decks = {
    1: {
      desc: '',
      name: 'Default',
      extendRev: 50,
      usn: 0,
      collapsed: false,
      newToday: [0, 0],
      timeToday: [0, 0],
      dyn: 0,
      extendNew: 10,
      conf: 1,
      revToday: [0, 0],
      lrnToday: [0, 0],
      id: 1,
      mod: 1435645724
    },
    1435588830424: {
      desc: '',
      name: 'Template',
      extendRev: 50,
      usn: -1,
      collapsed: false,
      newToday: [545, 0],
      timeToday: [545, 0],
      dyn: 0,
      extendNew: 10,
      conf: 1,
      revToday: [545, 0],
      lrnToday: [545, 0],
      id: 1435588830424,
      mod: 1435588830
    }
  }

  const dconf = {
    1: {
      name: 'Default',
      replayq: true,
      lapse: {
        leechFails: 8,
        minInt: 1,
        delays: [10],
        leechAction: 0,
        mult: 0
      },
      rev: {
        perDay: 100,
        fuzz: 0.05,
        ivlFct: 1,
        maxIvl: 36500,
        ease4: 1.3,
        bury: true,
        minSpace: 1
      },
      timer: 0,
      maxTaken: 60,
      usn: 0,
      new: {
        perDay: 20,
        delays: [1, 10],
        separate: true,
        ints: [1, 4, 7],
        initialFactor: 2500,
        bury: true,
        order: 1
      },
      mod: 0,
      id: 1,
      autoplay: true
    }
  }

  return `
    PRAGMA foreign_keys=OFF;
    BEGIN TRANSACTION;
    CREATE TABLE col (
        id              integer primary key,
        crt             integer not null,
        mod             integer not null,
        scm             integer not null,
        ver             integer not null,
        dty             integer not null,
        usn             integer not null,
        ls              integer not null,
        conf            text not null,
        models          text not null,
        decks           text not null,
        dconf           text not null,
        tags            text not null
    );
    INSERT INTO "col" VALUES(
      1,
      1388548800,
      1435645724219,
      1435645724215,
      11,
      0,
      0,
      0,
      '${JSON.stringify(conf)}',
      '${JSON.stringify(models)}',
      '${JSON.stringify(decks)}',
      '${JSON.stringify(dconf)}',
      '{}'
    );
    CREATE TABLE notes (
        id              integer primary key,   /* 0 */
        guid            text not null,         /* 1 */
        mid             integer not null,      /* 2 */
        mod             integer not null,      /* 3 */
        usn             integer not null,      /* 4 */
        tags            text not null,         /* 5 */
        flds            text not null,         /* 6 */
        sfld            integer not null,      /* 7 */
        csum            integer not null,      /* 8 */
        flags           integer not null,      /* 9 */
        data            text not null          /* 10 */
    );
    CREATE TABLE cards (
        id              integer primary key,   /* 0 */
        nid             integer not null,      /* 1 */
        did             integer not null,      /* 2 */
        ord             integer not null,      /* 3 */
        mod             integer not null,      /* 4 */
        usn             integer not null,      /* 5 */
        type            integer not null,      /* 6 */
        queue           integer not null,      /* 7 */
        due             integer not null,      /* 8 */
        ivl             integer not null,      /* 9 */
        factor          integer not null,      /* 10 */
        reps            integer not null,      /* 11 */
        lapses          integer not null,      /* 12 */
        left            integer not null,      /* 13 */
        odue            integer not null,      /* 14 */
        odid            integer not null,      /* 15 */
        flags           integer not null,      /* 16 */
        data            text not null          /* 17 */
    );
    CREATE TABLE revlog (
        id              integer primary key,
        cid             integer not null,
        usn             integer not null,
        ease            integer not null,
        ivl             integer not null,
        lastIvl         integer not null,
        factor          integer not null,
        time            integer not null,
        type            integer not null
    );
    CREATE TABLE graves (
        usn             integer not null,
        oid             integer not null,
        type            integer not null
    );
    ANALYZE sqlite_master;
    INSERT INTO "sqlite_stat1" VALUES('col',NULL,'1');
    CREATE INDEX ix_notes_usn on notes (usn);
    CREATE INDEX ix_cards_usn on cards (usn);
    CREATE INDEX ix_revlog_usn on revlog (usn);
    CREATE INDEX ix_cards_nid on cards (nid);
    CREATE INDEX ix_cards_sched on cards (did, queue, due);
    CREATE INDEX ix_revlog_cid on revlog (cid);
    CREATE INDEX ix_notes_csum on notes (csum);
    COMMIT;
  `
}

export class Anki {
  db:SqlJs.Database
  topDeckId:number
  topModelId:number
  separator = '\u001F'
  cardsTableName = 'cards'
  cardsTableId = 'did'
  nodesTableName = 'notes'
  nodesTableId = 'mid'
  async init (deckName:string, template:AnkiTemplate):Promise<void> {
    if (this.db) {
      throw new Error('Multiple inits.')
    }
    const sql = await initSql()
    this.db = new sql.Database()
    this.db.run(buildTemplateSql(template))
    const now = Date.now()
    const topDeckId = this.getLatestIdOfTable(this.cardsTableName, this.cardsTableId, now)
    const topModelId = this.getLatestIdOfTable(this.nodesTableName, this.nodesTableId, now)
    this.topDeckId = topDeckId
    this.topModelId = topModelId

    const decks = this.getFirstRowOfTable('col', 'decks')
    const deck = this.popLastItem(decks)
    deck.name = deckName
    deck.id = topDeckId
    decks[topDeckId + ''] = deck
    this.db.prepare('update col set decks=:decks where id=1').getAsObject({ ':decks': JSON.stringify(decks) })

    const models = this.getFirstRowOfTable('col', 'models')
    const model = this.popLastItem(models)
    model.name = deckName
    model.did = this.topDeckId
    model.id = topModelId
    models[`${topModelId}`] = model
    this.db.prepare('update col set models=:models where id=1').getAsObject({ ':models': JSON.stringify(models) })
  }

  deinit () {
    this.db.close()
  }

  export () :Promise<ArrayBuffer> {
    const zip = new Zip()
    const binaryArray = this.db.export()
    zip.file('collection.anki2', binaryArray)
    zip.file('media', JSON.stringify({}))
    return zip.generateAsync({ type: 'arraybuffer' })
  }

  addCard (front:string, back:string) {
    const { topDeckId, topModelId, separator } = this
    const now = Date.now()
    const noteGuid = this.generateNoteGui(topDeckId, front, back)
    const noteId = this.getNoteId(noteGuid, now)
    let query = `insert or replace into notes values(${noteId},"${noteGuid}",${topModelId},${this.getLatestIdOfTable('notes', 'mod', now)},-1,"",:flds,:sfld,:csum,0,"")`
    this.db.prepare(query).getAsObject({
      ':flds': front + separator + back,
      ':sfld': front,
      ':csum': parseInt(sha1((front + separator + back)).substr(0, 8), 16)
    })
    query = `insert or replace into cards values(${this.getCardId(noteId as any, now)},${noteId},${topDeckId},0,${this.getLatestIdOfTable('cards', 'mod', now)},-1,0,0,179,0,0,0,0,0,0,0,0,"")`
    return this.db.prepare(query).getAsObject({})
  }

  getFirstRowOfTable (tbl:string, col:string) {
    const res = this.db.exec(`select ${col} from ${tbl}`)[0].values[0][0] as string
    return JSON.parse(res)
  }

  getLatestIdOfTable (table:string, idCol:string, ts:number) {
    const query = `SELECT ${idCol} from ${table} WHERE ${idCol} >= ${ts} ORDER BY ${idCol} DESC LIMIT 1`
    const rowObj = this.db.prepare(query).getAsObject()
    return rowObj[idCol] ? (rowObj[idCol] as number) + 1 : ts
  }

  getNoteId (guid:string, ts:any) :number {
    const query = `SELECT id from notes WHERE guid = "${guid}" ORDER BY id DESC LIMIT 1`
    const rowObj = this.db.prepare(query).getAsObject()
    return rowObj.id as number || this.getLatestIdOfTable('notes', 'id', ts)
  }

  generateNoteGui (topDeckId:number, front:string, back:string) {
    return sha1(`${topDeckId}${front}${back}`)
  }

  getCardId (noteId:number, ts:number) {
    const query = `SELECT id from cards WHERE nid = ${noteId} ORDER BY id DESC LIMIT 1`
    const rowObj = this.db.prepare(query).getAsObject()
    return rowObj.id || this.getLatestIdOfTable('cards', 'id', ts)
  }

  popLastItem (obj:any) {
    const keys = Object.keys(obj)
    const lastKey = keys[keys.length - 1]
    const item = obj[lastKey]
    delete obj[lastKey]
    return item
  }
}

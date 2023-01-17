const { GoogleSpreadsheet } = require('google-spreadsheet');
const credentials = require('./json/credentials.json');
const {google} = require('googleapis');

require("dotenv").config();

const auth = new google.auth.GoogleAuth({
        keyFile: './json/credentials.json',
        scopes: "https://www.googleapis.com/auth/spreadsheets",
    })

const _clientGoogle = auth.getClient(); // Se instancia nuevo cliente para auth
const googleSheets = google.sheets({version: "v4", auth: _clientGoogle}) // Se instancia la API de Google Sheets 

let spreadsheetId = process.env.SHEETS_ID; 
let activeSheet;

async function loginGoogleSuite() {
    const document = new GoogleSpreadsheet(spreadsheetId);
    await document.useServiceAccountAuth(credentials);
    await document.loadInfo();
    const sheet = document.sheetsByIndex[0];
    activeSheet = sheet;
}

const modifyNickname = async function(newMember, values) {
    const rowID = await getRowIdByDID(newMember.id, 'RANGOS')
    googleSheets.spreadsheets.values.update({
        auth,
        spreadsheetId,
        range: 'RANGOS!C' + rowID + ':C' + rowID,
        valueInputOption: 'USER_ENTERED',
        resource: {
            values: [[newMember.nickname.includes('-') ? newMember.nickname.split('-')[0] : newMember.nickname]] // Se le agrega con el nombre que esté... cuando se lo cambie será un update
        }
    })
}

const modifyRow = async function(newMember, role) {
    await deleteRowByDID(newMember)
    const rowID = await getRowIdByDID(newMember.id, 'RANGOS');
    const lastRowNumberRank = await getLastByRank(newMember, role);
    await activeSheet.insertDimension("ROWS", {startIndex: lastRowNumberRank, endIndex: lastRowNumberRank + 1}, true); // El último 'true' copia los estilos de la fila de arriba
    googleSheets.spreadsheets.values.append({
        auth,
        spreadsheetId,
        range: 'RANGOS!B' + (lastRowNumberRank + 1) + ':E' + (lastRowNumberRank + 1),
        valueInputOption: 'USER_ENTERED',
        resource: {
            values: [[ role,
                newMember.nickname.includes('-') ? newMember.nickname.split('-')[0] : newMember.nickname,
                newMember.id,
                new Date().toLocaleString().split(',')[0] ]]
        }
    })

}

async function getLastByRank(newMember, rank) { // obtener el ultimo usuario de cada rango
    const rows = await activeSheet.getRows();
    const pfaInRank = []
    rows.forEach(row => {
        if(row.Rango == rank)  
            pfaInRank.push(row) 
    })
    return pfaInRank[pfaInRank.length - 1]._rowNumber
}



const deleteRowByDID = async function(newMember) {
    const rows = await getRows('RANGOS') // VER DE USAR ROW.DEL() DE GOOGLE-SPREADSHEET 
    Object.entries(rows.data.values).forEach(entry => {
        const [key, value] = entry;
        value.forEach(cell => {
            if(cell == newMember.id) 
            {
                googleSheets.spreadsheets.batchUpdate({
                    auth: auth,
                    spreadsheetId: spreadsheetId,
                    resource: {
                        "requests": 
                        [{
                            "deleteRange": 
                            {
                            "range": 
                            {
                                "sheetId": 0, 
                                "startRowIndex": parseInt(key), // A partir de la fila que va a borrar (no incluye)
                                "endRowIndex": parseInt(key) + 1 // Fila a borrar
                            },
                            "shiftDimension": "ROWS"
                            }
                        }]
                    }
                })
            } 
        })
    })
}

const addNewRow = async function (newMember, range) {
    console.log("Nuevo PFA: " + newMember.nickname);
    const rows = await activeSheet.getRows();
    googleSheets.spreadsheets.values.append({
        auth,
        spreadsheetId,
        range: 'RANGOS',
        valueInputOption: 'USER_ENTERED',
        resource: { 
            values: [['', newMember.nickname, newMember.id, new Date().toLocaleString().split(',')[0]]] // Se le agrega con el nombre que esté... cuando se lo cambie será un update
        }
    })
    console.log("add")
}

async function getRows(range) { // El parametro range para cuando tenga que modificar otras hojas
    const rows = await googleSheets.spreadsheets.values.get({
        auth, 
        spreadsheetId,
        range: range,
    })
    return rows
}

async function getRowIdByDID(userID, range) {
    let rowID = 0
    const rows = await getRows(range)
    Object.entries(rows.data.values).forEach(entry => {
        const [key, value] = entry;
        value.forEach(cell => {
            if(cell == userID) 
            rowID = parseInt(key) + 1
        })
    })
    return rowID
}

loginGoogleSuite();

module.exports = {
    loginGoogleSuite,
    modifyRow,
    addNewRow,
    deleteRowByDID,
    modifyNickname,
    getRowIdByDID
}



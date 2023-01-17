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
let document;
async function loginGoogleSuite() {
    document = new GoogleSpreadsheet(spreadsheetId);
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
    await deleteRowByDID(newMember, undefined, false)
    const rowID = await getRowIdByDID(newMember.id, 'RANGOS');
    const lastRowNumberRank = await getLastByRank(role);
    await activeSheet.insertDimension("ROWS", {startIndex: lastRowNumberRank, endIndex: lastRowNumberRank + 1}, true); // El último 'true' copia los estilos de la fila de arriba
    googleSheets.spreadsheets.values.append({
        auth,
        spreadsheetId,
        range: 'RANGOS!B' + (lastRowNumberRank + 1) + ':E' + (lastRowNumberRank + 1),
        valueInputOption: 'USER_ENTERED',
        resource: {
            values: [[ role,
                newMember.nickname === null ? newMember.user.username
                : (newMember.nickname.includes('-') ? newMember.nickname.split('-')[0] : newMember.nickname),
                newMember.id,
                new Date().toLocaleString().split(',')[0] ]]
        }
    })

}

async function getLastByRank(rank) { // obtener el ultimo usuario de cada rango
    const rows = await activeSheet.getRows();
    const pfaInRank = []
    rows.forEach(row => {
        if(row.Rango == rank)  
            pfaInRank.push(row) 
    })
    return pfaInRank[pfaInRank.length - 1]._rowNumber
}


const deleteRowByDID = async function(newMember, role, eliminado) {
    const rows = await getRows('RANGOS') 
    console.log(role)
    Object.entries(rows.data.values).forEach(entry => {
        const [key, value] = entry;
        value.forEach(cell => {
            if(cell == newMember.id) 
            {
                if(eliminado)  
                    addRetiradoExpulsado(newMember, role)
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
    console.log(newMember)
    googleSheets.spreadsheets.values.append({
        auth,
        spreadsheetId,
        range: range,
        valueInputOption: 'USER_ENTERED',
        resource: {
            values: [[ '',
                newMember.nickname === null ? newMember.user.username : newMember.nickname,
                newMember.id,
                new Date().toLocaleString().split(',')[0] ]]
        }
    })
    
    await getRowIdByDID(newMember.id, range)
    console.log("add")
}

async function addRetiradoExpulsado(newMember, role)  {
    console.log("PFA Retirado/Expulda: " + newMember.nickname);
    const sheetRetiradosExpulsados = document.sheetsByIndex[1]
    const rows = await sheetRetiradosExpulsados.getRows()
    const range = "'RETIRADOS/EXPULSADOS'!B" + (rows.length + 1) + ':E' + (rows.length + 2)
    console.log(range)
    await sheetRetiradosExpulsados.insertDimension("ROWS", {startIndex: rows.length + 1, endIndex: rows.length + 2}, true); // El último 'true' copia los estilos de la fila de arriba
    googleSheets.spreadsheets.values.append({
        auth,
        spreadsheetId,
        range: range,
        valueInputOption: 'USER_ENTERED',
        resource: {
            values: [[ role,
                newMember.nickname === null ? newMember.user.username
                : (newMember.nickname.includes('-') ? newMember.nickname.split('-')[0] : newMember.nickname),
                newMember.id,
                new Date().toLocaleString().split(',')[0] ]]
        }
    })
}

async function getRows(range) {
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


